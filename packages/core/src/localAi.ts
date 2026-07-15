import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Llama, LlamaModel } from "node-llama-cpp";

// IA embebida, sin Ollama ni servicio externo: node-llama-cpp trae bindings
// nativos a llama.cpp (binarios precompilados via optionalDependencies) y
// corre la inferencia dentro del mismo proceso Node.
const MODEL_URI = "hf:Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF:Q4_K_M";
// Nombre de archivo fijo (no autodetectado desde el URI) para que
// `summarizeLocally` pueda comprobar la existencia del modelo con un simple
// `fs.access`, sin red, y sin depender de `createModelDownloader` para saber
// cómo se llama el archivo ya descargado.
const MODEL_FILE_NAME = "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf";

// El diff se trunca más agresivo que con un modelo cloud grande: un modelo
// de 1.5B no aprovecha bien contextos largos, y más texto solo suma
// ruido/latencia.
const MAX_DIFF_CHARS = 6000;

export interface LocalSummary {
  module: string;
  intent: string;
  changes: string[];
  decisions: string[];
  gotchas: string[];
}

const SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    module: {
      type: "string",
      description: "Ruta o modulo principal afectado, ej. 'packages/cli'",
    },
    intent: {
      type: "string",
      description: "Una frase: la intencion del cambio, no el diff literal",
    },
    changes: {
      type: "array",
      items: { type: "string" },
      description:
        "Changelog LITERAL: que se agrego, modifico o borro. Ejemplos: " +
        "'se cambio el color del boton X a azul', 'se agrego la imagen Y', " +
        "'se instalo la libreria Z', 'se configuro la variable W en .env'. " +
        "Lista vacia si no hay cambios concretos que valga la pena listar.",
    },
    decisions: {
      type: "array",
      items: { type: "string" },
      description: "Decisiones de diseno tomadas, si las hay",
    },
    gotchas: {
      type: "array",
      items: { type: "string" },
      description: "Comportamientos sorprendentes o trampas descubiertas, si las hay",
    },
  },
  required: ["module", "intent", "changes", "decisions", "gotchas"],
} as const;

const SYSTEM_PROMPT = `Analizas un commit de git para un sistema de memoria compartida entre agentes de codigo.

Extraes DOS tipos de informacion, sin mezclarlas:

1. "changes": el QUE, en forma de changelog LITERAL. Cosas concretas que un
   humano notaria con un vistazo rapido al diff: archivos agregados/borrados,
   componentes de UI modificados (ej. color de un boton, imagen insertada),
   librerias instaladas o quitadas, variables de configuracion/.env tocadas,
   funciones o endpoints nuevos. Sin interpretar el porque.

2. "intent"/"decisions"/"gotchas": el PORQUE. La intencion detras del cambio,
   decisiones de diseno tomadas, y gotchas (comportamientos sorprendentes)
   descubiertos. Aqui SI aplica lo siguiente:
   - NUNCA repitas el diff literal ni describas linea por linea que cambio.
   - NUNCA describas cosas que un agente ya puede deducir leyendo el codigo.
   - Si no hay una decision de diseno no obvia, devuelve una lista vacia en "decisions".
   - Si no hay un gotcha real, devuelve una lista vacia en "gotchas".
   - "intent" es una sola frase corta explicando el PORQUE del cambio, no el que.

"module" es la ruta principal afectada (ej. "packages/cli", "web/dashboard").

Respondes UNICAMENTE con un objeto JSON que cumpla el schema provisto. Nada de texto fuera del JSON.`;

export function isAiDisabled(): boolean {
  const value = (process.env.CONTEXTCORE_AI ?? "").trim().toLowerCase();
  return value === "off" || value === "false" || value === "0";
}

// Cache GLOBAL (no por proyecto): evita re-descargar ~1GB en cada repo que
// use ContextCore en la misma máquina.
export function getModelCacheDir(): string {
  return path.join(os.homedir(), ".contextcore", "models");
}

function getModelPath(): string {
  return path.join(getModelCacheDir(), MODEL_FILE_NAME);
}

export interface DownloadProgress {
  totalSize: number;
  downloadedSize: number;
}

/**
 * Descarga el modelo GGUF una sola vez (cacheado globalmente). No-op si ya
 * existe (skipExisting nativo del downloader) o si la IA está desactivada.
 * Solo debe llamarse desde `contextcore init` o el postinstall de
 * `@contextcore/cli` — nunca desde una ruta que corra en cada commit.
 */
export async function ensureModelDownloaded(
  onProgress?: (status: DownloadProgress) => void,
): Promise<string | null> {
  if (isAiDisabled()) return null;

  try {
    const dirPath = getModelCacheDir();
    fs.mkdirSync(dirPath, { recursive: true });

    const { createModelDownloader } = await import("node-llama-cpp");
    const downloader = await createModelDownloader({
      modelUri: MODEL_URI,
      dirPath,
      fileName: MODEL_FILE_NAME,
      onProgress,
    });
    return await downloader.download();
  } catch (err) {
    console.warn(`[contextcore] aviso: no se pudo descargar el modelo de IA local (${(err as Error).message})`);
    return null;
  }
}

function getCachedModelPathIfExists(): string | null {
  const modelPath = getModelPath();
  return fs.existsSync(modelPath) ? modelPath : null;
}

/** True si el GGUF ya está en ~/.contextcore/models/ (no hace red). */
export function isModelCached(): boolean {
  return getCachedModelPathIfExists() !== null;
}

// Singletons a nivel de módulo: `getLlama()`/`loadModel()` son costosos, y un
// proceso `contextcore capture` solo necesita cargar el modelo una vez.
let llamaSingleton: Llama | null = null;
let modelSingleton: LlamaModel | null = null;
let modelLoadPromise: Promise<LlamaModel | null> | null = null;

async function loadModelSingleton(): Promise<LlamaModel | null> {
  if (modelSingleton) return modelSingleton;
  if (modelLoadPromise) return modelLoadPromise;

  modelLoadPromise = (async () => {
    const modelPath = getCachedModelPathIfExists();
    if (!modelPath) return null;

    const { getLlama } = await import("node-llama-cpp");
    llamaSingleton ??= await getLlama();
    const model = await llamaSingleton.loadModel({ modelPath });
    modelSingleton = model;
    return model;
  })();

  try {
    return await modelLoadPromise;
  } finally {
    modelLoadPromise = null;
  }
}

/**
 * Best-effort: nunca lanza. Devuelve `null` si la IA está desactivada, el
 * modelo todavía no se descargó, la plataforma no tiene binario compatible,
 * o cualquier otro fallo (out of memory, etc.) — el caller cae al fallback
 * sin IA (`buildEventFromLastCommit`).
 *
 * Nunca dispara una descarga: un commit no debe quedarse colgado bajando
 * ~1GB. Solo `ensureModelDownloaded` (disparado desde `contextcore init`)
 * descarga el modelo.
 */
export async function summarizeLocally(diff: string, commitMessage: string): Promise<LocalSummary | null> {
  if (isAiDisabled()) return null;

  try {
    const model = await loadModelSingleton();
    if (!model) return null;

    const { LlamaChatSession } = await import("node-llama-cpp");
    const context = await model.createContext();
    try {
      const session = new LlamaChatSession({
        contextSequence: context.getSequence(),
        systemPrompt: SYSTEM_PROMPT,
      });

      const grammar = await model.llama.createGrammarForJsonSchema(SUMMARY_SCHEMA);
      const truncatedDiff = diff.slice(0, MAX_DIFF_CHARS);
      const userContent =
        `Mensaje de commit:\n${commitMessage}\n\n` +
        `Diff:\n${truncatedDiff}\n\n` +
        `Responde en JSON con exactamente estas claves: module, intent, changes, decisions, gotchas.`;

      const response = await session.prompt(userContent, { grammar, temperature: 0 });
      const parsed = grammar.parse(response);
      return {
        module: parsed.module,
        intent: parsed.intent,
        changes: parsed.changes ?? [],
        decisions: parsed.decisions ?? [],
        gotchas: parsed.gotchas ?? [],
      };
    } finally {
      await context.dispose();
    }
  } catch (err) {
    console.warn(`[contextcore capture] aviso: IA local no disponible, uso fallback local (${(err as Error).message})`);
    return null;
  }
}
