# Guion de la demo (Bloque 5)

Repo de ejemplo: `demo/` — un servicio de pagos ficticio (`payments-api-demo`), regenerado por `scripts/setup-demo.sh` desde la raíz del monorepo. Correr ese script **antes de cada ensayo** — deja `demo/` en el estado exacto necesario para los dos actos.

```bash
pnpm install        # una vez, en la raíz
sh scripts/setup-demo.sh
```

Esto deja:
- Un historial real de 5 commits sobre `src/payments`, `src/users`, `src/notifications`.
- ContextCore ya inicializado en `demo/` (hook `post-commit` instalado, `AGENTS.md`/`CLAUDE.md`/`.cursor/rules/` compilados desde ese historial).
- Un cambio **sin comitear** en `src/notifications/retry.ts`, listo para el commit en vivo.

---

## Acto 1 — el dashboard en vivo

**Antes de arrancar:**
1. `cd web && pnpm dev` (o la URL de Vercel ya desplegada) — dejar `/dashboard` proyectado.
2. Confirmar que `web/.env.local` tiene las credenciales de Supabase reales (si no, el dashboard cae a datos de ejemplo — sirve para ensayar la UI, pero el Acto 1 en vivo necesita la conexión real).
3. Tener `demo/` recién regenerado (`sh scripts/setup-demo.sh`).

**En el escenario:**

```bash
cd demo
cat src/notifications/retry.ts   # mostrar el cambio ya escrito
git add -A
git commit -m "Reintentar notificación si el proveedor de email falla" \
  -m "decision: Reusa retryWithBackoff de payments/ en vez de una implementación nueva" \
  -m "gotcha: sendPaymentFailedEmail no lanza excepción en fallos silenciosos del SMTP, hubo que envolverla"
```

El hook `post-commit` corre `contextcore capture` + `contextcore sync` solo. En segundos, el panel proyectado debería:
- Mostrar el nuevo evento en el timeline (autor, módulo `src/notifications`, intent, decisión y gotcha).
- Iluminar la tarjeta de "trabajo en curso" de ese autor con el pulso en vivo.

**Guion hablado:** *"Acabo de comitear esto. No mandé ningún mensaje al equipo — el dashboard ya lo sabe."*

---

## Acto 2 — el ahorro de tokens

Split-screen: un agente que explora `demo/` desde cero contra uno que solo lee el `AGENTS.md` compilado.

**Preparar el número real antes del evento** (no se inventa, se mide):

```bash
cd demo
npm install @anthropic-ai/sdk
ANTHROPIC_API_KEY=... node scripts/compare-tokens.mjs
```

Esto imprime, usando `messages.countTokens` (nunca una estimación tipo tiktoken):

```
Sin ContextCore (repo completo en contexto): <N> tokens
Con ContextCore (AGENTS.md compilado):       <M> tokens
Ahorro: <%>%
```

**En el escenario:** hacer la misma pregunta ("¿Dónde está la lógica de pagos y qué cambió esta semana?") a un agente en cada panel — uno arrancando en frío sobre `demo/`, el otro con `AGENTS.md`/`CLAUDE.md` ya en su contexto — y mostrar el contador de tokens de cada uno junto al número medido arriba.

**Guion hablado:** *"Mismo repo, misma pregunta. Uno la redescubre. El otro ya la sabía."*

---

## Fallback: video grabado

El WiFi del venue puede fallar. Grabar **ambos actos** con antelación (screen recording de Acto 1 completo — commit → dashboard actualizándose — y de Acto 2 con los dos paneles) y tenerlo listo para reproducir sin depender de red. Volver a grabar si `scripts/setup-demo.sh` o el dashboard cambian antes del evento.
