<!-- Generado por `contextcore sync` — no editar a mano. -->

## Overview

**contextcore-monorepo** — TypeScript.

## Comandos

- `pnpm run build`: pnpm -r --filter=./packages/** build

## Trabajo en curso del equipo

- **matthew-stephano-zegarra-ramos** en `packages/core`: Bloque 3: compilador multi-formato (AGENTS.md, CLAUDE.md, .cursor/rules/contextcore.mdc) con presupuesto de tokens

## Decisiones recientes

- CLAUDE.md se escribe como copia real de AGENTS.md, no symlink: en Windows un symlink pide privilegios elevados y esto tiene que andar sin friccion en la demo
- Presupuesto de tokens (~2000): se recortan primero los gotchas mas viejos, luego las decisiones mas viejas; overview y trabajo en curso nunca se truncan
- Se agrego el comando log (no estaba en el doc original) para poder generar eventos antes de que existan el summarizer y el git hook
- Insert a Supabase es best-effort: si faltan SUPABASE_URL/SUPABASE_ANON_KEY, no-op silencioso, el CLI sigue offline
- ContextEvent minimal: author/timestamp/module/intent/decisions/gotchas, sin campos extra

## Gotchas conocidos

- packages/core hay que recompilar (tsc) tras cada cambio de fuente, o el CLI en modo dev via tsx falla con 'no provee export' porque importa desde dist/
- detectStack no detectaba TypeScript en la raiz del monorepo porque solo miraba tsconfig.json y no tsconfig.base.json; corregido sumando ese chequeo

## Boundaries

- No edites `AGENTS.md`, `CLAUDE.md` ni `.cursor/rules/contextcore.mdc` a mano — se regeneran con `contextcore sync`.
- No edites los `.contextcore/*.jsonl` a mano — son append-only, un archivo por autor.
