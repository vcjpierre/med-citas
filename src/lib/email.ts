import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function toGoogleCalendarUrl(params: {
  text: string;
  dates: string;
  details: string;
  location: string;
}) {
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.text);
  url.searchParams.set("dates", params.dates);
  url.searchParams.set("details", params.details);
  url.searchParams.set("location", params.location);
  return url.toString();
}

export async function sendConfirmationEmail(params: {
  to: string;
  pacienteNombre: string;
  medicoNombre: string;
  especialidad: string;
  fecha: string;
  hora: string;
  monto: number;
  motivo: string;
}) {
  const startDate = new Date(`${params.fecha}T${params.hora}:00`);
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const icsDates = `${fmt(startDate)}/${fmt(endDate)}`;
  const calendarUrl = toGoogleCalendarUrl({
    text: `Cita: ${params.especialidad} - Dr. ${params.medicoNombre}`,
    dates: icsDates,
    details: `Paciente: ${params.pacienteNombre}\nMotivo: ${params.motivo}\nMonto: $${params.monto}`,
    location: "Consultorio Médico",
  });

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#2563eb">Cita Confirmada</h2>
      <p>Hola <strong>${params.pacienteNombre}</strong>, tu cita ha sido confirmada.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Especialidad</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600">${params.especialidad}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Médico</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600">${params.medicoNombre}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Fecha</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600">${params.fecha}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Hora</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600">${params.hora}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">Motivo</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${params.motivo}</td></tr>
        <tr><td style="padding:8px;color:#6b7280">Monto</td><td style="padding:8px;font-weight:600">$${params.monto}</td></tr>
      </table>
      <a href="${calendarUrl}" target="_blank" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;margin-top:8px">
        Agregar a Google Calendar
      </a>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">Sistema de Reservas de Citas Médicas</p>
    </div>
  `;

  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return;
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: params.to,
    subject: `Cita Confirmada - ${params.especialidad}`,
    html,
  });

  if (error) console.error("Resend error:", error);
}
