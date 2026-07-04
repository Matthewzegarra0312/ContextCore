import type { ContextEvent } from "./types.js";

// Best-effort: el CLI debe funcionar 100% offline. Si no hay credenciales o
// falla la red, esto nunca debe romper el flujo local (append al .jsonl).
export async function insertEventBestEffort(event: ContextEvent): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(url, key);
    const { error } = await client.from("context_events").insert(event);
    if (error) {
      console.warn(`[contextcore] aviso: no se pudo sincronizar con Supabase (${error.message})`);
    }
  } catch (err) {
    console.warn(`[contextcore] aviso: Supabase no disponible, evento guardado solo en local (${(err as Error).message})`);
  }
}
