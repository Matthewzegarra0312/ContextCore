# ContextCore

Memoria compartida y viva para agentes de código de equipo. Ver [ContextCore.md](./ContextCore.md) para el plan completo (RAISE Summit Hackathon 2026, Paris, Track Cursor).

## Estructura

```
contextcore/
├─ packages/cli/          # binario contextcore (TS) — init / sync / status
├─ packages/core/         # tipos compartidos + motor de compilación (TS)
├─ services/summarizer/   # FastAPI: diff -> evento (Python, opcional)
├─ web/                   # Next.js + Tailwind: landing (/) + dashboard (/dashboard)
├─ demo/                  # repo de ejemplo para la demo split-screen
└─ .contextcore/          # logs append-only por dev (<autor>.jsonl)
```

## Setup

```bash
pnpm install
pnpm --filter @contextcore/cli dev -- init
```

## Estado

Bloque 0 (setup + contrato del evento) completo. Ver tabla de bloques en `ContextCore.md` §6.
