import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCitasByMedico, ensureSchema } from "@/lib/db";
import PanelClient from "./panel-client";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  await ensureSchema();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyToken(token);
  if (!payload) {
    redirect("/login");
  }

  const citas = await getCitasByMedico(payload.medicoId);

  return <PanelClient citas={citas} medicoNombre={payload.nombre} />;
}
