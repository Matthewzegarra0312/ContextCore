# ContextCore

Memoria compartida y viva para agentes de código de equipo. Ver [ContextCore.md](./ContextCore.md) para el plan completo (RAISE Summit Hackathon 2026, Paris, Track Cursor).

## Estructura

```
contextcore/
├─ packages/cli/          # paquete npm "@contextcore/cli" (comando: contextcore) — init / sync / status / log / capture / login / logout
├─ packages/core/         # paquete npm "@contextcore/core" — motor de compilación
├─ services/summarizer/   # FastAPI: diff -> evento (Python, opcional)
├─ web/                   # Next.js + Tailwind: landing (/) + dashboard (/dashboard)
├─ demo/                  # repo de ejemplo (git separado, gitignoreado) para la demo split-screen
├─ scripts/setup-demo.sh  # regenera demo/ de forma reproducible
├─ docs/                  # guion de la demo, checklist de publicación
└─ .contextcore/          # logs append-only por dev (<autor>.jsonl)
```

## Setup

```bash
pnpm install
pnpm --filter @contextcore/cli dev -- init
```

## Login (guía paso a paso)

Login con GitHub para el dashboard (`web/`) y para el CLI (`contextcore login`, estilo `gh auth
login`). Es 100% opcional — sin hacer nada de esto, el CLI sigue funcionando offline y el dashboard
sigue mostrando datos de ejemplo. Esta guía es para habilitarlo de verdad.

### 1. Crear la GitHub OAuth App

En GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**:

| Campo | Valor |
|---|---|
| Application name | `ContextCore` (o el que quieras) |
| Homepage URL | `http://localhost:3000` (cosmético, se puede cambiar después) |
| Authorization callback URL | `https://<tu-proyecto>.supabase.co/auth/v1/callback` |
| Enable Device Flow | Dejar **desmarcado** |

Dale **Register application**. Copia el **Client ID** (visible de una) y genera un **Client
Secret** con el botón "Generate a new client secret" (solo se muestra una vez — cópialo ya).

### 2. Habilitar el provider en Supabase

Supabase → **Authentication → Sign In / Providers** → busca **GitHub** → actívalo → pega el
Client ID y el Client Secret del paso 1 → **Save**.

### 3. Correr el schema en Supabase

Supabase → **SQL Editor** → pega y corre [supabase/schema.sql](./supabase/schema.sql) completo
(crea `context_events` si no existe, y `cli_auth_sessions`, la tabla que usa el device-code flow
del CLI).

### 4. Conseguir la Service Role Key

Supabase → **Project Settings → API** → sección "Project API keys" → copia la que dice
**`service_role`** (⚠️ es secreta, distinta al `anon`/`publishable` key). Agrégala a
`web/.env.local` (nunca con prefijo `NEXT_PUBLIC_`, nunca al repo):

```bash
# web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
```

### 5. Redirect URLs en Supabase

Supabase → **Authentication → URL Configuration → Redirect URLs** → agrega (una por línea):

```
http://localhost:3000/auth/callback
https://tu-app.vercel.app/auth/callback   # cuando despliegues, ver más abajo
```

### 6. Probar el login del dashboard

```bash
cd web && pnpm install && pnpm dev
```

Abre `http://localhost:3000/login` → **Continuar con GitHub** → deberías terminar en
`/dashboard` ya logueado (con tu usuario y botón de "Cerrar sesión" arriba a la derecha).

### 7. Probar el login del CLI

Con `web` corriendo (paso 6):

```bash
pnpm --filter @contextcore/cli dev -- login
```

El CLI imprime un link (`http://localhost:3000/cli-login?code=...`) y un código corto, abre el
navegador solo. Como ya iniciaste sesión en el paso 6, solo hace falta confirmar que el código
coincide y hacer clic en "Autorizar CLI" — el CLI detecta la autorización por polling y guarda la
sesión en `~/.contextcore/credentials.json`. Desde ahí, cualquier `contextcore log`/`capture`
usa tu usuario de GitHub como autor y sincroniza autenticado.

```bash
pnpm --filter @contextcore/cli dev -- logout   # borra la sesión, vuelve al modo anónimo/offline
```

> Nota: `pnpm --filter @contextcore/cli dev -- <comando>` solo sirve para probar dentro de este
> monorepo. Para probar en un proyecto externo real, hay que compilar y enlazar el CLI global:
> `pnpm --filter @contextcore/cli run build && cd packages/cli && pnpm link --global` (una vez
> hecho, el comando `contextcore` en cualquier carpeta de tu PC usa este build local en vez de la
> versión publicada en npm).

### 8. Al desplegar a Vercel

- Agrega las mismas tres variables del paso 4 como Environment Variables del proyecto en Vercel.
- Agrega `https://tu-app.vercel.app/auth/callback` a los Redirect URLs de Supabase (paso 5) — no
  hace falta tocar nada en GitHub, el callback ahí siempre apunta a Supabase, nunca a Vercel.
- Setea `CONTEXTCORE_WEB_URL=https://tu-app.vercel.app` en el `.env` de quien vaya a usar
  `contextcore login` apuntando a producción (por defecto usa `http://localhost:3000`).

## Demo

```bash
sh scripts/setup-demo.sh   # regenera demo/ con historial real + ContextCore inicializado
```

Ver `docs/demo-script.md` para el guion de los dos actos.

## Estado

Bloques 0–5 completos (CLI, resumen semántico, compilador, automatización git, dashboard, demo). Ver `ContextCore.md` §6 y `docs/publishing.md` para el Bloque 7 (publicar en npm).
 YA KCHE YA