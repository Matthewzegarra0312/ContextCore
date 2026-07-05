import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

// Cliente con Service Role — bypassea RLS. SOLO se usa en Route Handlers
// server-side (nunca en código que llegue al browser) para gestionar el
// handshake de `contextcore login` en la tabla `cli_auth_sessions`.
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}
