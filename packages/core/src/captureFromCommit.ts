import { getAuthor } from "./author.js";
import { git } from "./gitHelpers.js";
import type { ContextEvent } from "./types.js";

function inferModule(files: string[]): string {
  if (files.length === 0) return "sin-cambios";
  const topDirs = [...new Set(files.map((f) => f.split("/")[0]))];
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

// Fallback sin LLM: se usa cuando SUMMARIZER_URL no está configurado o el
// servicio no responde (ver llmCapture.ts). Usa el mensaje de commit como
// intent, y trailers "decision:"/"gotcha:" en el cuerpo como convención
// barata para enriquecer el evento sin depender de la IA.
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
  };
}
