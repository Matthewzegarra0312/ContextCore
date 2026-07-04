#!/bin/sh
# Regenera demo/ desde cero: un repo git separado (target de ejemplo) con
# historial realista de un servicio de pagos, ContextCore ya inicializado
# (hook + AGENTS.md/CLAUDE.md/.cursor/rules), y un cambio sin comitear listo
# para el commit en vivo del Bloque 5 (Acto 1).
#
# Requiere: `pnpm install` corrido en la raiz del monorepo (para que
# `npx contextcore` resuelva en local, ver packages/cli).
#
# Uso: sh scripts/setup-demo.sh   (desde la raiz del repo)

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

rm -rf demo
mkdir -p demo/src/payments demo/src/users demo/src/notifications
cd demo

git init -q

cat > package.json <<'EOF'
{
  "name": "payments-api-demo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "description": "Repo de ejemplo (ficticio) para la demo de ContextCore — servicio de pagos."
}
EOF

cat > .gitignore <<'EOF'
node_modules/
dist/
EOF

cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true
  }
}
EOF

cat > README.md <<'EOF'
# payments-api-demo

Repo de ejemplo **ficticio** para la demo de ContextCore (RAISE Summit
Hackathon 2026). Simula un servicio de pagos con historial de commits
realista, pensado para la pregunta de la demo: *"¿Dónde está la lógica de
pagos y qué cambió esta semana?"*

Generado por `scripts/setup-demo.sh` en la raíz del monorepo — no editar a
mano, se regenera en cada corrida.

Ver `docs/demo-script.md` (raíz del monorepo) para el guion completo.
EOF

cat > src/payments/gateway.ts <<'EOF'
export interface ChargeRequest {
  amountCents: number;
  currency: string;
  customerId: string;
  paymentMethodId: string;
}

export interface ChargeResult {
  id: string;
  status: "succeeded" | "pending" | "failed";
}

// Wrapper delgado sobre la pasarela de Stripe. Toda la lógica de reintentos
// vive en retry.ts, no acá.
export class StripeGateway {
  constructor(private readonly apiKey: string) {}

  async charge(req: ChargeRequest): Promise<ChargeResult> {
    const res = await fetch("https://api.stripe.com/v1/charges", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: new URLSearchParams({
        amount: String(req.amountCents),
        currency: req.currency,
        customer: req.customerId,
        payment_method: req.paymentMethodId,
      }),
    });
    return res.json();
  }
}
EOF

git add -A
GIT_AUTHOR_DATE="2026-06-28T10:00:00" GIT_COMMITTER_DATE="2026-06-28T10:00:00" \
  git commit -q -m "Setup inicial del servicio de pagos"

cat > src/payments/retry.ts <<'EOF'
export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
}

// Retry con backoff exponencial para la pasarela de Stripe.
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = { maxAttempts: 3, baseDelayMs: 500 }
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const delay = opts.baseDelayMs * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
EOF

git add -A
GIT_AUTHOR_DATE="2026-06-29T15:30:00" GIT_COMMITTER_DATE="2026-06-29T15:30:00" \
  git commit -q -m "Añadido retry con backoff a la pasarela Stripe" \
  -m "decision: Se descartó una cola de reintentos por simplicidad — el retry corre inline con backoff exponencial." \
  -m "gotcha: El sandbox de Stripe tarda ~2s en confirmar un cargo; con maxAttempts=3 y baseDelayMs=500 el peor caso ronda los 3.5s."

cat > src/payments/webhooks.ts <<'EOF'
interface StripeWebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

const processedEventIds = new Set<string>();

// Idempotencia por event.id — sin este check procesaríamos el mismo pago
// dos veces si Stripe reintenta el webhook.
export function handleStripeWebhook(event: StripeWebhookEvent): "processed" | "duplicate" {
  if (processedEventIds.has(event.id)) return "duplicate";
  processedEventIds.add(event.id);
  return "processed";
}
EOF

git add -A
GIT_AUTHOR_DATE="2026-07-01T11:00:00" GIT_COMMITTER_DATE="2026-07-01T11:00:00" \
  git commit -q -m "Idempotencia en webhooks de Stripe" \
  -m "decision: Dedupe en memoria por event.id en vez de tabla en base de datos — el volumen del demo no lo justifica." \
  -m "gotcha: Stripe reenvía el mismo webhook hasta 3 veces si no respondemos 200 dentro de los primeros ~10s."

cat > src/users/profile.ts <<'EOF'
export interface UserProfile {
  id: string;
  email: string;
  defaultPaymentMethodId: string | null;
}

export function setDefaultPaymentMethod(profile: UserProfile, paymentMethodId: string): UserProfile {
  return { ...profile, defaultPaymentMethodId: paymentMethodId };
}
EOF

git add -A
GIT_AUTHOR_DATE="2026-07-02T09:15:00" GIT_COMMITTER_DATE="2026-07-02T09:15:00" \
  git commit -q -m "Método de pago por defecto en el perfil de usuario"

cat > src/notifications/email.ts <<'EOF'
export async function sendPaymentFailedEmail(to: string, reason: string): Promise<void> {
  console.log(`[email] Aviso de pago fallido a ${to}: ${reason}`);
}
EOF

git add -A
GIT_AUTHOR_DATE="2026-07-03T17:45:00" GIT_COMMITTER_DATE="2026-07-03T17:45:00" \
  git commit -q -m "Notificar por email cuando falla un pago" \
  -m "gotcha: El proveedor de email no tiene reintentos propios — si falla el envío, el aviso simplemente se pierde (ver próximo commit)."

# --- ContextCore: instalar en el repo target y sembrar el historial ---
npx contextcore init

npx contextcore log \
  --module "src/payments" \
  --intent "Setup inicial del servicio de pagos" \
  2>&1 >/dev/null

npx contextcore log \
  --module "src/payments" \
  --intent "Añadido retry con backoff a la pasarela Stripe" \
  --decision "Se descartó una cola de reintentos por simplicidad" \
  --gotcha "El sandbox de Stripe tarda ~2s en confirmar" \
  2>&1 >/dev/null

npx contextcore log \
  --module "src/payments" \
  --intent "Idempotencia en webhooks de Stripe" \
  --decision "Dedupe en memoria por event.id en vez de tabla en base de datos" \
  --gotcha "Stripe reenvía el mismo webhook hasta 3 veces si no respondemos 200 a tiempo" \
  2>&1 >/dev/null

npx contextcore log \
  --module "src/users" \
  --intent "Método de pago por defecto en el perfil de usuario" \
  2>&1 >/dev/null

npx contextcore log \
  --module "src/notifications" \
  --intent "Notificar por email cuando falla un pago" \
  --gotcha "El proveedor de email no tiene reintentos propios — si falla el envío, el aviso se pierde" \
  2>&1 >/dev/null

# --- Acto 2: comparación de tokens (real, via count_tokens de Anthropic) ---
mkdir -p scripts
cat > scripts/compare-tokens.mjs <<'EOF'
// Acto 2 de la demo: cuánto contexto necesita un agente para responder
// "¿Dónde está la lógica de pagos y qué cambió esta semana?" leyendo el
// repo entero (sin ContextCore) vs. leyendo solo el AGENTS.md compilado
// (con ContextCore). Usa messages.countTokens — nunca una estimación tipo
// tiktoken, ver shared/token-counting.md del skill claude-api.
//
// Uso: npm install @anthropic-ai/sdk && ANTHROPIC_API_KEY=... node scripts/compare-tokens.mjs

import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";
const QUESTION = "¿Dónde está la lógica de pagos y qué cambió esta semana?";

function readAllSource(dir) {
  let out = "";
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out += readAllSource(full);
    else if (/\.(ts|md|json)$/.test(entry.name)) {
      out += `\n\n// ${full}\n` + fs.readFileSync(full, "utf8");
    }
  }
  return out;
}

const client = new Anthropic();
const repoText = readAllSource(path.join(process.cwd(), "src"));
const agentsMd = fs.readFileSync(path.join(process.cwd(), "AGENTS.md"), "utf8");

const [cold, withContext] = await Promise.all([
  client.messages.countTokens({
    model: MODEL,
    messages: [{ role: "user", content: `${repoText}\n\n${QUESTION}` }],
  }),
  client.messages.countTokens({
    model: MODEL,
    messages: [{ role: "user", content: `${agentsMd}\n\n${QUESTION}` }],
  }),
]);

const savings = 100 - (withContext.input_tokens / cold.input_tokens) * 100;

console.log(`Sin ContextCore (repo completo en contexto): ${cold.input_tokens} tokens`);
console.log(`Con ContextCore (AGENTS.md compilado):       ${withContext.input_tokens} tokens`);
console.log(`Ahorro: ${savings.toFixed(1)}%`);
EOF

npx contextcore sync

# El commit de "housekeeping" de abajo no debe disparar el hook (si lo
# hiciera, "Trabajo en curso del equipo" mostraría este commit meta en vez
# de la historia real de pagos) — se deshabilita el hook solo para este paso.
mv .git/hooks/post-commit .git/hooks/post-commit.bak
git add -A
GIT_AUTHOR_DATE="2026-07-04T08:00:00" GIT_COMMITTER_DATE="2026-07-04T08:00:00" \
  git commit -q -m "contextcore: init + historial sembrado"
mv .git/hooks/post-commit.bak .git/hooks/post-commit

# --- Cambio SIN comitear, listo para el commit en vivo (Acto 1) ---
cat > src/notifications/retry.ts <<'EOF'
import { retryWithBackoff } from "../payments/retry.js";
import { sendPaymentFailedEmail } from "./email.js";

// Reintenta el envío del aviso si el proveedor de email falla — antes el
// aviso simplemente se perdía (ver gotcha del commit anterior).
export async function sendPaymentFailedEmailWithRetry(to: string, reason: string): Promise<void> {
  await retryWithBackoff(() => sendPaymentFailedEmail(to, reason), { maxAttempts: 2, baseDelayMs: 1000 });
}
EOF

echo ""
echo "demo/ regenerado con historial real + ContextCore inicializado."
echo "Cambio listo para el commit en vivo (Acto 1) en src/notifications/retry.ts (sin comitear)."
echo "Para el Acto 2: cd demo && npm install @anthropic-ai/sdk && node scripts/compare-tokens.mjs"
echo "Ver docs/demo-script.md para el guion completo."
