import { NextRequest } from "next/server";
import { getSlots, ensureSchema } from "@/lib/db";

export async function GET(request: NextRequest) {
  await ensureSchema();
  const { searchParams } = new URL(request.url);
  const medicoId = Number(searchParams.get("medico_id"));
  const fecha = searchParams.get("fecha");

  if (!medicoId || !fecha) {
    return Response.json({ error: "medico_id and fecha required" }, { status: 400 });
  }

  const slots = await getSlots(medicoId, fecha);
  return Response.json(slots);
}
