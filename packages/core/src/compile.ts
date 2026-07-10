import fs from "node:fs";
import path from "node:path";
import type { ContextEvent } from "./types.js";
import { readAllEvents } from "./storage.js";
import { detectStack } from "./detectStack.js";
import { getContextCoreDir } from "./paths.js";

const TOKEN_BUDGET = 2000;
const MAX_ITEMS_PER_SECTION = 8;
const RELEVANT_SCRIPTS = ["dev", "build", "test", "start", "lint"];

export interface CompiledContext {
  markdown: string;
  tokenEstimate: number;
}

function estimateTokens(text: string): number {
  // Heurística estándar: ~4 caracteres por token. Suficiente para el
  // presupuesto del compilador, no necesita un tokenizer real.
  return Math.ceil(text.length / 4);
}

function readScripts(cwd: string): Record<string, string> {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8"));
    return pkg.scripts ?? {};
  } catch {
    return {};
  }
}

function latestByAuthor(events: ContextEvent[]): ContextEvent[] {
  const map = new Map<string, ContextEvent>();
  for (const event of events) {
    const current = map.get(event.author);
    if (!current || new Date(event.timestamp) > new Date(current.timestamp)) {
      map.set(event.author, event);
    }
  }
  return [...map.values()].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function dedupeRecent(events: ContextEvent[], field: "decisions" | "gotchas", limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const sorted = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  for (const event of sorted) {
    for (const item of event[field]) {
      if (seen.has(item)) continue;
      seen.add(item);
      out.push(item);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

function renderSection(title: string, lines: string[], emptyText: string): string {
  return [`## ${title}`, "", lines.length ? lines.join("\n") : `_${emptyText}_`].join("\n");
}

export function compile(cwd: string = process.cwd()): CompiledContext {
  const events = readAllEvents(cwd);
  const stack = detectStack(cwd);
  const scripts = readScripts(cwd);

  const overview = renderSection(
    "Overview",
    [
      `**${stack.name}** — ${stack.languages.join(", ") || "stack no detectado"}${
        stack.frameworks.length ? ` (${stack.frameworks.join(", ")})` : ""
      }.`,
    ],
    "Stack no detectado"
  );

  const commandLines = Object.entries(scripts)
    .filter(([name]) => RELEVANT_SCRIPTS.includes(name))
    .map(([name, cmd]) => `- \`${stack.packageManager ?? "npm"} run ${name}\`: ${cmd}`);
  const commands = renderSection("Comandos", commandLines, "No detectados en package.json");

  const activityLines = latestByAuthor(events).map((e) => `- **${e.author}** en \`${e.module}\`: ${e.intent}`);
  const activity = renderSection("Trabajo en curso del equipo", activityLines, "Sin actividad registrada todavía");

  const boundaries = renderSection(
    "Boundaries",
    [
      "- No edites `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/contextcore.mdc` ni `.contextcore/context.md` a mano — se regeneran con `contextcore sync`.",
      "- No edites `.contextcore/context.jsonl` a mano — es append-only y compartido por todo el equipo (cada línea incluye el autor).",
    ],
    ""
  );

  let decisionsItems = dedupeRecent(events, "decisions", MAX_ITEMS_PER_SECTION);
  let gotchasItems = dedupeRecent(events, "gotchas", MAX_ITEMS_PER_SECTION);

  const render = (decisions: string[], gotchas: string[], truncated: boolean): string =>
    [
      "<!-- Generado por `contextcore sync` — no editar a mano. -->",
      "",
      overview,
      "",
      commands,
      "",
      activity,
      "",
      renderSection("Decisiones recientes", decisions.map((d) => `- ${d}`), "Ninguna registrada todavía"),
      "",
      renderSection("Gotchas conocidos", gotchas.map((g) => `- ${g}`), "Ninguno registrado todavía"),
      "",
      boundaries,
      truncated ? "\n_Algunas decisiones/gotchas antiguas se colapsaron por presupuesto de tokens._\n" : "",
    ].join("\n");

  let markdown = render(decisionsItems, gotchasItems, false);
  let truncated = false;
  // Presupuesto de tokens (~1-2k): recortamos primero los gotchas más
  // viejos, luego las decisiones más viejas; overview/actividad/boundaries
  // se mantienen intactos porque son la parte diferencial y ya están acotados.
  while (estimateTokens(markdown) > TOKEN_BUDGET && (decisionsItems.length > 0 || gotchasItems.length > 0)) {
    truncated = true;
    if (gotchasItems.length > 0) gotchasItems = gotchasItems.slice(0, -1);
    else decisionsItems = decisionsItems.slice(0, -1);
    markdown = render(decisionsItems, gotchasItems, truncated);
  }

  return { markdown, tokenEstimate: estimateTokens(markdown) };
}

export interface CompiledOutputPaths {
  agents: string;
  claude: string;
  cursorRule: string;
}

export function writeCompiledOutputs(cwd: string, compiled: CompiledContext): CompiledOutputPaths {
  const agents = path.join(cwd, "AGENTS.md");
  const claude = path.join(cwd, "CLAUDE.md");
  const cursorDir = path.join(cwd, ".cursor", "rules");
  const cursorRule = path.join(cursorDir, "contextcore.mdc");

  fs.writeFileSync(agents, compiled.markdown, "utf8");
  // CLAUDE.md como copia real (no symlink): en Windows un symlink pide
  // privilegios elevados, y esto tiene que funcionar en la demo sin fricción.
  fs.writeFileSync(claude, compiled.markdown, "utf8");

  fs.mkdirSync(cursorDir, { recursive: true });
  const mdc = [
    "---",
    "description: Contexto vivo del equipo, generado por ContextCore",
    "alwaysApply: true",
    "---",
    "",
    compiled.markdown,
  ].join("\n");
  fs.writeFileSync(cursorRule, mdc, "utf8");

  return { agents, claude, cursorRule };
}

function formatEventEntry(event: ContextEvent): string {
  const lines = [
    `### ${event.timestamp} — ${event.author}`,
    "",
    `- **Módulo:** \`${event.module}\``,
    `- **Intent:** ${event.intent}`,
  ];
  if (event.decisions.length) {
    lines.push("- **Decisiones:**");
    lines.push(...event.decisions.map((d) => `  - ${d}`));
  }
  if (event.gotchas.length) {
    lines.push("- **Gotchas:**");
    lines.push(...event.gotchas.map((g) => `  - ${g}`));
  }
  return lines.join("\n");
}

// A diferencia de compile() (vista resumida, con presupuesto de tokens para
// caber en el contexto de un agente), esta es la vista COMPLETA pensada para
// lectura humana: todos los eventos de todos los .jsonl, sin recortar nada.
// Nunca se parsea de vuelta, así que el formato puede ser prosa libre.
export function compileContextMd(cwd: string = process.cwd()): string {
  const events = readAllEvents(cwd);
  const stack = detectStack(cwd);

  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const header = [
    `# ContextCore — ${stack.name}`,
    "",
    `- Lenguajes: ${stack.languages.length ? stack.languages.join(", ") : "no detectado"}`,
    `- Frameworks: ${stack.frameworks.length ? stack.frameworks.join(", ") : "ninguno detectado"}`,
    `- Gestor de paquetes: ${stack.packageManager ?? "no detectado"}`,
  ].join("\n");

  const historySection = sorted.length
    ? sorted.map(formatEventEntry).join("\n\n")
    : "_Sin eventos registrados todavía. Corre `contextcore capture` tras un commit._";

  return [
    "<!-- Generado por `contextcore sync` — no editar a mano. -->",
    "",
    header,
    "",
    `## Historial de contexto (${sorted.length} evento${sorted.length === 1 ? "" : "s"})`,
    "",
    historySection,
    "",
  ].join("\n");
}

export function writeContextMd(cwd: string, markdown: string): string {
  const contextMdPath = path.join(getContextCoreDir(cwd), "context.md");
  fs.writeFileSync(contextMdPath, markdown, "utf8");
  return contextMdPath;
}
