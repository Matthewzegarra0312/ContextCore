import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Paso 3: `contextcore login` hace polling a esto con el device_secret que
// solo él conoce. Entrega los tokens una única vez (la fila se borra al leerla).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const id = body?.id as string | undefined;
  const deviceSecret = body?.device_secret as string | undefined;

  if (!id || !deviceSecret) {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase no está configurado en el servidor." },
      { status: 503 }
    );
  }

  const { data: row, error } = await admin
    .from("cli_auth_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !row || row.device_secret !== deviceSecret) {
    return NextResponse.json({ error: "Sesión de login inválida." }, { status: 404 });
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await admin.from("cli_auth_sessions").delete().eq("id", id);
    return NextResponse.json({ status: "expired" }, { status: 410 });
  }

  if (row.status !== "complete") {
    return NextResponse.json({ status: "pending" });
  }

  // Single-use: se borra apenas se entrega al CLI, para que el link no sirva dos veces.
  await admin.from("cli_auth_sessions").delete().eq("id", id);

  return NextResponse.json({
    status: "complete",
    access_token: row.access_token,
    refresh_token: row.refresh_token,
    github_login: row.github_login,
    // Públicas por diseño (mismas que usa el dashboard) — el CLI las necesita
    // para armar su propio cliente de Supabase sin depender de un .env local.
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
