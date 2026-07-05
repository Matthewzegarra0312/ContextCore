# web (Bloque 1b/6 — Next.js + Tailwind)

Rutas:
- `/` — landing
- `/login` — login con GitHub (Supabase Auth)
- `/dashboard` — panel en vivo, protegido por `middleware.ts`, suscrito a `context_events` vía Supabase Realtime (fallback a `lib/mockEvents.ts` si no hay credenciales)
- `/cli-login` + `/api/cli/*` — device-code flow para `contextcore login` (ver README raíz)

## Setup

```bash
cd web
pnpm install
cp .env.example .env.local   # opcional: credenciales de Supabase
pnpm dev
```

Sin `.env.local`, el dashboard funciona igual con datos de ejemplo — nunca depende del backend para ser demostrable.

## Supabase

Correr `supabase/schema.sql` una vez en el SQL editor del proyecto (crea `context_events` + `cli_auth_sessions`, habilita `context_events` en la publicación de Realtime — sin eso los INSERTs no llegan por websocket).

Para el login con GitHub:
1. Supabase → Authentication → Providers → GitHub: habilitar y cargar el Client ID/Secret de una GitHub OAuth App (callback: `https://<tu-proyecto>.supabase.co/auth/v1/callback`).
2. Supabase → Authentication → URL Configuration: agregar `https://<tu-deploy>.vercel.app/auth/callback` a las Redirect URLs.
3. Setear `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API) en `web/.env.local` — solo la usan las rutas `/api/cli/*`, nunca llega al browser.

## Deploy

Vercel, apuntando a `web/` como root del proyecto dentro del monorepo.
