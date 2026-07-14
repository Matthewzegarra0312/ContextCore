import { getAuthor } from "./author.js";
import { git } from "./gitHelpers.js";
import { summarizeLocally } from "./localAi.js";
import type { ContextEvent } from "./types.js";

// Best-effort, igual que Supabase: si la IA local no está descargada, la
// plataforma no tiene binario compatible, o falla por cualquier razón,
// summarizeLocally devuelve null y el caller cae al fallback local
// (buildEventFromLastCommit en captureFromCommit.ts). Nunca bloquea el commit.
export async function captureEventViaSummarizer(cwd: string = process.cwd()): Promise<ContextEvent | null> {
  const commitMessage = git("log -1 --pretty=%B", cwd);
  if (!commitMessage) return null;
  const diff = git("diff-tree -p --no-commit-id -r HEAD", cwd);

  const summary = await summarizeLocally(diff, commitMessage);
  if (!summary) return null;

  return {
    author: getAuthor(),
    timestamp: new Date().toISOString(),
    module: summary.module,
    intent: summary.intent,
    decisions: summary.decisions,
    gotchas: summary.gotchas,
    changes: summary.changes,
  };
}
