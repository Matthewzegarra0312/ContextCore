import path from "node:path";

export function getContextCoreDir(cwd: string = process.cwd()): string {
  return path.join(cwd, ".contextcore");
}

// Archivo único compartido por todo el equipo (cada línea ya incluye el
// campo "author"). Antes era un .jsonl por autor; se consolidó en uno solo
// para simplificar el modelo mental — sigue siendo append-only, así que el
// riesgo de conflicto de merge es bajo (solo se agrega al final).
export function getEventsLogPath(cwd: string = process.cwd()): string {
  return path.join(getContextCoreDir(cwd), "context.jsonl");
}
