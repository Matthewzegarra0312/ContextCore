import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
//pruebas para ver si se actualiza usando github desktop
// Recibe el redirect de Supabase tras el login con GitHub (PKCE), intercambia
// el `code` por una sesión (guardada en cookies) y manda al usuario a donde
// venía — el dashboard, o `/cli-login?code=...` si el login empezó desde el CLI.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
