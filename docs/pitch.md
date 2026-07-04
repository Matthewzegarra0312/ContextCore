# Pitch (3 minutos)

## 1. El dolor (15s)

> Cada agente con IA —Claude Code, Cursor, Copilot, Codex— arranca cada sesión en blanco. No sabe qué hizo el resto del equipo. Redescubre el repo entero, quemando decenas de miles de tokens antes de tocar código útil.

## 2. La idea en una frase (15s)

> ContextCore mantiene vivo el contexto del equipo, lo compila a AGENTS.md, CLAUDE.md y reglas de Cursor automáticamente en cada commit, y se lo muestra al equipo en un panel en tiempo real.

## 3. Demo en vivo (90s)

**Acto 1 — el dashboard reacciona a un commit real.** Comando exacto y guion completo: `docs/demo-script.md`.

> Acabo de comitear esto. No mandé ningún mensaje al equipo — el dashboard ya lo sabe.

**Acto 2 — el ahorro es medible, no una promesa.** Split-screen con el número real de `demo/scripts/compare-tokens.mjs` (medido con `messages.countTokens` de la API de Anthropic, no una estimación).

> Mismo repo, misma pregunta. Uno la redescubre. El otro ya la sabía.

## 4. Por qué importa / cross-tool (30s)

> Abrazamos el estándar — AGENTS.md ya lo leen Cursor, Codex, Copilot, Gemini CLI. No competimos con él, somos la automatización que lo mantiene vivo. Funciona con cualquier agente del equipo, no solo el tuyo.

## 5. Cierre (15s)

> Está en npm hoy — `npm install -D @contextcore/cli && npx contextcore init` — y en una URL pública. No es una promesa para después del hackathon, es lo que acabamos de mostrar.

---

## Respuestas para los jueces

**"¿No es esto solo AGENTS.md?"**
No: el archivo es el estándar, pero nadie lo mantiene a mano — se pudre en semanas. ContextCore es la automatización que lo mantiene vivo, resumido y sincronizado, más la capa visible para el equipo humano (el archivo no le sirve a nadie que no abra un editor).

**"¿Conflictos de merge en el archivo compartido?"**
Resueltos por diseño: cada dev escribe solo en su propio `.jsonl` append-only. El archivo compilado (`AGENTS.md`/`CLAUDE.md`/`.cursor/rules`) tiene un único escritor — la GitHub Action en merge a `main` — nunca se edita a mano.

**"¿No es esto lo mismo que `git log`?"**
No: `git log` da el qué. Nosotros resumimos el porqué — intención, decisiones tomadas, gotchas descubiertos — que es exactamente lo que un `git log` *no* te dice, y lo que un LLM necesita para no volver a cometer el mismo error.

**"Esto es una dev-tool, ¿dónde está el UX?"**
El usuario no es un dev aislado, es el equipo entero. Por eso el contexto no vive solo en un archivo de texto: vive en una experiencia colaborativa en tiempo real que cualquiera puede mirar sin abrir una terminal.

**"¿Qué pasa si Supabase o el WiFi fallan en la demo?"**
El CLI funciona 100% offline — Supabase es una capa best-effort, nunca una dependencia dura. Si la red falla, el flujo `git → AGENTS.md/CLAUDE.md` sigue funcionando igual; solo se pierde la actualización en vivo del dashboard (para eso también tenemos el video de respaldo, ver `docs/demo-script.md`).

**"¿Cuánto cuesta correr esto en un equipo real?"**
El resumen semántico corre en `claude-haiku-4-5` a propósito — barato y rápido, pensado para correr en cada commit del equipo sin que el costo escale con el tamaño del repo. Y si el LLM no está disponible, hay un fallback sin costo (mensaje de commit + trailers `decision:`/`gotcha:`) que sigue siendo mejor que nada.
