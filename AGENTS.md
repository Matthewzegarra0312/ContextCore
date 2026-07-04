<!-- Generado por `contextcore sync` — no editar a mano. -->

## Overview

**contextcore-monorepo** — TypeScript.

## Comandos

- `pnpm run build`: pnpm -r --filter=./packages/** build

## Trabajo en curso del equipo

- **matthew-stephano-zegarra-ramos** en `scripts,docs`: Bloque 5: repo demo/ (target de ejemplo con historial real) + guion de los dos actos

## Decisiones recientes

- demo/ es un repo git separado y gitignoreado por el monorepo; se versiona scripts/setup-demo.sh, no el contenido generado, para que cualquiera lo regenere identico
- El commit de housekeeping (init + historial sembrado) deshabilita el hook temporalmente para no ensuciar 'trabajo en curso' con un evento meta
- Paleta categorica del skill dataviz (8 colores validados) para identidad por autor, determinista via hash, nunca reasignada
- Dashboard con fallback a datos de ejemplo (mockEvents) si NEXT_PUBLIC_SUPABASE_URL/ANON_KEY no estan seteados, para poder demostrarlo sin backend
- Modelo claude-haiku-4-5 a proposito (barato/rapido, corre en cada commit del equipo)
- Structured outputs (output_config.format json_schema) en vez de pedirle al modelo que devuelva JSON en texto libre, para no depender de parseo fragil
- CLAUDE.md se escribe como copia real de AGENTS.md, no symlink: en Windows un symlink pide privilegios elevados y esto tiene que andar sin friccion en la demo
- Presupuesto de tokens (~2000): se recortan primero los gotchas mas viejos, luego las decisiones mas viejas; overview y trabajo en curso nunca se truncan

## Gotchas conocidos

- inferModule devolvia solo el primer segmento de ruta (ej. 'src'), demasiado generico para el pitch; se corrigio para usar dos segmentos cuando el primero es un directorio contenedor (src, packages, services, etc.)
- Supabase Realtime es opt-in por tabla: hay que correr 'alter publication supabase_realtime add table context_events' o los INSERTs no llegan por websocket
- Sin el servicio corriendo o SUMMARIZER_URL sin configurar, capture cae solo al fallback local (mensaje de commit) sin romper el commit
- packages/core hay que recompilar (tsc) tras cada cambio de fuente, o el CLI en modo dev via tsx falla con 'no provee export' porque importa desde dist/
- detectStack no detectaba TypeScript en la raiz del monorepo porque solo miraba tsconfig.json y no tsconfig.base.json; corregido sumando ese chequeo

## Boundaries

- No edites `AGENTS.md`, `CLAUDE.md` ni `.cursor/rules/contextcore.mdc` a mano — se regeneran con `contextcore sync`.
- No edites los `.contextcore/*.jsonl` a mano — son append-only, un archivo por autor.
