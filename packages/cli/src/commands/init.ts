import fs from "node:fs";
import path from "node:path";
import { detectStack, ensureModelDownloaded, getContextCoreDir, installPostCommitHook, isAiDisabled } from "@contextcore/core";

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

  await maybeDownloadAiModel();
}

// Best-effort: la IA local (node-llama-cpp + Qwen2.5-Coder 1.5B) es una
// mejora opcional. Si falla la descarga (sin internet, plataforma sin
// binario compatible, etc.), init termina igual con el hook instalado y la
// IA queda inactiva hasta que se reintente corriendo `contextcore init` otra vez.
async function maybeDownloadAiModel(): Promise<void> {
  if (isAiDisabled()) {
    console.log("[contextcore init] IA local omitida a propósito (CONTEXTCORE_AI=off)");
    return;
  }

  console.log("[contextcore init] Descargando modelo de IA local (Qwen2.5-Coder 1.5B, ~1GB, una sola vez)...");
  let lastReported = -1;
  const modelPath = await ensureModelDownloaded((status) => {
    if (!status.totalSize) return;
    const percent = Math.floor((status.downloadedSize / status.totalSize) * 100);
    if (percent >= lastReported + 10) {
      lastReported = percent;
      console.log(`[contextcore init] Descarga del modelo: ${percent}%`);
    }
  });

  if (modelPath) {
    console.log(`[contextcore init] Modelo de IA local listo en ${modelPath}`);
  } else {
    console.log(
      "[contextcore init] Aviso: no se pudo descargar el modelo de IA local (sin internet o plataforma no compatible). " +
        "Los commits seguirán capturándose sin IA hasta que vuelvas a correr `contextcore init`.",
    );
  }
}
