# ContextCore

Memoria compartida y viva para agentes de código de equipo. Ver [ContextCore.md](./ContextCore.md) para el plan completo (RAISE Summit Hackathon 2026, Paris, Track Cursor).

## Estructura

```
contextcore/
├─ packages/cli/          # paquete npm "@contextcore/cli" (comando: contextcore) — init / sync / status / log / capture
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

## Demo

```bash
sh scripts/setup-demo.sh   # regenera demo/ con historial real + ContextCore inicializado
```

Ver `docs/demo-script.md` para el guion de los dos actos.

## Estado

Bloques 0–5 completos (CLI, resumen semántico, compilador, automatización git, dashboard, demo). Ver `ContextCore.md` §6 y `docs/publishing.md` para el Bloque 7 (publicar en npm).
