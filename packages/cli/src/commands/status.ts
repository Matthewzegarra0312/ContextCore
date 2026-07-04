import { readAllEvents, type ContextEvent } from "@contextcore/core";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "hace instantes";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

export async function status(): Promise<void> {
  const events = readAllEvents();
  if (events.length === 0) {
    console.log("[contextcore status] Sin eventos todavía. Usa `contextcore log` para registrar uno.");
    return;
  }

  const latestByAuthor = new Map<string, ContextEvent>();
  for (const event of events) {
    const current = latestByAuthor.get(event.author);
    if (!current || new Date(event.timestamp) > new Date(current.timestamp)) {
      latestByAuthor.set(event.author, event);
    }
  }

  const rows = [...latestByAuthor.values()].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  console.log(`[contextcore status] ${rows.length} dev(s) activos, ${events.length} evento(s) en total\n`);
  for (const event of rows) {
    console.log(`  ${event.author.padEnd(12)} ${event.module.padEnd(20)} ${event.intent} (${relativeTime(event.timestamp)})`);
  }
}
