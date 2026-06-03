# MedCitas — Sistema de reserva de citas médicas

Plataforma web para que pacientes reserven citas médicas online con especialistas y paguen mediante Stripe. Los médicos tienen un panel privado para ver sus citas confirmadas.

## Tecnologías

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Framer Motion** — animaciones y transiciones
- **Lucide React** — iconografía
- **SQLite** (better-sqlite3) — base de datos
- **Stripe** — pagos con tarjeta
- **Resend** — emails de confirmación
- **bcryptjs + jsonwebtoken** — autenticación de médicos

## Funcionalidades

- **Pacientes**: explorar médicos por especialidad, seleccionar fecha y hora, completar datos personales, pagar con Stripe, recibir email de confirmación con enlace a Google Calendar.
- **Médicos**: login con email y contraseña, panel con citas confirmadas ordenadas por fecha.
- **Autenticación**: JWT en cookies HttpOnly.

## Empezar

```bash
git clone <repo>
cd med-citas
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Renombrar `.env.example` a `.env` y completar:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe (test mode) |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (test mode) |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe |
| `RESEND_API_KEY` | API key de Resend para emails |
| `EMAIL_FROM` | Dirección remitente de emails |
| `JWT_SECRET` | Secreto para firmar tokens JWT |

## Credenciales de médicos (desarrollo)

| Nombre | Especialidad | Email | Contraseña |
|---|---|---|---|
| Dr. Carlos García | Cardiología | `carlos@med.com` | `pass123` |
| Dra. Ana López | Pediatría | `ana@med.com` | `pass123` |
| Dr. Luis Martínez | Dermatología | `luis@med.com` | `pass123` |

## Diseño

Estética **lujo clínico cálido**: paleta verde-teal profundo (#1a6b5a) sobre fondos crema, con acentos dorados. Tipografía Playfair Display (serif) para títulos y Plus Jakarta Sans para cuerpo. Animaciones sutiles con Framer Motion y overlay de ruido para profundidad.

## Licencia

MIT
