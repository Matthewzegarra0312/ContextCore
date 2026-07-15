#!/usr/bin/env node
// Corre en `npm install @contextcore/cli` (postinstall del paquete publicado).
// Descarga el modelo GGUF (~1GB, una vez por máquina) si aún no está cacheado.
// Best-effort: nunca hace fallar el install. En el monorepo de desarrollo se
// omite a propósito — ahí `contextcore init` o `pnpm install` + build lo cubren.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function isMonorepoDevInstall() {
  // packages/cli/scripts/postinstall-model.mjs → raíz contextcore-monorepo
  const rootPkg = path.resolve(__dirname, "../../..", "package.json");
  if (!fs.existsSync(rootPkg)) return false;
  try {
    const pkg = JSON.parse(fs.readFileSync(rootPkg, "utf8"));
    return pkg.name === "contextcore-monorepo" && pkg.private === true;
  } catch {
    return false;
  }
}

if (isMonorepoDevInstall()) {
  process.exit(0);
}

const aiOff = ["off", "false", "0"].includes(
  (process.env.CONTEXTCORE_AI ?? "").trim().toLowerCase(),
);
if (aiOff) {
  process.exit(0);
}

let ensureModelDownloaded;
let isModelCached;
try {
  ({ ensureModelDownloaded, isModelCached } = await import("@contextcore/core"));
} catch (err) {
  console.warn(
    `[contextcore] postinstall: no se pudo cargar @contextcore/core (${(err).message}). ` +
      "Corré `npx @contextcore/cli init` para descargar el modelo de IA.",
  );
  process.exit(0);
}

if (isModelCached()) {
  process.exit(0);
}

console.log(
  "[contextcore] Descargando modelo de IA local (Qwen2.5-Coder 1.5B, ~1GB, una sola vez por máquina)...",
);
let lastReported = -1;
const modelPath = await ensureModelDownloaded((status) => {
  if (!status.totalSize) return;
  const percent = Math.floor((status.downloadedSize / status.totalSize) * 100);
  if (percent >= lastReported + 10) {
    lastReported = percent;
    console.log(`[contextcore] Descarga del modelo: ${percent}%`);
  }
});

if (modelPath) {
  console.log(`[contextcore] Modelo de IA local listo en ${modelPath}`);
} else {
  console.log(
    "[contextcore] Aviso: no se pudo descargar el modelo ahora. " +
      "Los commits seguirán con fallback; reintentá con `npx @contextcore/cli init`.",
  );
}
