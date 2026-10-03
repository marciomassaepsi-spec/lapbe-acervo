import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServidor } from "./supabase/server";
import { demoMembros, DEMO_USER_ID } from "./demo";
import type { Membro } from "./tipos";

export function modoDemo() {
  return process.env.LAPBE_DEMO === "1";
}

export type Sessao = { userId: string; membro: Membro };

/** Quem está usando o app, se for um membro ativo da liga. */
export const obterSessao = cache(async (): Promise<Sessao | null> => {
  if (modoDemo()) return { userId: DEMO_USER_ID, membro: demoMembros[0] };

  const supabase = await supabaseServidor();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user?.email) return null;

  const { data } = await supabase
    .from("membros")
    .select("email, nome, papel, turma, ativo")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  const membro = data as Membro | null;
  if (!membro?.ativo) return null;

  const nomeGoogle = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  return { userId: user.id, membro: { ...membro, nome: membro.nome || nomeGoogle } };
});

export async function exigirMembro(): Promise<Sessao> {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar?erro=acesso");
  return sessao;
}

export async function exigirDiretoria(): Promise<Sessao> {
  const sessao = await exigirMembro();
  if (sessao.membro.papel !== "diretoria") redirect("/");
  return sessao;
}
