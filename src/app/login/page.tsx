"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0, 1] as const } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0, 1] as const } },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => {
      if (r.ok) router.replace("/panel");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) {
      setError(data.error);
    } else {
      router.push("/panel");
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--color-primary)]/3 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[var(--color-accent)]/3 blur-3xl" />
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={stagger}
        className="w-full max-w-sm relative"
      >
        <motion.div variants={fadeUp} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--color-primary)]/20">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
            Acceso Médicos
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1.5">
            Ingresa con tu email y contraseña
          </p>
        </motion.div>

        <motion.form
          variants={scaleIn}
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[var(--color-border)] shadow-xl p-7 space-y-5"
        >
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

          <div>
            <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider block mb-2">
              Email
            </label>
            <div className="relative">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="medico@ejemplo.com"
                className="pl-12"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider block mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPw ? "text" : "password"}
                required
                placeholder="••••••••"
                className="pl-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
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
                Ingresando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                Ingresar
              </span>
            )}
          </motion.button>

          <div className="pt-2 text-center">
            <p className="text-xs text-[var(--color-muted)]">
              ¿Eres paciente?{" "}
              <Link href="/" className="text-[var(--color-primary)] font-medium hover:underline">
                Reserva una cita
              </Link>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </main>
  );
}
