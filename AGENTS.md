<!-- Generado por `contextcore sync` — no editar a mano. -->

## Overview

**contextcore-monorepo** — TypeScript.

## Comandos

- `pnpm run build`: pnpm -r --filter=./packages/** build

## Trabajo en curso del equipo

- **matthew-stephano-zegarra-ramos** en `web/components/ActivityCard.tsx`: Añadido un comentario para validar el resumen IA

## Decisiones recientes

- Se agrego dotenv al CLI y python-dotenv al summarizer: sin esto, crear un .env no tenia ningun efecto, ni Node ni Python lo cargan solos
- El paquete del CLI paso de 'contextcore' (unscoped) a '@contextcore/cli' (scoped) porque npm bloqueo el nombre unscoped por similitud con el paquete existente 'context-core'
- El paquete del CLI se renombro de @contextcore/cli a contextcore (sin scope) para que npx contextcore init funcione tal cual promete el pitch
- @contextcore/core tambien se publica (publishConfig access public) porque el CLI lo necesita en runtime, no solo en el monorepo
- demo/ es un repo git separado y gitignoreado por el monorepo; se versiona scripts/setup-demo.sh, no el contenido generado, para que cualquiera lo regenere identico
- El commit de housekeeping (init + historial sembrado) deshabilita el hook temporalmente para no ensuciar 'trabajo en curso' con un evento meta
- Paleta categorica del skill dataviz (8 colores validados) para identidad por autor, determinista via hash, nunca reasignada
- Dashboard con fallback a datos de ejemplo (mockEvents) si NEXT_PUBLIC_SUPABASE_URL/ANON_KEY no estan seteados, para poder demostrarlo sin backend

## Gotchas conocidos

- Supabase a veces activa RLS solo al crear una tabla desde el SQL editor; con RLS activado y sin politicas, tanto el insert del CLI como el select del dashboard quedan bloqueados por default
- Correr todo el schema.sql de una vez falla si una linea ya se aplico antes (alter publication no es idempotente) y aborta la transaccion completa, incluyendo lineas posteriores que si hacian falta
- npm exige 2FA para publicar y el scope @contextcore debe existir como organizacion antes de publicar bajo el, o falla con 404 Scope notfound
- Tras un publish exitoso, 'npm view' puede devolver 404 por unos segundos hasta que el registro propaga — no es que el publish fallo
- pnpm publish (no npm publish) es obligatorio en packages/cli: solo pnpm reescribe la dependencia workspace:* a un rango de version real al publicar
- @contextcore/core debe publicarse antes que contextcore, o npm install fallaria buscando una version de core que todavia no existe en el registro
- inferModule devolvia solo el primer segmento de ruta (ej. 'src'), demasiado generico para el pitch; se corrigio para usar dos segmentos cuando el primero es un directorio contenedor (src, packages, services, etc.)
- Supabase Realtime es opt-in por tabla: hay que correr 'alter publication supabase_realtime add table context_events' o los INSERTs no llegan por websocket

## Boundaries

- No edites `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/contextcore.mdc` ni `.contextcore/context.md` a mano — se regeneran con `contextcore sync`.
- No edites `.contextcore/context.jsonl` a mano — es append-only y compartido por todo el equipo (cada línea incluye el autor).
