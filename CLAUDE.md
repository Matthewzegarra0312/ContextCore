<!-- Generado por `contextcore sync` — no editar a mano. -->

## Overview

**contextcore-monorepo** — TypeScript.

## Comandos

- `pnpm run build`: pnpm -r --filter=./packages/** build

## Trabajo en curso del equipo

- **matthew-stephano-zegarra-ramos** en `services/summarizer,packages/core`: Bloque 2: servicio FastAPI de resumen semantico + integracion best-effort en contextcore capture

## Decisiones recientes

- Modelo claude-haiku-4-5 a proposito (barato/rapido, corre en cada commit del equipo)
- Structured outputs (output_config.format json_schema) en vez de pedirle al modelo que devuelva JSON en texto libre, para no depender de parseo fragil
- CLAUDE.md se escribe como copia real de AGENTS.md, no symlink: en Windows un symlink pide privilegios elevados y esto tiene que andar sin friccion en la demo
- Presupuesto de tokens (~2000): se recortan primero los gotchas mas viejos, luego las decisiones mas viejas; overview y trabajo en curso nunca se truncan
- Se agrego el comando log (no estaba en el doc original) para poder generar eventos antes de que existan el summarizer y el git hook
- Insert a Supabase es best-effort: si faltan SUPABASE_URL/SUPABASE_ANON_KEY, no-op silencioso, el CLI sigue offline
- ContextEvent minimal: author/timestamp/module/intent/decisions/gotchas, sin campos extra

## Gotchas conocidos

- Sin el servicio corriendo o SUMMARIZER_URL sin configurar, capture cae solo al fallback local (mensaje de commit) sin romper el commit
- packages/core hay que recompilar (tsc) tras cada cambio de fuente, o el CLI en modo dev via tsx falla con 'no provee export' porque importa desde dist/
- detectStack no detectaba TypeScript en la raiz del monorepo porque solo miraba tsconfig.json y no tsconfig.base.json; corregido sumando ese chequeo

## Boundaries

- No edites `AGENTS.md`, `CLAUDE.md` ni `.cursor/rules/contextcore.mdc` a mano — se regeneran con `contextcore sync`.
- No edites los `.contextcore/*.jsonl` a mano — son append-only, un archivo por autor.
