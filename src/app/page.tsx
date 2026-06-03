import PatientBooking from "@/components/patient-booking";
import { Shield, Clock, CreditCard } from "lucide-react";

const features = [
  { icon: Shield, text: "Especialistas verificados" },
  { icon: Clock, text: "Reserva en segundos" },
  { icon: CreditCard, text: "Pago 100% seguro" },
];

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[var(--color-primary)]/4 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[var(--color-accent)]/3 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-8 md:pt-16 md:pb-10">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
              Tu salud,
              <br />
              <span className="text-[var(--color-primary)]">nuestra prioridad</span>
            </h1>
            <p className="text-[var(--color-muted)] mt-4 text-sm leading-relaxed max-w-md mx-auto">
              Reserva tu cita médica online con los mejores especialistas.
              Elige tu médico, selecciona el día y horario, y confirma en segundos.
            </p>
          </div>
          <div className="flex items-center justify-center gap-8 mb-10">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                <f.icon className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="px-4 pb-12">
        <PatientBooking />
      </section>
    </main>
  );
}
