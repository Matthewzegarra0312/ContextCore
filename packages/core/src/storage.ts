import fs from "node:fs";
import path from "node:path";
import type { ContextEvent } from "./types.js";
import { getContextCoreDir, getEventsLogPath } from "./paths.js";

export function appendEvent(event: ContextEvent, cwd: string = process.cwd()): void {
  const dir = getContextCoreDir(cwd);
  fs.mkdirSync(dir, { recursive: true });
  const logPath = getEventsLogPath(cwd);
  fs.appendFileSync(logPath, JSON.stringify(event) + "\n", "utf8");
}

export function readAllEvents(cwd: string = process.cwd()): ContextEvent[] {
  const dir = getContextCoreDir(cwd);
  if (!fs.existsSync(dir)) return [];

  const events: ContextEvent[] = [];
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".jsonl")) continue;
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      try {
        events.push(JSON.parse(line) as ContextEvent);
      } catch {
        // línea corrupta (p.ej. archivo editado a mano): se ignora, no rompe el status
      }
    }
  }
  return events;
}
