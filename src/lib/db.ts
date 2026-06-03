import { createClient, type Client } from "@libsql/client";
import bcrypt from "bcryptjs";

let db: Client | null = null;

let schemaReady = false;

export function getDb() {
  if (db) return db;

  db = createClient({
    url: process.env.TURSO_DATABASE_URL || "file:data.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return db;
}

export async function ensureSchema() {
  if (schemaReady) return;
  const client = getDb();

  try {
    await client.execute(
      "CREATE TABLE IF NOT EXISTS medicos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, especialidad TEXT NOT NULL, tarifa REAL NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL)"
    );
    await client.execute(
      "CREATE TABLE IF NOT EXISTS slots (id INTEGER PRIMARY KEY AUTOINCREMENT, medico_id INTEGER NOT NULL REFERENCES medicos(id), fecha TEXT NOT NULL, hora TEXT NOT NULL, disponible INTEGER NOT NULL DEFAULT 1)"
    );
    await client.execute(
      "CREATE TABLE IF NOT EXISTS citas (id INTEGER PRIMARY KEY AUTOINCREMENT, slot_id INTEGER NOT NULL REFERENCES slots(id), paciente_nombre TEXT NOT NULL, email TEXT NOT NULL, motivo TEXT NOT NULL, monto REAL NOT NULL, estado TEXT NOT NULL DEFAULT 'pendiente')"
    );
    await client.execute(
      "CREATE TABLE IF NOT EXISTS pending_bookings (order_id TEXT PRIMARY KEY, slot_id INTEGER NOT NULL, medico_id INTEGER NOT NULL, paciente_nombre TEXT NOT NULL, email TEXT NOT NULL, motivo TEXT NOT NULL, monto REAL NOT NULL, created_at TEXT DEFAULT (datetime('now')))"
    );

    const result = await client.execute("SELECT COUNT(*) as c FROM medicos");
    const count = Number(result.rows[0].c);
    if (count === 0) {
      await seedDb(client);
    }

    schemaReady = true;
  } catch (err) {
    console.error("Failed to connect to database:", err);
    throw err;
  }
}

async function seedDb(client: Client) {
  const hash = await bcrypt.hash("pass123", 10);

  await client.execute("INSERT INTO medicos (nombre, especialidad, tarifa, email, password_hash) VALUES (?, ?, ?, ?, ?)", ["Dr. Carlos García", "Cardiología", 80, "carlos@med.com", hash]);
  await client.execute("INSERT INTO medicos (nombre, especialidad, tarifa, email, password_hash) VALUES (?, ?, ?, ?, ?)", ["Dra. Ana López", "Pediatría", 60, "ana@med.com", hash]);
  await client.execute("INSERT INTO medicos (nombre, especialidad, tarifa, email, password_hash) VALUES (?, ?, ?, ?, ?)", ["Dr. Luis Martínez", "Dermatología", 90, "luis@med.com", hash]);

  const horas = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30",
  ];

  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const fecha = date.toISOString().slice(0, 10);

    for (let medicoId = 1; medicoId <= 3; medicoId++) {
      for (const hora of horas) {
        await client.execute("INSERT INTO slots (medico_id, fecha, hora, disponible) VALUES (?, ?, ?, 1)", [medicoId, fecha, hora]);
      }
    }
  }
}

export async function getMedicos() {
  const result = await getDb().execute("SELECT id, nombre, especialidad, tarifa, email FROM medicos");
  return JSON.parse(JSON.stringify(result.rows)) as import("../types").Medico[];
}

export async function getSlots(medicoId: number, fecha: string) {
  const result = await getDb().execute(
    "SELECT id, medico_id, fecha, hora, disponible FROM slots WHERE medico_id = ? AND fecha = ? ORDER BY hora",
    [medicoId, fecha]
  );
  return JSON.parse(JSON.stringify(result.rows)) as import("../types").Slot[];
}

export async function getSlotById(id: number) {
  const result = await getDb().execute("SELECT * FROM slots WHERE id = ?", [id]);
  const row = result.rows[0];
  return row ? JSON.parse(JSON.stringify(row)) as import("../types").Slot : undefined;
}

export async function getMedicoById(id: number) {
  const result = await getDb().execute("SELECT id, nombre, especialidad, tarifa, email FROM medicos WHERE id = ?", [id]);
  const row = result.rows[0];
  return row ? JSON.parse(JSON.stringify(row)) as import("../types").Medico : undefined;
}

export async function getMedicoByEmail(email: string) {
  const result = await getDb().execute("SELECT * FROM medicos WHERE email = ?", [email]);
  const row = result.rows[0];
  return row ? JSON.parse(JSON.stringify(row)) as import("../types").Medico & { password_hash: string } : undefined;
}

export async function savePendingBooking(
  orderId: string,
  slotId: number,
  medicoId: number,
  pacienteNombre: string,
  email: string,
  motivo: string,
  monto: number
) {
  await getDb().execute(
    "INSERT INTO pending_bookings (order_id, slot_id, medico_id, paciente_nombre, email, motivo, monto) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [orderId, slotId, medicoId, pacienteNombre, email, motivo, monto]
  );
}

export async function getPendingBooking(orderId: string) {
  const result = await getDb().execute("SELECT * FROM pending_bookings WHERE order_id = ?", [orderId]);
  const row = result.rows[0];
  return row ? JSON.parse(JSON.stringify(row)) as { order_id: string; slot_id: number; medico_id: number; paciente_nombre: string; email: string; motivo: string; monto: number } : undefined;
}

export async function deletePendingBooking(orderId: string) {
  await getDb().execute("DELETE FROM pending_bookings WHERE order_id = ?", [orderId]);
}

export async function createCita(
  slotId: number,
  pacienteNombre: string,
  email: string,
  motivo: string,
  monto: number
) {
  const result = await getDb().execute(
    "INSERT INTO citas (slot_id, paciente_nombre, email, motivo, monto, estado) VALUES (?, ?, ?, ?, ?, 'confirmada')",
    [slotId, pacienteNombre, email, motivo, monto]
  );
  return Number(result.lastInsertRowid);
}

export async function markSlotOcupado(slotId: number) {
  await getDb().execute("UPDATE slots SET disponible = 0 WHERE id = ?", [slotId]);
}

export async function getCitasByMedico(medicoId: number) {
  const result = await getDb().execute(
    `SELECT c.id, c.paciente_nombre, c.email, c.motivo, c.monto, c.estado,
            s.fecha, s.hora, m.nombre as medico_nombre, m.especialidad
     FROM citas c
     JOIN slots s ON c.slot_id = s.id
     JOIN medicos m ON s.medico_id = m.id
     WHERE s.medico_id = ? AND c.estado = 'confirmada'
     ORDER BY s.fecha DESC, s.hora DESC`,
    [medicoId]
  );
  return JSON.parse(JSON.stringify(result.rows)) as import("../types").CitaView[];
}

export async function citaExistsForSlot(slotId: number): Promise<boolean> {
  const result = await getDb().execute("SELECT id FROM citas WHERE slot_id = ? AND estado = 'confirmada'", [slotId]);
  return result.rows.length > 0;
}
