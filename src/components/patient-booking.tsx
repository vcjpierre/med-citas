"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { Medico, Slot } from "@/types";
import { stripePromise } from "@/app/providers";
import {
  Stethoscope, CalendarDays, Clock, User, CreditCard, ChevronLeft,
  CheckCircle2, AlertCircle, ArrowRight, Baby, Bone
} from "lucide-react";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const SPECIALTY_META: Record<string, { icon: typeof Stethoscope; gradient: string }> = {
  Cardiología: { icon: Stethoscope, gradient: "from-rose-500 to-pink-500" },
  Pediatría: { icon: Baby, gradient: "from-sky-500 to-cyan-500" },
  Dermatología: { icon: Bone, gradient: "from-amber-500 to-orange-500" },
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0, 1] as const } },
};

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getNextDays(n: number) {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function StepIndicator({ step }: { step: number }) {
  const labels = ["Médico", "Día", "Hora", "Datos"];
  return (
    <div className="flex items-center gap-3 mb-8">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center gap-3 flex-1">
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <motion.div
              animate={{ backgroundColor: i <= step ? "var(--color-primary)" : "var(--color-border)" }}
              className="w-full h-1 rounded-full"
              transition={{ duration: 0.3 }}
            />
            <motion.span
              animate={{ color: i <= step ? "var(--color-primary)" : "var(--color-border)" }}
              className="text-[10px] font-semibold uppercase tracking-wider"
              transition={{ duration: 0.3 }}
            >
              {label}
            </motion.span>
          </div>
          {i < labels.length - 1 && (
            <motion.div
              animate={{ color: i < step ? "var(--color-primary)" : "var(--color-border)" }}
              className="hidden sm:block"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BackButton({ onClick, label = "Volver" }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors flex items-center gap-1.5 mt-5 font-medium"
    >
      <ChevronLeft className="w-4 h-4" />
      {label}
    </motion.button>
  );
}

function PaymentForm({
  clientSecret,
  onSuccess,
  onBack,
}: {
  clientSecret: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(submitErr.message || "Error de validación");
      setLoading(false);
      return;
    }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (confirmErr) {
      setError(confirmErr.message || "Error al procesar el pago");
      setLoading(false);
      return;
    }

    const paymentIntentId = clientSecret.split("_secret_")[0];
    const res = await fetch("/api/stripe/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId }),
    });
    const result = await res.json();
    setLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || "Error al confirmar la cita");
    }
  }, [stripe, elements, clientSecret, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[var(--color-danger-light)] border border-red-200 text-[var(--color-danger)] text-sm rounded-xl p-3.5 flex items-start gap-2.5 overflow-hidden"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="bg-[var(--color-background)] rounded-xl p-4">
        <PaymentElement />
      </div>
      <motion.button
        type="submit"
        disabled={!stripe || loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white rounded-xl py-3.5 font-semibold text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-[var(--color-primary)]/20"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Procesando...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pagar ahora
          </span>
        )}
      </motion.button>
      <BackButton onClick={onBack} />
    </form>
  );
}

export default function PatientBooking() {
  const [step, setStep] = useState(0);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [motivo, setMotivo] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slotsReady, setSlotsReady] = useState(false);

  useEffect(() => {
    fetch("/api/medicos")
      .then((r) => r.json())
      .then(setMedicos)
      .catch(() => setError("Error al cargar médicos"));
  }, []);

  useEffect(() => {
    if (!selectedMedico || !selectedDate) return;
    let cancelled = false;
    fetch(`/api/slots?medico_id=${selectedMedico.id}&fecha=${formatDate(selectedDate)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) { setSlots(data); setSlotsReady(true); }
      })
      .catch(() => {
        if (!cancelled) { setError("Error al cargar horarios"); setSlotsReady(true); }
      });
    return () => { cancelled = true; };
  }, [selectedMedico, selectedDate]);

  const slotsLoading = step === 2 && selectedMedico && selectedDate && !slotsReady;

  function reset() {
    setStep(0);
    setSelectedMedico(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setNombre("");
    setEmail("");
    setMotivo("");
    setClientSecret(null);
    setSuccess(false);
    setError("");
    setSlots([]);
    setSlotsReady(false);
  }

  function canPay() {
    return selectedMedico && selectedSlot && nombre.trim() && email.includes("@") && motivo.trim();
  }

  async function handleCreatePayment() {
    if (!canPay()) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotId: selectedSlot!.id,
        paciente_nombre: nombre.trim(),
        email: email.trim(),
        motivo: motivo.trim(),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) {
      setError(data.error);
      return;
    }
    setClientSecret(data.clientSecret);
    setStep(4);
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0, 1] as const }}
          >
            <SectionCard className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-[var(--color-primary)] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}
              >
                Cita Confirmada
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-[var(--color-muted)] text-sm mt-2 leading-relaxed"
              >
                Revisa tu correo <strong className="text-[var(--color-foreground)]">{email}</strong> para los detalles y el enlace de Google Calendar.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={reset}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] px-5 py-2.5 rounded-lg transition-all duration-300 shadow-md"
              >
                <CalendarDays className="w-4 h-4" />
                Nueva cita
              </motion.button>
            </SectionCard>
          </motion.div>
        ) : (
          <motion.div
            key="booking"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0 }}
          >
            <StepIndicator step={step} />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[var(--color-danger-light)] border border-red-200 text-[var(--color-danger)] text-sm rounded-xl p-3.5 mb-4 flex items-start gap-2.5 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SectionCard>
                    <motion.h2 variants={itemVariants} className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                      Elige un médico
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-sm text-[var(--color-muted)] mb-5">
                      Selecciona el especialista que necesitas
                    </motion.p>
                    <motion.div variants={itemVariants} className="space-y-3">
                      {medicos.map((m, i) => {
                        const meta = SPECIALTY_META[m.especialidad] || { icon: Stethoscope, gradient: "from-[var(--color-primary)] to-[var(--color-primary-dark)]" };
                        const Icon = meta.icon;
                        return (
                          <motion.button
                            key={m.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.35, ease: [0.25, 0.1, 0, 1] as const }}
                            whileHover={{ scale: 1.01, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setSlotsReady(false); setSelectedSlot(null); setSelectedMedico(m); setStep(1); }}
                            className="w-full text-left flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary-light)] hover:border-[var(--color-primary)]/30 transition-all duration-300 group"
                          >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 shrink-0`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[var(--color-foreground)] text-sm">{m.nombre}</div>
                              <div className="text-xs text-[var(--color-muted)]">{m.especialidad}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[var(--color-primary)]">${m.tarifa}</div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </SectionCard>
                </motion.div>
              )}

              {step === 1 && selectedMedico && (
                <motion.div
                  key="step1"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SectionCard>
                    <motion.h2 variants={itemVariants} className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                      Elige un día
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-sm text-[var(--color-muted)] mb-5">
                      {selectedMedico.nombre} — {selectedMedico.especialidad}
                    </motion.p>
                    <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2.5">
                      {getNextDays(7).map((d, i) => {
                        const fmt = formatDate(d);
                        const todayFmt = formatDate(new Date());
                        const isToday = fmt === todayFmt;
                        const isSelected = selectedDate && formatDate(selectedDate) === fmt;
                        return (
                          <motion.button
                            key={fmt}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setSlotsReady(false); setSelectedSlot(null); setSelectedDate(d); setStep(2); }}
                            className={`rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                              isSelected
                                ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-md"
                                : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-light)]/50"
                            }`}
                          >
                            <div className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                              {DAY_NAMES[d.getDay()]}
                            </div>
                            <div className="text-xl font-bold text-[var(--color-foreground)] mt-0.5">
                              {d.getDate()}
                            </div>
                            <div className="text-[10px] text-[var(--color-muted)] mt-0.5">
                              {MONTH_NAMES[d.getMonth()]}
                            </div>
                            {isToday && (
                              <div className="text-[8px] font-semibold text-[var(--color-primary)] uppercase mt-1">
                                Hoy
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                    <BackButton onClick={() => setStep(0)} />
                  </SectionCard>
                </motion.div>
              )}

              {step === 2 && selectedDate && (
                <motion.div
                  key="step2"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SectionCard>
                    <motion.h2 variants={itemVariants} className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                      Elige una hora
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-sm text-[var(--color-muted)] mb-5 capitalize">
                      <CalendarDays className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                      {selectedDate?.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
                    </motion.p>
                    {slotsLoading ? (
                      <div className="flex justify-center py-10">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Clock className="w-6 h-6 text-[var(--color-primary)]" />
                        </motion.div>
                      </div>
                    ) : (
                      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2.5">
                        {slots.map((s, i) => (
                          <motion.button
                            key={s.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03, duration: 0.25 }}
                            disabled={!s.disponible}
                            whileHover={s.disponible ? { scale: 1.04 } : {}}
                            whileTap={s.disponible ? { scale: 0.96 } : {}}
                            onClick={() => { setSelectedSlot(s); setStep(3); }}
                            className={`rounded-xl border-2 py-3 text-sm font-medium transition-all duration-200 ${
                              !s.disponible
                                ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                                : selectedSlot?.id === s.id
                                  ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-md"
                                  : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-light)]/50 text-[var(--color-foreground)]"
                            }`}
                          >
                            {s.hora}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                    <BackButton onClick={() => setStep(1)} />
                  </SectionCard>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SectionCard>
                    <motion.h2 variants={itemVariants} className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                      Tus datos
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-sm text-[var(--color-muted)] mb-5">
                      Completa tu información para la consulta
                    </motion.p>
                    <motion.div variants={itemVariants} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider block mb-2">
                          Nombre completo
                        </label>
                        <div className="relative">                          
                          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" className="pl-12" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider block mb-2">
                          Email
                        </label>
                        <div className="relative">                          
                          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="correo@ejemplo.com" className="pl-12" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider block mb-2">
                          Motivo de la consulta
                        </label>
                        <textarea
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          rows={3}
                          placeholder="Describe brevemente tu motivo"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="mt-6 bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-background)] rounded-xl p-5 border border-[var(--color-primary)]/20"
                    >
                      <div className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-4">
                        Resumen de tu cita
                      </div>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--color-muted)]">Médico</span>
                          <span className="font-medium text-[var(--color-foreground)]">{selectedMedico?.nombre}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--color-muted)]">Especialidad</span>
                          <span className="font-medium text-[var(--color-foreground)]">{selectedMedico?.especialidad}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--color-muted)]">Fecha</span>
                          <span className="font-medium text-[var(--color-foreground)]">{selectedDate?.toLocaleDateString("es")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--color-muted)]">Hora</span>
                          <span className="font-medium text-[var(--color-foreground)]">{selectedSlot?.hora}</span>
                        </div>
                        <div className="border-t border-[var(--color-primary)]/20 pt-2.5 mt-2.5 flex justify-between">
                          <span className="text-[var(--color-muted)]">Total</span>
                          <span className="font-bold text-[var(--color-primary)] text-lg">${selectedMedico?.tarifa}</span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreatePayment}
                      disabled={!canPay() || loading}
                      className="mt-6 w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white rounded-xl py-3.5 font-semibold text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-[var(--color-primary)]/20"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Procesando...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          {stripePromise ? "Ir a pagar" : "Continuar (dev)"}
                        </span>
                      )}
                    </motion.button>
                    <BackButton onClick={() => setStep(2)} />
                  </SectionCard>
                </motion.div>
              )}

              {step === 4 && clientSecret && stripePromise && (
                <motion.div
                  key="step4"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SectionCard>
                    <motion.h2 variants={itemVariants} className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                      Completa el pago
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-sm text-[var(--color-muted)] mb-5">
                      Ingresa los datos de tu tarjeta para confirmar la cita
                    </motion.p>
                    <motion.div variants={itemVariants}>
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm
                          clientSecret={clientSecret}
                          onSuccess={() => setSuccess(true)}
                          onBack={() => setStep(3)}
                        />
                      </Elements>
                    </motion.div>
                  </SectionCard>
                </motion.div>
              )}

              {step === 4 && clientSecret && !stripePromise && (
                <motion.div
                  key="step4dev"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SectionCard>
                    <motion.div variants={itemVariants} className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4 flex items-start gap-3 mb-4">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <strong>Modo desarrollo</strong> — Define <code className="text-xs bg-amber-100 px-1.5 py-0.5 rounded font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> para activar pagos reales.
                      </div>
                    </motion.div>
                    <motion.button
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        setLoading(true);
                        setError("");
                        const id = clientSecret.split("_secret_")[0];
                        const res = await fetch("/api/stripe/confirm", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ paymentIntentId: id }),
                        });
                        const result = await res.json();
                        setLoading(false);
                        if (result.success) setSuccess(true);
                        else setError(result.error || "Error");
                      }}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl py-3.5 font-semibold text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Procesando...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Simular pago (dev)
                        </span>
                      )}
                    </motion.button>
                    <BackButton onClick={() => setStep(3)} />
                  </SectionCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
