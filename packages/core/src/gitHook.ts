import fs from "node:fs";
import path from "node:path";

const HOOK_MARKER = "# contextcore-hook";

export type HookInstallResult = "installed" | "already-installed" | "skipped-existing" | "not-a-repo";

// El hook solo dispara capture+sync, nunca comitea (evitaría un loop
// post-commit -> commit -> post-commit). El "único escritor" que comitea
// el compilado es la GitHub Action (Opción B), no este hook local.
export function installPostCommitHook(cwd: string = process.cwd()): HookInstallResult {
  const hooksDir = path.join(cwd, ".git", "hooks");
  if (!fs.existsSync(hooksDir)) return "not-a-repo";

  const hookPath = path.join(hooksDir, "post-commit");
  if (fs.existsSync(hookPath)) {
    const existing = fs.readFileSync(hookPath, "utf8");
    return existing.includes(HOOK_MARKER) ? "already-installed" : "skipped-existing";
  }

  const script = ["#!/bin/sh", HOOK_MARKER, "npx contextcore capture", "npx contextcore sync", ""].join("\n");
  fs.writeFileSync(hookPath, script, "utf8");
  try {
    fs.chmodSync(hookPath, 0o755);
  } catch {
    // Windows no tiene bits de permiso; Git Bash igual respeta el shebang.
  }
  return "installed";
}
