import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

// Best-effort, igual que antes: si no hay credenciales, el dashboard funciona
// con datos de ejemplo en vez de romperse (ver mockEvents.ts). A diferencia del
// cliente anon plano de @supabase/supabase-js, este guarda la sesión en cookies
// (no solo localStorage) para que el middleware pueda leerla en el server.
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    client = null;
    return client;
  }
  try {
    client = createBrowserClient(url, key);
  } catch (err) {
    // Un valor malformado (URL inválida, comillas o espacios al pegar en el
    // panel de env vars) haría que createBrowserClient lance una excepción
    // síncrona durante el render y tumbe toda la app. Degradamos a datos de
    // ejemplo, igual que cuando no hay credenciales.
    console.error("[contextcore] Supabase browser client inválido:", err);
    client = null;
  }
  return client;
}
