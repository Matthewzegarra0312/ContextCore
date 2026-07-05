import { spawn } from "node:child_process";
import { writeCredentials, type ContextCoreCredentials } from "@contextcore/core";

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 5 * 60 * 1000;

interface StartResponse {
  id: string;
  device_secret: string;
  verification_url: string;
}

interface TokenResponse {
  status: "pending" | "complete" | "expired";
  error?: string;
  access_token?: string;
  refresh_token?: string;
  github_login?: string;
  supabase_url?: string;
  supabase_anon_key?: string;
}

function getWebUrl(): string {
  return (process.env.CONTEXTCORE_WEB_URL || "http://localhost:3000").replace(/\/+$/, "");
}

// Best-effort: si no se puede abrir el navegador (ej. SSH sin display), el
// link ya impreso en la terminal sigue siendo suficiente para continuar.
function openBrowser(url: string): void {
  try {
    if (process.platform === "win32") {
      spawn("cmd", ["/c", "start", '""', url], { stdio: "ignore", detached: true }).unref();
    } else if (process.platform === "darwin") {
      spawn("open", [url], { stdio: "ignore", detached: true }).unref();
    } else {
      spawn("xdg-open", [url], { stdio: "ignore", detached: true }).unref();
    }
  } catch {
    // sin soporte para abrir navegador en este entorno — no es fatal
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Device-code flow, igual que `gh auth login` / Claude Code: el CLI nunca
// maneja el login de GitHub directamente, solo abre la web y hace polling
// hasta que el usuario autoriza desde el navegador (ver web/app/cli-login).
export async function login(): Promise<void> {
  const webUrl = getWebUrl();

  let start: StartResponse;
  try {
    const res = await fetch(`${webUrl}/api/cli/start`, { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as { error?: string });
      console.error(`[contextcore login] No se pudo iniciar el login: ${body.error ?? res.statusText}`);
      process.exit(1);
    }
    start = (await res.json()) as StartResponse;
  } catch (err) {
    console.error(
      `[contextcore login] No se pudo contactar a ${webUrl}. ¿CONTEXTCORE_WEB_URL apunta a tu deploy de Vercel? (${(err as Error).message})`
    );
    process.exit(1);
  }

  const shortCode = start.id.replace(/-/g, "").slice(0, 8).toUpperCase();

  console.log("");
  console.log("  Para continuar, abre este link e inicia sesión con GitHub:");
  console.log(`  ${start.verification_url}`);
  console.log("");
  console.log(`  Código de verificación: ${shortCode}`);
  console.log("  (confirma que coincide con el que ves en la página antes de autorizar)");
  console.log("");
  console.log("  Abriendo el navegador...");
  console.log("");

  openBrowser(start.verification_url);

  const deadline = Date.now() + TIMEOUT_MS;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    let res: Response;
    try {
      res = await fetch(`${webUrl}/api/cli/token`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: start.id, device_secret: start.device_secret }),
      });
    } catch {
      continue; // red intermitente — seguimos con el polling
    }

    if (res.status === 410) {
      console.error("[contextcore login] El código expiró. Corré `contextcore login` de nuevo.");
      process.exit(1);
    }

    if (!res.ok) continue;

    const data = (await res.json()) as TokenResponse;
    if (data.status === "pending") continue;

    if (data.status === "complete" && data.access_token && data.refresh_token && data.supabase_url && data.supabase_anon_key) {
      const credentials: ContextCoreCredentials = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        github_login: data.github_login ?? "unknown",
        supabase_url: data.supabase_url,
        supabase_anon_key: data.supabase_anon_key,
      };
      writeCredentials(credentials);
      console.log(`[contextcore login] ¡Listo! Sesión iniciada como ${credentials.github_login}.`);
      return;
    }
  }

  console.error("[contextcore login] Tiempo de espera agotado. Corré `contextcore login` de nuevo.");
  process.exit(1);
}
