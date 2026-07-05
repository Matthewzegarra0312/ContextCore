import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Paso 2: la pestaña /cli-login (con el usuario ya logueado por cookies)
// llama esto para "sellar" la sesión pendiente con los tokens del usuario.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const id = body?.id as string | undefined;
  if (!id) {
    return NextResponse.json({ error: "Falta el código de autorización." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  if (!supabase || !admin) {
    return NextResponse.json(
      { error: "Supabase no está configurado en el servidor." },
      { status: 503 }
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "No hay una sesión activa." }, { status: 401 });
  }

  const { data: row, error: fetchError } = await admin
    .from("cli_auth_sessions")
    .select("id, status, expires_at")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !row) {
    return NextResponse.json({ error: "Código de autorización inválido." }, { status: 404 });
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Este código de autorización expiró." }, { status: 410 });
  }

  const githubLogin =
    (session.user.user_metadata?.user_name as string | undefined) ||
    (session.user.user_metadata?.preferred_username as string | undefined) ||
    session.user.email ||
    "unknown";

  const { error: updateError } = await admin
    .from("cli_auth_sessions")
    .update({
      status: "complete",
      user_id: session.user.id,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      github_login: githubLogin,
    })
    .eq("id", id)
    .eq("status", "pending");

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, github_login: githubLogin });
}
