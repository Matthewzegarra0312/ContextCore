import { buildEventFromLastCommit, appendEvent, insertEventBestEffort } from "@contextcore/core";

export async function capture(): Promise<void> {
  const event = buildEventFromLastCommit();
  appendEvent(event);
  await insertEventBestEffort(event);
  console.log(`[contextcore capture] Evento registrado desde el último commit por ${event.author} en ${event.module}`);
}
