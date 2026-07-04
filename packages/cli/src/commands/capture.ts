import {
  buildEventFromLastCommit,
  captureEventViaSummarizer,
  appendEvent,
  insertEventBestEffort,
} from "@contextcore/core";

export async function capture(): Promise<void> {
  const llmEvent = await captureEventViaSummarizer();
  const event = llmEvent ?? buildEventFromLastCommit();

  appendEvent(event);
  await insertEventBestEffort(event);

  const source = llmEvent ? "resumen IA" : "mensaje de commit (fallback)";
  console.log(`[contextcore capture] Evento registrado (${source}) por ${event.author} en ${event.module}`);
}
