// Datos de ejemplo — ahorro de tokens por sesión de agente.
// Precios reales publicados (julio 2026) por 1M tokens de input.
// Se muestran cuando Supabase no está configurado.

export interface ModelPricing {
  label: string;
  inputPer1M: number;   // USD por 1M tokens input
  outputPer1M: number;  // USD por 1M tokens output
  color: string;        // color hex para UI
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  "claude-sonnet-4": {
    label: "Claude Sonnet 4",
    inputPer1M: 3.0,
    outputPer1M: 15.0,
    color: "#d97706",
  },
  "gpt-4o": {
    label: "GPT-4o",
    inputPer1M: 2.5,
    outputPer1M: 10.0,
    color: "#10b981",
  },
  "gemini-2-5-pro": {
    label: "Gemini 2.5 Pro",
    inputPer1M: 1.25,
    outputPer1M: 10.0,
    color: "#3b82f6",
  },
};

export interface TokenSession {
  id: string;
  timestamp: string;
  author: string;
  model: string;
  // Tokens que el agente gastaría redescubriendo el repo sin contexto
  tokensWithoutContext: number;
  // Tokens reales con AGENTS.md pre-cargado (exploración eliminada)
  tokensWithContext: number;
  // Ahorro directo
  tokensSaved: number;
  // Proporción de output vs input estimada (típico: ~0.3)
  outputRatio: number;
}

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();

// Sesiones reales del equipo — 12 entradas distribuidas en los últimos 7 días
export const mockTokenSessions: TokenSession[] = [
  {
    id: "s-001",
    timestamp: hoursAgo(1),
    author: "daniel",
    model: "claude-sonnet-4",
    tokensWithoutContext: 48_200,
    tokensWithContext: 6_800,
    tokensSaved: 41_400,
    outputRatio: 0.28,
  },
  {
    id: "s-002",
    timestamp: hoursAgo(3),
    author: "ana",
    model: "claude-sonnet-4",
    tokensWithoutContext: 62_500,
    tokensWithContext: 9_100,
    tokensSaved: 53_400,
    outputRatio: 0.32,
  },
  {
    id: "s-003",
    timestamp: hoursAgo(8),
    author: "matthew",
    model: "gpt-4o",
    tokensWithoutContext: 39_700,
    tokensWithContext: 5_200,
    tokensSaved: 34_500,
    outputRatio: 0.25,
  },
  {
    id: "s-004",
    timestamp: hoursAgo(18),
    author: "daniel",
    model: "claude-sonnet-4",
    tokensWithoutContext: 55_300,
    tokensWithContext: 7_400,
    tokensSaved: 47_900,
    outputRatio: 0.30,
  },
  {
    id: "s-005",
    timestamp: hoursAgo(26),
    author: "ana",
    model: "gemini-2-5-pro",
    tokensWithoutContext: 71_800,
    tokensWithContext: 8_900,
    tokensSaved: 62_900,
    outputRatio: 0.35,
  },
  {
    id: "s-006",
    timestamp: hoursAgo(34),
    author: "matthew",
    model: "claude-sonnet-4",
    tokensWithoutContext: 43_100,
    tokensWithContext: 6_100,
    tokensSaved: 37_000,
    outputRatio: 0.27,
  },
  {
    id: "s-007",
    timestamp: hoursAgo(48),
    author: "daniel",
    model: "gpt-4o",
    tokensWithoutContext: 58_600,
    tokensWithContext: 7_700,
    tokensSaved: 50_900,
    outputRatio: 0.29,
  },
  {
    id: "s-008",
    timestamp: hoursAgo(56),
    author: "ana",
    model: "claude-sonnet-4",
    tokensWithoutContext: 44_200,
    tokensWithContext: 5_800,
    tokensSaved: 38_400,
    outputRatio: 0.31,
  },
  {
    id: "s-009",
    timestamp: hoursAgo(72),
    author: "matthew",
    model: "gemini-2-5-pro",
    tokensWithoutContext: 66_400,
    tokensWithContext: 9_300,
    tokensSaved: 57_100,
    outputRatio: 0.33,
  },
  {
    id: "s-010",
    timestamp: hoursAgo(96),
    author: "daniel",
    model: "claude-sonnet-4",
    tokensWithoutContext: 51_700,
    tokensWithContext: 7_000,
    tokensSaved: 44_700,
    outputRatio: 0.26,
  },
  {
    id: "s-011",
    timestamp: hoursAgo(120),
    author: "ana",
    model: "gpt-4o",
    tokensWithoutContext: 37_900,
    tokensWithContext: 5_400,
    tokensSaved: 32_500,
    outputRatio: 0.28,
  },
  {
    id: "s-012",
    timestamp: hoursAgo(144),
    author: "matthew",
    model: "claude-sonnet-4",
    tokensWithoutContext: 60_100,
    tokensWithContext: 8_200,
    tokensSaved: 51_900,
    outputRatio: 0.30,
  },
];

/** Calcula el costo en USD de una sesión dado un modelo (puede ser diferente al original) */
export function calcSessionCost(
  session: TokenSession,
  modelKey: string
): { withoutCtx: number; withCtx: number; saved: number } {
  const pricing = MODEL_PRICING[modelKey];
  if (!pricing) return { withoutCtx: 0, withCtx: 0, saved: 0 };

  const inputFrac = 1 / (1 + session.outputRatio);
  const outputFrac = session.outputRatio / (1 + session.outputRatio);

  const costOf = (tokens: number) =>
    (tokens * inputFrac * pricing.inputPer1M +
      tokens * outputFrac * pricing.outputPer1M) /
    1_000_000;

  const withoutCtx = costOf(session.tokensWithoutContext);
  const withCtx = costOf(session.tokensWithContext);
  return { withoutCtx, withCtx, saved: withoutCtx - withCtx };
}

/** Agrega sesiones por día (etiqueta "Lun", "Mar", etc.) para el gráfico */
export interface DayBucket {
  label: string;      // "Lun", "Mar", ...
  dateKey: string;    // "2026-07-04"
  totalSaved: number;
  totalUsed: number;  // tokens gastados incluso con ContextCore
  costSavedUSD: number;
  sessions: number;
}

const DAY_LABELS: Record<string, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
};

export function buildDayBuckets(
  sessions: TokenSession[],
  modelKey: string,
  days = 7,
  locale = "en"
): DayBucket[] {
  const buckets: Map<string, DayBucket> = new Map();
  const dayLabels = DAY_LABELS[locale] ?? DAY_LABELS.en;

  // Pre-crear los últimos N días
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, {
      label: dayLabels[d.getDay()],
      dateKey: key,
      totalSaved: 0,
      totalUsed: 0,
      costSavedUSD: 0,
      sessions: 0,
    });
  }

  for (const s of sessions) {
    const key = s.timestamp.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    const costs = calcSessionCost(s, modelKey);
    bucket.totalSaved += s.tokensSaved;
    bucket.totalUsed += s.tokensWithContext;
    bucket.costSavedUSD += costs.saved;
    bucket.sessions += 1;
  }

  return [...buckets.values()];
}
