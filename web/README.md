# web (Bloque 1b/6 — Next.js + Tailwind)

Rutas:
- `/` — landing
- `/dashboard` — panel en vivo, suscrito a `context_events` vía Supabase Realtime (fallback a `lib/mockEvents.ts` si no hay credenciales)

## Setup

```bash
cd web
pnpm install
cp .env.example .env.local   # opcional: credenciales de Supabase
pnpm dev
```

Sin `.env.local`, el dashboard funciona igual con datos de ejemplo — nunca depende del backend para ser demostrable.

## Supabase

Correr `supabase/schema.sql` una vez en el SQL editor del proyecto (crea la tabla `context_events` y la habilita en la publicación de Realtime — sin eso los INSERTs no llegan por websocket).

## Deploy

Vercel, apuntando a `web/` como root del proyecto dentro del monorepo.
