import { NextRequest } from "next/server";
import { getSlotById, getMedicoById, savePendingBooking, ensureSchema } from "@/lib/db";
import { getStripeInstance, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  await ensureSchema();
  if (!isStripeConfigured()) {
    return Response.json({ error: "Stripe no configurado" }, { status: 400 });
  }

  const { slotId, paciente_nombre, email, motivo } = await request.json();

  if (!slotId || !paciente_nombre || !email || !motivo) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const slot = await getSlotById(slotId);
  if (!slot || !slot.disponible) {
    return Response.json({ error: "Slot no disponible" }, { status: 400 });
  }

  const medico = await getMedicoById(slot.medico_id);
  if (!medico) {
    return Response.json({ error: "Médico no encontrado" }, { status: 404 });
  }

  const monto = medico.tarifa;

  const paymentIntent = await getStripeInstance()!.paymentIntents.create({
    amount: Math.round(monto * 100),
    currency: "usd",
    metadata: {
      slot_id: String(slotId),
      medico_id: String(medico.id),
      paciente_nombre,
      email,
      motivo,
    },
  });

  await savePendingBooking(
    paymentIntent.id,
    slotId,
    medico.id,
    paciente_nombre,
    email,
    motivo,
    monto
  );

  return Response.json({ clientSecret: paymentIntent.client_secret });
}
