# ContextCore

Memoria compartida y viva para agentes de código de equipo. Ver [ContextCore.md](./ContextCore.md) para el plan completo (RAISE Summit Hackathon 2026, Paris, Track Cursor).

## Cómo agregar ContextCore a tu proyecto (guía paso a paso)

Esta sección es para usar ContextCore en **cualquier repo tuyo**, no para desarrollar este monorepo (para eso ver [Desarrollo de este monorepo](#desarrollo-de-este-monorepo) más abajo).

### 1. Instalar e inicializar

Dentro de la carpeta de tu proyecto (debe tener `git init` ya hecho):

```bash
npm install -D @contextcore/cli
npx contextcore init
```

O en un solo paso sin agregar al `package.json`:

```bash
npx @contextcore/cli init
```

**¿Cuándo se baja el modelo de IA (~1GB)?** No va dentro del paquete npm (sería enorme). Se descarga sola desde Hugging Face y se cachea en `~/.contextcore/models/` (una vez por máquina, no por proyecto):

- Al hacer `npm install -D @contextcore/cli` (script `postinstall` del paquete publicado en npm).
- Al correr `npx @contextcore/cli init` (por si el postinstall falló o usaste solo `npx` sin install).

> Necesitás la versión **0.1.1+** en npm con IA local embebida. Si instalaste `@contextcore/cli@0.1.0`, no trae esto — actualizá o publicá la nueva versión (ver `docs/publishing.md`).

> Si vas a usar el comando `contextcore` seguido (no `npx`), el `npm install -D @contextcore/cli` de arriba ya alcanza.

### Qué hace `init` (además de la descarga del modelo)

- Detecta tu stack (lenguajes, frameworks, gestor de paquetes).
- Crea `.contextcore/` (log de eventos `context.jsonl` + vista completa `context.md`).
- Instala el hook `post-commit` — de ahí en adelante, **cada commit dispara automáticamente** `contextcore capture` + `contextcore sync`.
- Reintenta la descarga del modelo si el `postinstall` de `npm install` no la completó (idempotente).
- En el monorepo de ContextCore, `pnpm install` ya instala el hook vía `prepare` (sin descargar el modelo en cada install de dev).

### 2. Uso del día a día (automático)

No hay que hacer nada especial: seguís usando `git commit` como siempre.

```
git commit -m "tu mensaje"
        │
        ▼
  hook post-commit (instalado en el paso 1)
        │
        ├─▶ contextcore capture   (resume el diff: con IA local si está disponible, o con el
        │                          mensaje del commit + trailers `decision:`/`gotcha:` como fallback)
        └─▶ contextcore sync      (regenera AGENTS.md, CLAUDE.md, .cursor/rules/, .contextcore/context.md)
```

`AGENTS.md`/`CLAUDE.md`/`.cursor/rules/contextcore.mdc` quedan siempre al día con lo que el equipo hizo de verdad, para que cualquier agente de código (Cursor, Claude Code, etc.) los lea como contexto persistente.

### 3. Desactivar (parcial o totalmente)

Todo en ContextCore es **best-effort**: si algo no está configurado, se cae a un modo más simple en vez de romper el commit.

| Querés desactivar... | Cómo |
|---|---|
| Solo la IA local (queda el fallback con el mensaje del commit) | Variable de entorno `CONTEXTCORE_AI=off` (también valen `false`/`0`) antes de `init` o de cualquier commit. Poniéndola en un `.env` en la raíz del proyecto alcanza. Ni descarga el modelo ni corre inferencia — cero uso de disco/CPU de más. |
| La sincronización con Supabase (dashboard en vivo) | No definas `SUPABASE_URL`/`SUPABASE_ANON_KEY`. Sin esas variables, todo queda 100% local en `.contextcore/*.jsonl` y `.contextcore/context.md`. |
| El login de GitHub / CLI | Simplemente no corras `contextcore login`. Sin sesión, el autor de los eventos se toma de `git config user.name` (o de `CONTEXTCORE_AUTHOR`, ver `.env.example`). |
| Todo ContextCore en el proyecto | Borrá `.contextcore/`, y en `.git/hooks/post-commit` quitá (o borrá el archivo entero si no tenés otro hook) las líneas marcadas con `# contextcore-hook`. |

Para **reactivar** la IA local después de haberla desactivado (o si la primera descarga falló, ej. sin internet), sacá `CONTEXTCORE_AI=off` y volvé a correr `npx @contextcore/cli init` — es idempotente, no reinstala el hook si ya está y solo reintenta la descarga del modelo.

### 4. Login opcional (dashboard en vivo)

Sin login, todo funciona igual (offline, con `.contextcore/context.md` como fuente de verdad). El login solo suma el dashboard web en tiempo real:

```bash
contextcore login    # abre el navegador, dispositivo-code flow (como `gh auth login`)
contextcore logout   # cierra la sesión, vuelve al modo anónimo/offline
```

Si el dashboard no corre en `http://localhost:3000` (por ejemplo, ya está desplegado en Vercel), seteá antes `CONTEXTCORE_WEB_URL=https://tu-app.vercel.app`. Ver la sección [Login (guía paso a paso)](#login-guía-paso-a-paso) más abajo si además querés desplegar tu propia instancia del dashboard con GitHub OAuth + Supabase.

### Comandos disponibles

| Comando | Qué hace |
|---|---|
| `contextcore init` | Detecta el stack, crea `.contextcore/`, instala el hook de git, descarga el modelo de IA local |
| `contextcore capture` | Registra un evento a partir del último commit (IA local o fallback) |
| `contextcore sync` | Recompila `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/` y `.contextcore/context.md` |
| `contextcore status` | Última actividad por autor |
| `contextcore log` | Registra un evento a mano (`--module`, `--intent`, `--decision`, `--gotcha`, `--change`) |
| `contextcore login` / `logout` | Inicia/cierra sesión con GitHub para el dashboard en vivo |

## Estructura

```
contextcore/
├─ packages/cli/          # paquete npm "@contextcore/cli" (comando: contextcore) — init / sync / status / log / capture / login / logout
├─ packages/core/         # paquete npm "@contextcore/core" — motor de compilación + IA local embebida (node-llama-cpp)
├─ web/                   # Next.js + Tailwind: landing (/) + dashboard (/dashboard)
├─ demo/                  # repo de ejemplo (git separado, gitignoreado) para la demo split-screen
├─ scripts/setup-demo.sh  # regenera demo/ de forma reproducible
├─ docs/                  # guion de la demo, checklist de publicación
└─ .contextcore/          # context.jsonl (log compartido, append-only) + context.md (vista compilada)
```

## Desarrollo de este monorepo

> Esto es para contribuir a ContextCore. Si solo querés *usarlo* en tu proyecto, ver la guía de arriba.

```bash
pnpm install
pnpm --filter @contextcore/cli dev -- init
```

## Login (guía paso a paso)

Esta guía es para quien **despliega su propia instancia** del dashboard (`web/`) — configurar la
GitHub OAuth App y Supabase para habilitar `contextcore login` (estilo `gh auth login`) y el login
del dashboard de verdad. Es 100% opcional — sin hacer nada de esto, el CLI sigue funcionando offline
y el dashboard sigue mostrando datos de ejemplo.

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
..........