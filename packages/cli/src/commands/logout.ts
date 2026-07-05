import { clearCredentials } from "@contextcore/core";

export async function logout(): Promise<void> {
  const removed = clearCredentials();
  console.log(
    removed
      ? "[contextcore logout] Sesión cerrada. Si SUPABASE_URL/SUPABASE_ANON_KEY están en tu .env, el CLI sigue sincronizando en modo anónimo."
      : "[contextcore logout] No había ninguna sesión iniciada."
  );
}
