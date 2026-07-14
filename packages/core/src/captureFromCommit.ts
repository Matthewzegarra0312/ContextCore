import { getAuthor } from "./author.js";
import { git } from "./gitHelpers.js";
import type { ContextEvent } from "./types.js";

// Directorios contenedor genéricos: el primer segmento solo no dice nada
// ("src" en casi cualquier repo), así que para estos se usa el segundo
// también (ej. "src/notifications", "packages/core").
const CONTAINER_DIRS = new Set(["src", "lib", "app", "apps", "packages", "services", "test", "tests"]);

function moduleSegment(file: string): string {
  const parts = file.split("/");
  if (parts.length > 2 && CONTAINER_DIRS.has(parts[0])) return `${parts[0]}/${parts[1]}`;
  return parts[0];
}

function inferModule(files: string[]): string {
  if (files.length === 0) return "sin-cambios";
  const topDirs = [...new Set(files.map(moduleSegment))];
  if (topDirs.length <= 3) return topDirs.join(", ");
  return `${topDirs.slice(0, 3).join(", ")} (+${topDirs.length - 3} más)`;
}

function extractTrailers(body: string, key: "decision" | "gotcha"): string[] {
  const re = new RegExp(`^${key}:\\s*(.+)$`, "gim");
  const out: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(body))) out.push(match[1].trim());
  return out;
}

// Fallback sin LLM: se usa cuando la IA local no está descargada, está
// desactivada (CONTEXTCORE_AI=off) o falla (ver llmCapture.ts/localAi.ts).
// Usa el mensaje de commit como intent, y trailers "decision:"/"gotcha:" en
// el cuerpo como convención barata para enriquecer el evento sin depender
// de la IA.
// Ej: git commit -m "Retry con backoff" -m "decision: sin cola por simplicidad"
export function buildEventFromLastCommit(cwd: string = process.cwd()): ContextEvent {
  const subject = git("log -1 --pretty=%s", cwd) || "Commit sin mensaje";
  const body = git("log -1 --pretty=%b", cwd);
  const filesRaw = git("diff-tree --no-commit-id --name-only -r HEAD", cwd);
  const files = filesRaw ? filesRaw.split("\n").filter(Boolean) : [];

  return {
    author: getAuthor(),
    timestamp: new Date().toISOString(),
    module: inferModule(files),
    intent: subject,
    decisions: extractTrailers(body, "decision"),
    gotchas: extractTrailers(body, "gotcha"),
    // Sin IA no hay forma barata de derivar un changelog literal del diff;
    // se deja vacío, igual que decisions/gotchas sin trailers.
    changes: [],
  };
}
