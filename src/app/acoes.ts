"use server";

import { revalidatePath } from "next/cache";
import { supabaseServidor } from "@/lib/supabase/server";
import { exigirMembro, modoDemo } from "@/lib/sessao";
import * as demo from "@/lib/demo";
import type { ItemTipo } from "@/lib/tipos";

function tipoValido(t: string): t is ItemTipo {
  return t === "encontro" || t === "material";
}

/** Liga/desliga favorito. Devolve o novo estado. */
export async function alternarFavorito(tipo: string, id: string): Promise<boolean> {
  await exigirMembro();
  if (!tipoValido(tipo)) throw new Error("Tipo inválido");

  if (modoDemo()) {
    const i = demo.demoFavoritos.findIndex((f) => f.item_tipo === tipo && f.item_id === id);
    if (i >= 0) demo.demoFavoritos.splice(i, 1);
    else demo.demoFavoritos.unshift({ item_tipo: tipo, item_id: id });
    revalidatePath("/", "layout");
    return i < 0;
  }

  const sb = await supabaseServidor();
  const { data: existente } = await sb
    .from("favoritos")
    .select("item_id")
    .eq("item_tipo", tipo)
    .eq("item_id", id)
    .maybeSingle();

  if (existente) {
    const { error } = await sb.from("favoritos").delete().eq("item_tipo", tipo).eq("item_id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb.from("favoritos").insert({ item_tipo: tipo, item_id: id });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/", "layout");
  return !existente;
}

/**
 * Salva até onde a pessoa assistiu/leu. Uma vez concluído, continua concluído
 * mesmo que ela volte para rever.
 */
export async function salvarProgresso(
  tipo: string,
  id: string,
  percentual: number,
  posicao: number,
  concluir = false,
): Promise<void> {
  const { userId } = await exigirMembro();
  if (!tipoValido(tipo)) return;
  const pct = Math.max(0, Math.min(100, Math.round(percentual)));
  const pos = Math.max(0, Math.round(posicao));

  if (modoDemo()) {
    const atual = demo.demoProgresso.find((p) => p.item_tipo === tipo && p.item_id === id);
    const concluido = Boolean(atual?.concluido || concluir || pct >= 90);
    const novo = { item_tipo: tipo, item_id: id, percentual: Math.max(pct, atual?.percentual ?? 0), posicao: pos, concluido, atualizado_em: new Date().toISOString() };
    if (atual) Object.assign(atual, novo);
    else demo.demoProgresso.unshift(novo);
    return;
  }

  const sb = await supabaseServidor();
  const { data: atual } = await sb
    .from("progresso")
    .select("percentual, concluido")
    .eq("item_tipo", tipo)
    .eq("item_id", id)
    .maybeSingle();
  const anterior = atual as { percentual: number; concluido: boolean } | null;

  await sb.from("progresso").upsert({
    user_id: userId,
    item_tipo: tipo,
    item_id: id,
    percentual: Math.max(pct, anterior?.percentual ?? 0),
    posicao: pos,
    concluido: Boolean(anterior?.concluido || concluir || pct >= 90),
    atualizado_em: new Date().toISOString(),
  });
}

/** Botão "marcar como assistida/lido". */
export async function definirConcluido(tipo: string, id: string, concluido: boolean): Promise<void> {
  const { userId } = await exigirMembro();
  if (!tipoValido(tipo)) return;

  if (modoDemo()) {
    const atual = demo.demoProgresso.find((p) => p.item_tipo === tipo && p.item_id === id);
    if (atual) {
      atual.concluido = concluido;
      if (concluido) atual.percentual = 100;
    } else {
      demo.demoProgresso.unshift({ item_tipo: tipo, item_id: id, percentual: concluido ? 100 : 0, posicao: 0, concluido, atualizado_em: new Date().toISOString() });
    }
    revalidatePath("/", "layout");
    return;
  }

  const sb = await supabaseServidor();
  const { error } = await sb.from("progresso").upsert({
    user_id: userId,
    item_tipo: tipo,
    item_id: id,
    concluido,
    ...(concluido ? { percentual: 100 } : {}),
    atualizado_em: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export type EstadoPresenca = { ok: boolean; mensagem: string } | null;

export async function registrarPresenca(_: EstadoPresenca, form: FormData): Promise<EstadoPresenca> {
  const { membro } = await exigirMembro();
  const codigo = String(form.get("codigo") ?? "").replace(/\D/g, "");
  if (codigo.length !== 4) return { ok: false, mensagem: "O código tem 4 números. Confira no quadro e tente de novo." };

  if (modoDemo()) {
    const c = demo.demoCodigos.find((x) => x.codigo === codigo && x.expira_em > new Date().toISOString());
    if (!c) return { ok: false, mensagem: "Código inválido ou expirado. Peça o código atual para a diretoria." };
    if (!demo.demoPresencas.some((p) => p.encontro_id === c.encontro_id && p.email === membro.email)) {
      demo.demoPresencas.push({ encontro_id: c.encontro_id, email: membro.email, origem: "codigo", registrado_em: new Date().toISOString() });
    }
    const e = demo.demoEncontros.find((x) => x.id === c.encontro_id);
    revalidatePath("/", "layout");
    return { ok: true, mensagem: `Presença registrada: ${e?.titulo ?? "encontro"}.` };
  }

  const sb = await supabaseServidor();
  const { data, error } = await sb.rpc("registrar_presenca", { p_codigo: codigo });
  if (error) {
    return {
      ok: false,
      mensagem: error.message.includes("codigo invalido")
        ? "Código inválido ou expirado. Peça o código atual para a diretoria."
        : "Não foi possível registrar agora. Tente de novo em instantes.",
    };
  }
  const linha = (data as { titulo_encontro: string }[] | null)?.[0];
  revalidatePath("/", "layout");
  return { ok: true, mensagem: `Presença registrada: ${linha?.titulo_encontro ?? "encontro"}.` };
}
