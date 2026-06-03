import { NextRequest } from "next/server";
import {
  getPendingBooking,
  createCita,
  markSlotOcupado,
  deletePendingBooking,
  citaExistsForSlot,
  getSlotById,
  getMedicoById,
  ensureSchema,
} from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  await ensureSchema();
  const { paymentIntentId } = await request.json();

  if (!paymentIntentId) {
    return Response.json({ error: "paymentIntentId required" }, { status: 400 });
  }

  const pending = await getPendingBooking(paymentIntentId);
  if (!pending) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  if (await citaExistsForSlot(pending.slot_id)) {
    await deletePendingBooking(paymentIntentId);
    return Response.json({ error: "Slot already booked" }, { status: 409 });
  }

  await createCita(
    pending.slot_id,
    pending.paciente_nombre,
    pending.email,
    pending.motivo,
    pending.monto
  );
  await markSlotOcupado(pending.slot_id);
  await deletePendingBooking(paymentIntentId);

  const slot = await getSlotById(pending.slot_id);
  const medico = slot ? await getMedicoById(slot.medico_id) : null;

  if (medico && slot) {
    await sendConfirmationEmail({
      to: pending.email,
      pacienteNombre: pending.paciente_nombre,
      medicoNombre: medico.nombre,
      especialidad: medico.especialidad,
      fecha: slot.fecha,
      hora: slot.hora,
      monto: pending.monto,
      motivo: pending.motivo,
    });
  }

  return Response.json({ success: true });
}
