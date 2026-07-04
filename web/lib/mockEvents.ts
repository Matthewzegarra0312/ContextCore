import type { ContextEventRow } from "./types";

// Datos de ejemplo — se muestran solo cuando NEXT_PUBLIC_SUPABASE_URL /
// NEXT_PUBLIC_SUPABASE_ANON_KEY no están configurados, para que el
// dashboard sea demostrable sin backend. Basado en el trabajo real de
// los primeros bloques de ContextCore (dogfooding).
const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

export const mockEvents: ContextEventRow[] = [
  {
    author: "daniel",
    timestamp: minutesAgo(2),
    module: "web/dashboard",
    intent: "Suscripción a Supabase Realtime + estado de conexión en vivo",
    decisions: ["Fallback a datos de ejemplo si no hay credenciales de Supabase"],
    gotchas: [],
  },
  {
    author: "ana",
    timestamp: minutesAgo(9),
    module: "packages/core",
    intent: "Bloque 2: servicio FastAPI de resumen semántico + integración best-effort en contextcore capture",
    decisions: [
      "Modelo claude-haiku-4-5 a propósito (barato/rápido, corre en cada commit del equipo)",
      "Structured outputs (json_schema) en vez de texto libre",
    ],
    gotchas: ["Sin el servicio corriendo, capture cae solo al fallback local sin romper el commit"],
  },
  {
    author: "matthew",
    timestamp: minutesAgo(14),
    module: "packages/core,packages/cli",
    intent: "Bloque 4: automatización git (hook local + GitHub Action)",
    decisions: ["Único escritor del compilado es la GitHub Action, no el hook local"],
    gotchas: ["Comitear dentro del post-commit crea un loop; el hook nunca comitea"],
  },
  {
    author: "matthew",
    timestamp: minutesAgo(20),
    module: "packages/core",
    intent: "Bloque 3: compilador multi-formato (AGENTS.md, CLAUDE.md, .cursor/rules) con presupuesto de tokens",
    decisions: ["CLAUDE.md es copia real de AGENTS.md, no symlink (Windows)"],
    gotchas: [],
  },
];
