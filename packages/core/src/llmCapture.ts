import { getAuthor } from "./author.js";
import { git } from "./gitHelpers.js";
import type { ContextEvent } from "./types.js";

interface SummarizerResult {
  module: string;
  intent: string;
  decisions: string[];
  gotchas: string[];
}

// Best-effort, igual que Supabase: si SUMMARIZER_URL no está configurado o el
// servicio no responde, devuelve null y el caller cae al fallback local
// (buildEventFromLastCommit en captureFromCommit.ts). Nunca bloquea el commit.
export async function captureEventViaSummarizer(cwd: string = process.cwd()): Promise<ContextEvent | null> {
  const url = process.env.SUMMARIZER_URL;
  if (!url) return null;

  const commitMessage = git("log -1 --pretty=%B", cwd);
  if (!commitMessage) return null;
  const diff = git("diff-tree -p --no-commit-id -r HEAD", cwd);

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/summarize`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ diff, commit_message: commitMessage }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn(`[contextcore capture] aviso: summarizer respondió ${res.status}, uso fallback local`);
      return null;
    }

    const data = (await res.json()) as SummarizerResult;
    return {
      author: getAuthor(),
      timestamp: new Date().toISOString(),
      module: data.module,
      intent: data.intent,
      decisions: data.decisions,
      gotchas: data.gotchas,
    };
  } catch (err) {
    console.warn(`[contextcore capture] aviso: summarizer no disponible, uso fallback local (${(err as Error).message})`);
    return null;
  }
}
