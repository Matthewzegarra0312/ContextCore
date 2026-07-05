import type { ContextEvent } from "./types.js";
import { readCredentials } from "./credentials.js";

// Best-effort: el CLI debe funcionar 100% offline. Si no hay credenciales o
// falla la red, esto nunca debe romper el flujo local (append al .jsonl).
//
// Si el usuario corrió `contextcore login`, usamos esa sesión (autenticada,
// tokens de `~/.contextcore/credentials.json`) en vez del anon key suelto —
// así el insert queda asociado al usuario real, no solo a un slug de texto.
export async function insertEventBestEffort(event: ContextEvent): Promise<void> {
  const credentials = readCredentials();
  const url = credentials?.supabase_url ?? process.env.SUPABASE_URL;
  const key = credentials?.supabase_anon_key ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(url, key);

    if (credentials) {
      await client.auth.setSession({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
      });
    }

    const { error } = await client.from("context_events").insert(event);
    if (error) {
      console.warn(`[contextcore] aviso: no se pudo sincronizar con Supabase (${error.message})`);
    }
  } catch (err) {
    console.warn(`[contextcore] aviso: Supabase no disponible, evento guardado solo en local (${(err as Error).message})`);
  }
}
