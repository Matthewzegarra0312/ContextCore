import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Credenciales de `contextcore login`, guardadas fuera del proyecto (a
// diferencia de .contextcore/, que es por-repo) porque una sesión de usuario
// aplica a todos los repos en los que trabaja. Incluye supabase_url/anon_key
// (públicas por diseño, como en el dashboard) para que el CLI pueda sincronizar
// sin depender de un .env local una vez logueado.
export interface ContextCoreCredentials {
  access_token: string;
  refresh_token: string;
  github_login: string;
  supabase_url: string;
  supabase_anon_key: string;
}

export function getCredentialsPath(): string {
  return path.join(os.homedir(), ".contextcore", "credentials.json");
}

export function readCredentials(): ContextCoreCredentials | null {
  try {
    const raw = fs.readFileSync(getCredentialsPath(), "utf8");
    return JSON.parse(raw) as ContextCoreCredentials;
  } catch {
    return null;
  }
}

export function writeCredentials(credentials: ContextCoreCredentials): void {
  const credentialsPath = getCredentialsPath();
  fs.mkdirSync(path.dirname(credentialsPath), { recursive: true });
  fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2), "utf8");
  try {
    fs.chmodSync(credentialsPath, 0o600);
  } catch {
    // best-effort — algunas plataformas (ej. Windows) ignoran chmod
  }
}

// Devuelve true si había una sesión guardada que se borró.
export function clearCredentials(): boolean {
  try {
    fs.unlinkSync(getCredentialsPath());
    return true;
  } catch {
    return false;
  }
}
