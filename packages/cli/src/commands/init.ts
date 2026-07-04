import fs from "node:fs";
import path from "node:path";
import { detectStack, getContextCoreDir, installPostCommitHook } from "@contextcore/core";

export async function init(): Promise<void> {
  const cwd = process.cwd();
  const dir = getContextCoreDir(cwd);
  fs.mkdirSync(dir, { recursive: true });

  const stack = detectStack(cwd);
  const contextMdPath = path.join(dir, "context.md");

  const lines = [
    `# ContextCore — ${stack.name}`,
    "",
    `- Lenguajes: ${stack.languages.length ? stack.languages.join(", ") : "no detectado"}`,
    `- Frameworks: ${stack.frameworks.length ? stack.frameworks.join(", ") : "ninguno detectado"}`,
    `- Gestor de paquetes: ${stack.packageManager ?? "no detectado"}`,
    "",
    `Generado por \`contextcore init\` el ${new Date().toISOString()}.`,
    "",
    "Este archivo es un punto de partida local. El contexto compilado real",
    "(`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`) se genera con `contextcore sync`.",
    "",
  ];
  fs.writeFileSync(contextMdPath, lines.join("\n"), "utf8");

  console.log(`[contextcore init] Stack detectado: ${stack.languages.join(", ") || "desconocido"}`);
  if (stack.frameworks.length) console.log(`[contextcore init] Frameworks: ${stack.frameworks.join(", ")}`);
  console.log(`[contextcore init] Escrito ${path.relative(cwd, contextMdPath)}`);

  const hookResult = installPostCommitHook(cwd);
  switch (hookResult) {
    case "installed":
      console.log("[contextcore init] Hook post-commit instalado (capture + sync automático en cada commit)");
      break;
    case "already-installed":
      console.log("[contextcore init] Hook post-commit ya estaba instalado");
      break;
    case "skipped-existing":
      console.log("[contextcore init] Aviso: ya existe un hook post-commit de otra herramienta, no se tocó. Añade a mano: npx contextcore capture && npx contextcore sync");
      break;
    case "not-a-repo":
      console.log("[contextcore init] Aviso: no se detectó .git/ — hook no instalado");
      break;
  }
}
