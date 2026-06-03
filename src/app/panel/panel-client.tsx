"use client";

import type { CitaView } from "@/types";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Calendar, Clock, User, Mail, FileText, Inbox } from "lucide-react";

const containerVariants = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0, 1] as const } },
};

export default function PanelClient({
  citas,
  medicoNombre,
}: {
  citas: CitaView[];
  medicoNombre: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const initials = medicoNombre.split(" ").map(w => w[0]).join("").slice(0, 2);

  return (
    <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white flex items-center justify-center font-bold shadow-lg shadow-[var(--color-primary)]/20">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
                {medicoNombre}
              </h1>
              <p className="text-sm text-[var(--color-muted)] flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5" />
                {citas.length} {citas.length === 1 ? "cita confirmada" : "citas confirmadas"}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors flex items-center gap-1.5 bg-white border border-[var(--color-border)] rounded-lg px-3.5 py-2 hover:border-red-200 hover:bg-red-50/50"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </motion.button>
        </motion.div>

        {citas.length === 0 ? (
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[var(--color-border)] shadow-lg p-14 text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--color-background)] flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-[var(--color-muted)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--color-foreground)]" style={{ fontFamily: "var(--font-serif)" }}>
              No tienes citas confirmadas
            </h2>
            <p className="text-[var(--color-muted)] text-sm mt-1.5">
              Cuando un paciente reserve, aparecerá aquí automáticamente.
            </p>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-3">
            {citas.map((cita, i) => (
              <motion.div
                key={cita.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: [0.25, 0.1, 0, 1] as const }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-[var(--color-border)] p-5 hover:border-[var(--color-primary)]/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                      {cita.paciente_nombre.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--color-foreground)] flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0" />
                        <span className="truncate">{cita.paciente_nombre}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--color-muted)]">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {cita.email}
                        </span>
                      </div>
                      <div className="mt-2 flex items-start gap-1.5 text-sm text-[var(--color-muted)]">
                        <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <p className="line-clamp-2">{cita.motivo}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
                      <Clock className="w-3 h-3" />
                      {cita.hora}
                    </div>
                    <div className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {cita.fecha}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
