import type { Metadata } from "next";
import Link from "next/link";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Stethoscope, Calendar } from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedCitas — Consulta médica privada",
  description: "Reserva tu cita médica online con los mejores especialistas",
};

function Header() {
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
            <span className="text-[var(--color-foreground)]">Med</span>
            <span className="text-[var(--color-primary)]">Citas</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-all duration-300 relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-[var(--color-primary)] after:transition-all after:duration-300 hover:after:w-full"
          >
            Médicos
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.97]"
          >
            <Calendar className="w-4 h-4" />
            Reservar cita
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <Stethoscope className="w-4 h-4" />
          <span>MedCitas &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-[var(--color-muted)]">
          <span>Atención al paciente</span>
          <span>Privacidad</span>
          <span>Términos</span>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh flex flex-col antialiased">
        <div className="noise-overlay" />
        <Header />
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  );
}
