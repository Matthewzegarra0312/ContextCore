import { execSync } from "node:child_process";
import { getAuthor } from "./author.js";
import type { ContextEvent } from "./types.js";

function git(args: string, cwd: string): string {
  try {
    return execSync(`git ${args}`, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

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

// Fallback sin LLM mientras no exista el summarizer (Bloque 2): usa el
// mensaje de commit como intent, y trailers "decision:"/"gotcha:" en el
// cuerpo del commit como convención barata para enriquecer el evento.
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
