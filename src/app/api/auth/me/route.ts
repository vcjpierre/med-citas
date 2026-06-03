import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return Response.json({ error: "Token inválido" }, { status: 401 });
  }

  return Response.json({
    medicoId: payload.medicoId,
    nombre: payload.nombre,
    email: payload.email,
  });
}
