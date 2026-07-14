# ContextCore

**Memoria compartida y viva para los agentes de código de tu equipo — dejan de redescubrir el repo en cada sesión, y el equipo ve su "cerebro común" en un dashboard en tiempo real.**

> RAISE Summit Hackathon 2026 · Paris · Track Cursor · La Maison · Sprint de 24h

---

## 1. El problema

Cada IDE con IA (Claude Code, Cursor, GitHub Copilot, Codex, Gemini CLI, Windsurf…) arranca cada sesión **en blanco**. No tiene memoria persistente del proyecto ni de lo que hizo el resto del equipo. Consecuencias:

- El agente **redescubre el repo en cada sesión**: lee árboles de archivos, hace greps, abre módulos… quemando decenas de miles a cientos de miles de tokens en pura exploración antes de tocar código útil.
- En un equipo, **nadie sabe en tiempo real** qué módulo está tocando cada quién ni qué decisiones se tomaron. Antes esto lo resolvían dos devs revisándose el código mutuamente; ese rol hoy lo ocupa (mal) el agente, sin contexto compartido.
- Ya existe el estándar **AGENTS.md** (formato abierto de la Linux Foundation, +60,000 repos, leído nativamente por Cursor, Codex, Copilot, Gemini CLI, Aider, Windsurf, Zed) y **CLAUDE.md** para Claude Code — pero **nadie los mantiene a mano**. Se pudren en semanas y quedan desactualizados o inflados de ruido.

## 2. La solución — qué ES realmente ContextCore

**ContextCore NO es "otro archivo de contexto".** El archivo ya es un estándar. ContextCore es **la automatización que mantiene ese contexto vivo, resumido y sincronizado** entre todas las herramientas del equipo — y **el dashboard en tiempo real donde el equipo humano ve ese contexto**.

Una **fuente única** (eventos de contexto por dev) que se **compila automáticamente** en cada cambio hacia los formatos que cada agente ya entiende, y que a la vez alimenta el panel del equipo:

```
                    ┌─────────────────┐ → AGENTS.md      (Cursor, Codex, Copilot…)
   git push/merge → │   ContextCore   │ → CLAUDE.md      (Claude Code)
   (hook / Action)  │   compilador    │ → .cursor/rules  (Cursor granular)
                    │   + resumen IA  │
                    └────────┬────────┘
                             │ evento → Supabase (Postgres + Realtime)
                             ▼
                 ┌───────────────────────┐
                 │  Dashboard Next.js    │  ← el equipo ve en VIVO quién toca
                 │  (realtime, live)     │    qué, decisiones y gotchas
                 └───────────────────────┘
```

### Principios de diseño (lo que nos diferencia)

1. **Abrazamos el estándar, no competimos con él.** Somos la capa que faltaba entre el equipo y AGENTS.md/CLAUDE.md, no un formato propietario más.
2. **Contexto ≠ changelog.** No repetimos lo que `git log` ya da gratis (y que además *daña* al agente: un estudio encontró que archivos generados por LLM redujeron la tasa de éxito 2% y subieron el costo 23% por duplicar info ya presente en el repo). Resumimos lo **no obvio**: intención de los cambios, decisiones tomadas, quién toca qué módulo *ahora mismo*, gotchas descubiertos.
3. **Presupuesto de tokens estricto.** El contexto compilado cabe en ~1–2k tokens. Si crece sin límite, destruye su propia razón de ser.
4. **Un solo escritor, cero conflictos de merge.** Cada dev escribe en su propio log append-only; ContextCore compila el archivo final en un único punto (merge a `main` vía Action).
5. **El mismo dato sirve a dos audiencias.** El evento de contexto que consume el agente (archivo compilado) es el mismo que consume el humano (dashboard). Cero duplicación de trabajo, doble historia en el pitch.

## 3. Stack tecnológico

| Capa | Tecnología | Rol |
|---|---|---|
| CLI + hooks git | **Node 20+ / TypeScript** | `npx contextcore init / sync / status` |
| Resumen semántico | **FastAPI (Python)** | Microservicio: recibe diff + commit msg → llama al LLM → devuelve evento estructurado JSON. *Fallback: si vamos justos, esta lógica se colapsa dentro del CLI en TS y FastAPI se elimina.* |
| Persistencia + tiempo real | **Supabase** (Postgres + Realtime) | Tabla `context_events`; el dashboard se suscribe vía websocket → actualizaciones en vivo sin polling. Auth de Supabase si da tiempo (equipos). |
| Dashboard + Landing | **Next.js + Tailwind** | Una sola app: `/` landing, `/dashboard` panel en vivo. Deploy en Vercel. |
| Voz (stretch) | **Web Speech API + LLM** | Preguntarle al dashboard por voz ("¿qué cambió en pagos esta semana?") y que responda leyendo los eventos. El brief de Cursor menciona voz explícitamente. ~2h, solo si el núcleo está cerrado. |

**Descartado — CodeGraph:** el mapa de grafo de dependencias es sustituible al 90% por un grid de tarjetas animadas con Tailwind (1h vs 4-6h de integración), y un grafo de imports es información que el agente ya deduce del código — duplicarla contradice nuestro principio 2. Queda en visión post-hackathon.

**Descartado — openpyxl:** librería de Excel; no existe ningún punto del flujo git → contexto → agente → dashboard donde un .xlsx aporte valor. Fuera.

## 4. Propuesta de valor

- **Menos tokens, menos coste, más velocidad.** El agente empieza cada sesión ya sabiendo la arquitectura, las convenciones y el estado del equipo, en vez de redescubrirlo.
- **Cross-tool de verdad.** Una fuente, todos los agentes. Da igual si tu compañero usa Cursor y tú Claude Code.
- **Conciencia de equipo, en vivo.** El dashboard muestra en tiempo real quién toca qué módulo, qué decisiones se tomaron y qué gotchas se descubrieron — sin preguntar, sin standup.

## 5. Alcance del MVP para el hackathon (24h)

Lo que **entra** (núcleo demostrable):

- [ ] CLI en npm: `npx contextcore init` / `sync` / `status`
- [ ] Hook de git (o GitHub Action) que dispara la actualización
- [ ] Servicio FastAPI de resumen con un modelo barato (intención del cambio, no el diff literal)
- [ ] Compilación multi-formato: `AGENTS.md` + `CLAUDE.md` + `.cursor/rules`
- [ ] Presupuesto de tokens con truncado inteligente
- [ ] **Supabase:** tabla de eventos + Realtime hacia el dashboard
- [ ] **Dashboard Next.js + Tailwind EN VIVO:** actividad por módulo, timeline de decisiones/gotchas, presencia del equipo — se actualiza en el momento en que alguien commitea
- [ ] **La demo estrella:** commit en vivo → el dashboard se actualiza delante de los jueces → split-screen del agente con/sin ContextCore con contador de tokens
- [ ] Landing en la misma app Next.js (ruta `/`, generada con IA en la última hora)

Stretch goals (solo si el núcleo está cerrado):

- [ ] **Voz en el dashboard:** Web Speech API + LLM — pregunta hablada, respuesta desde los eventos (~2h, alto impacto en el pitch: el brief menciona voz)
- [ ] Auth de Supabase para multi-equipo

Lo que **queda fuera** (para no morir por scope):

- ❌ Figma MCP / Stitch / Claude Design MCP → es *otro producto*; diluye la historia
- ❌ Linear
- ❌ openpyxl / exports a Excel → sin caso de uso en el flujo
- ❌ CodeGraph / mapa de grafo de dependencias → 4-6h de integración para algo que un grid animado logra en 1h; queda en visión
- ❌ Cualquier integración que no sea el flujo git → contexto → agente/dashboard

---

## 6. Plan de implementación detallado (24h · equipo de 5)

> Prioridad absoluta: **demo funcional del flujo commit → dashboard en vivo → ahorro de tokens** antes que features.

### Reparto de roles

| Rol | Persona(s) | Foco |
|---|---|---|
| CLI + hooks git | Dev 1 | Bloques 1 y 4 |
| Motor de resumen (FastAPI) | Dev 2 | Bloque 2 |
| Compilador multi-formato | Dev 3 | Bloque 3 |
| Dashboard + Supabase | Dev 4 | Bloques 1b y 6 (empieza YA, no en la hora 19) |
| Demo + landing + pitch (flotante) | Dev 5 | Bloques 5 y 7, apoya donde haga falta |

### Metodología — skills agénticas (solo las 4 que pagan en 24h)

| Skill | Cuándo | Cómo la usamos |
|---|---|---|
| `/grilling` | **ANTES del evento** (días previos, timeboxed 30-45 min) | Sesión de interrogatorio sobre este mismo documento para encontrar huecos del plan cuando aún es gratis arreglarlos. **Prohibida durante el sprint** — ahí quema horas de código. |
| `/ponytail` | Siempre activa durante implementación | Escalera de decisión en cada módulo: ¿necesita existir? → stdlib → nativo → dep existente → mínimo código. Nuestra defensa #1 contra la muerte por over-engineering. |
| `/ponytail-review` | Antes de cada merge a `main` | Pasada rápida al diff cazando solo complejidad (`delete:`, `yagni:`, `shrink:`). Segundos de coste. |
| `/prototype` (UI) | Bloque 1b, timeboxed 1h | 2-3 variaciones radicales del dashboard switchables por URL → elegir una → borrar el resto. |

**Descartadas y por qué:** `/to-prd` y `/to-issues` publican en Linear (excluido; este .md ES nuestro PRD) · `/tdd` estricto es suicidio en 24h — tests solo en el compilador, sin ceremonia · `/decision-mapping` es para proyectos multi-sesión con incógnitas; nuestro plan ya está mapeado · `/domain-modeling` y `/grill-with-docs` mantienen glosario+ADRs — overhead de proyecto largo; nuestro dominio cabe en el contrato JSON del Bloque 0 · `/teach` es onboarding, no aplica · `/improve-architecture` es post-MVP por definición.

### Bloque 0 — Setup y alineación (0h → 1h)

- Monorepo, `pnpm`, TypeScript, Node 20+. Proyecto Supabase creado y credenciales repartidas.
- Estructura base:
  ```
  contextcore/
  ├─ packages/cli/          # el binario contextcore (TS)
  ├─ packages/core/         # motor: parseo, compilación (TS) + IA local embebida (node-llama-cpp)
  ├─ web/                   # Next.js + Tailwind: landing (/) + dashboard (/dashboard)
  └─ demo/                  # repo de ejemplo para el split-screen
  ```
- Definir el **contrato del evento de contexto** (es la interfaz entre TODOS los bloques — cerrarlo aquí evita el caos de la hora 15):
  ```json
  {
    "author": "daniel",
    "timestamp": "…",
    "module": "payments/",
    "intent": "Añadido retry con backoff a la pasarela Stripe",
    "decisions": ["Se descartó cola por simplicidad"],
    "gotchas": ["El sandbox de Stripe tarda ~2s en confirmar"]
  }
  ```
- Fuente única: `.contextcore/<autor>.jsonl` (append-only por dev) — y espejo del evento en la tabla `context_events` de Supabase.

### Bloque 1 — CLI esqueleto + fuente de datos (1h → 4h)

- `contextcore init`: crea `.contextcore/`, detecta stack (lee `package.json`, ficheros clave), escribe un `context.md` inicial.
- `contextcore status`: muestra quién toca qué módulo ahora mismo.
- Al registrar un evento: append al `.jsonl` del autor **+ insert en Supabase** (best-effort: si no hay red, solo local; el dashboard es capa adicional, nunca dependencia dura del CLI).
- **Conflictos resueltos por diseño:** cada dev escribe SOLO en su `.jsonl`. Nunca se toca el archivo compilado a mano.

### Bloque 1b — Dashboard esqueleto (1h → 4h, en paralelo)

- Next.js + Tailwind con las dos rutas (`/`, `/dashboard`).
- **`/prototype` (UI):** generar 2-3 variaciones radicales del layout del dashboard switchables por URL, el equipo elige una en 5 minutos, se borran las demás. No pulir todavía — solo decidir dirección visual.
- Suscripción a Supabase Realtime sobre `context_events`; render con datos falsos primero (no bloquear en el CLI).
- Deploy temprano en Vercel — que la URL exista desde la hora 4.

### Bloque 2 — Motor de resumen semántico (4h → 9h)

- Servicio FastAPI: endpoint `POST /summarize` que recibe `git diff` + mensaje de commit.
- Llama a un **modelo barato/rápido** con un prompt que extrae SOLO lo no obvio: intención, decisión, gotcha, módulo afectado. Explícitamente **prohibir** que repita el diff o cosas que se infieren del código.
- Devuelve el evento estructurado (el contrato del Bloque 0) → el CLI hace append + insert.
- **Presupuesto de tokens:** al compilar, ordenar por relevancia/recencia y truncar para caber en ~1–2k tokens. Lo viejo se colapsa en una línea o se descarta.
- **Plan B (decisión en la hora 7):** si la integración TS↔Python da guerra, mover la llamada al LLM dentro del CLI y matar FastAPI. El pitch no cambia.

### Bloque 3 — Compilador multi-formato (9h → 13h)

- Función `compile()` que toma todos los `.jsonl` + metadata del repo y genera:
  - `AGENTS.md` (estándar, para Cursor/Codex/Copilot/etc.)
  - `CLAUDE.md` (o symlink a AGENTS.md como fallback documentado)
  - `.cursor/rules/contextcore.mdc` (con frontmatter/globs)
- Secciones: overview del proyecto, comandos build/test, convenciones no-default, **"trabajo en curso del equipo"** (nuestra sección diferencial), boundaries.
- `contextcore sync`: ejecuta compile manualmente (útil para demo en vivo).

### Bloque 4 — Automatización git (13h → 15h)

- **Opción A (demo):** git hook `post-commit`/`post-merge` local que llama a `contextcore sync`.
- **Opción B (mencionar como diseño de producción):** GitHub Action que en cada merge a `main` recompila y commitea — materializa el "único escritor".

### Bloque 5 — La demo (15h → 19h) ⭐ MÁS IMPORTANTE

La demo ahora tiene **dos actos**, y el primero es visual:

1. **Acto 1 — el dashboard en vivo:** un miembro del equipo hace un commit real en el escenario → en segundos, el panel proyectado se actualiza: aparece su evento, su módulo se ilumina, la decisión y el gotcha se leen en pantalla. Esto es lo que engancha a los jueces del track Cursor (UX, interactividad, tiempo real).
2. **Acto 2 — el ahorro:** split-screen de la misma tarea en un agente con/sin ContextCore, con contador de tokens y tool-calls. Refuerza con datos lo que el acto 1 mostró con experiencia.

- Repo `demo/` mediano y realista. Tarea ejemplo: *"¿Dónde está la lógica de pagos y qué cambió esta semana?"*
- **Fallback grabado en vídeo de AMBOS actos** por si el WiFi del evento falla.

### Bloque 6 — Dashboard pulido + landing (19h → 22h)

- **Dashboard:** pulir lo construido desde el Bloque 1b — timeline animada de eventos, grid de tarjetas por módulo con pulso en vivo ("quién toca qué ahora"), contador de tokens ahorrados como métrica destacada. Aquí se gana la nota de diseño del track.
- **Stretch — Voz:** si el núcleo está cerrado, Web Speech API + llamada al LLM: pregunta hablada al panel, respuesta desde los eventos. Si no, ni empezarlo.
- **Landing (`/`):** generada con IA. Solo tiene que existir, verse decente y explicar el `npx contextcore init`.

### Bloque 7 — Publicar en npm + pulido del pitch (22h → 24h)

- `npm publish` del CLI (≈30 min; poder hacer `npx contextcore` en vivo da mucha credibilidad).
- Guion del pitch de 3 minutos:
  1. **El dolor** (15s): "Cada agente redescubre tu repo en cada sesión y tu equipo no sabe qué hace cada quién."
  2. **La idea en una frase** (15s): "ContextCore mantiene vivo el contexto, lo compila a AGENTS.md/CLAUDE.md/cursor rules, y se lo muestra a tu equipo en un panel en tiempo real."
  3. **Demo en vivo** (90s): commit → dashboard se actualiza ante los jueces → split-screen de tokens.
  4. **Por qué importa / cross-tool** (30s): abrazamos el estándar, funcionamos con cualquier agente, el mismo dato sirve al agente y al humano.
  5. **Cierre** (15s): visión + está en npm y en una URL pública hoy.
- Respuestas listas para los jueces:
  - *"¿No es esto solo AGENTS.md?"* → No: es la automatización que lo mantiene vivo (el archivo se pudre solo) + la capa visible para humanos.
  - *"¿Conflictos de merge?"* → Un log por dev + único escritor en el merge.
  - *"¿No es esto git log?"* → No: resumimos intención y decisiones, no el diff.
  - *"Esto es una dev-tool, ¿dónde está el UX?"* → El usuario es el equipo entero, y por eso el contexto no vive en un archivo de texto: vive en una experiencia colaborativa en tiempo real.

---

## 7. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Jueces piensan "esto ya es AGENTS.md" | Posicionar como automatización + capa humana en vivo. Demo del ahorro real. |
| Dos runtimes (TS + Python) queman tiempo de integración | FastAPI acotado a un solo endpoint; plan B en la hora 7: colapsar el resumen dentro del CLI. |
| Supabase/red falla en la demo | El CLI funciona 100% offline (Supabase es best-effort); vídeo fallback de ambos actos. |
| Conflictos de merge en el archivo compartido | Log append-only por dev + único escritor (Action al mergear). |
| El contexto se infla y empeora al agente | Presupuesto de tokens estricto + resumen de solo lo no-obvio. |
| Scope demasiado grande para 24h | Voz y Auth son stretch. CodeGraph, MCPs de diseño, Linear y Excel fuera. `/ponytail` activa en todo momento. Núcleo = git → contexto → agente + dashboard vivo. |
| Dashboard se deja para el final y sale pobre | Dev 4 dedicado desde la hora 1; deploy en Vercel en la hora 4. |

## 8. Ideas de extensión (post-hackathon, mencionar solo en visión)

- Slash-command `/sync` nativo en Claude Code / Cursor como complemento al hook.
- Mapa navegable del repo con CodeGraph (grafo de dependencias con actividad en vivo por nodo).
- Pasada de `/improve-architecture` sobre el código del MVP para profundizar módulos shallow.
- QA de diseño (Figma/Stitch MCP) como producto separado.
- Integración con gestores de tareas (Linear) para enlazar contexto ↔ tickets.
