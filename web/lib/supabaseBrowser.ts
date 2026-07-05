import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

// Best-effort, igual que antes: si no hay credenciales, el dashboard funciona
// con datos de ejemplo en vez de romperse (ver mockEvents.ts). A diferencia del
// cliente anon plano de @supabase/supabase-js, este guarda la sesión en cookies
// (no solo localStorage) para que el middleware pueda leerla en el server.
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key ? createBrowserClient(url, key) : null;
  return client;
}
