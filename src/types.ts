export interface Medico {
  id: number;
  nombre: string;
  especialidad: string;
  tarifa: number;
  email: string;
}

export interface Slot {
  id: number;
  medico_id: number;
  fecha: string;
  hora: string;
  disponible: number;
}

export interface Cita {
  id: number;
  slot_id: number;
  paciente_nombre: string;
  email: string;
  motivo: string;
  monto: number;
  estado: "pendiente" | "confirmada" | "cancelada";
}

export interface CitaView extends Cita {
  medico_nombre: string;
  especialidad: string;
  fecha: string;
  hora: string;
}
