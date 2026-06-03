import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export function signToken(payload: { medicoId: number; nombre: string; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as {
      medicoId: number;
      nombre: string;
      email: string;
    };
  } catch {
    return null;
  }
}
