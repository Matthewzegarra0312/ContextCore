import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Paso 1 del device-code flow: `contextcore login` llama esto para abrir una
// fila "pending" en cli_auth_sessions y obtener un device_secret que solo él
// conoce (nunca viaja en la URL que se abre en el navegador).
export async function POST(request: Request) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase no está configurado en el servidor." },
      { status: 503 }
    );
  }

  const deviceSecret = crypto.randomBytes(32).toString("hex");

  const { data, error } = await admin
    .from("cli_auth_sessions")
    .insert({ device_secret: deviceSecret })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo iniciar el login del CLI." },
      { status: 500 }
    );
  }

  const { origin } = new URL(request.url);

  return NextResponse.json({
    id: data.id,
    device_secret: deviceSecret,
    verification_url: `${origin}/cli-login?code=${data.id}`,
  });
}
