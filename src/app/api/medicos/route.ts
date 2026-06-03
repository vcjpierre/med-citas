import { getMedicos, ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const medicos = await getMedicos();
  return Response.json(medicos);
}
