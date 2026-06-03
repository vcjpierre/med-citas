import { NextRequest } from "next/server";
import { getStripeInstance } from "@/lib/stripe";
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
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "Missing signature" }, { status: 401 });
  }

  let event;
  try {
    event = getStripeInstance()!.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.type !== "payment_intent.succeeded") {
    return Response.json({ received: true });
  }

  const paymentIntent = event.data.object;
  const paymentIntentId = paymentIntent.id;

  const pending = await getPendingBooking(paymentIntentId);
  if (!pending) {
    return Response.json({ received: true });
  }

  if (await citaExistsForSlot(pending.slot_id)) {
    await deletePendingBooking(paymentIntentId);
    return Response.json({ received: true });
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

  return Response.json({ received: true });
}
