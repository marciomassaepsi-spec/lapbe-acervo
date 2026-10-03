import { NextResponse, type NextRequest } from "next/server";
import { supabaseServidor } from "@/lib/supabase/server";

/** Volta do login com Google: cria a sessão e confere se o e-mail está na lista de membros. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const destino = (caminho: string) => NextResponse.redirect(new URL(caminho, url.origin));

  if (!code) return destino("/entrar?erro=falha");

  const supabase = await supabaseServidor();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return destino("/entrar?erro=falha");

  const { data: membro } = await supabase.rpc("eh_membro");
  if (!membro) {
    await supabase.auth.signOut();
    return destino("/entrar?erro=acesso");
  }
  return destino("/");
}
