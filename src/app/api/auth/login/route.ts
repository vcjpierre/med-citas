import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getMedicoByEmail, ensureSchema } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await ensureSchema();
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }

  const medico = await getMedicoByEmail(email);
  if (!medico) {
    return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const valid = bcrypt.compareSync(password, medico.password_hash);
  if (!valid) {
    return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = signToken({
    medicoId: medico.id,
    nombre: medico.nombre,
    email: medico.email,
  });

  const response = NextResponse.json({ success: true, nombre: medico.nombre });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
