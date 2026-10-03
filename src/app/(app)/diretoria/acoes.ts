"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/server";
import { exigirDiretoria, modoDemo } from "@/lib/sessao";
import * as demo from "@/lib/demo";
import { driveConfigurado, metadados } from "@/lib/drive";
import { idDrive, idYouTube, lerTempo } from "@/lib/formato";
import { TIPOS_MATERIAL, type Capitulo, type Encontro, type Material, type Papel, type TipoMaterial } from "@/lib/tipos";

export type EstadoForm = { erro?: string; ok?: string } | null;

// ---------------------------------------------------------------- utilitários

const txt = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v === "" ? null : v;
};
const num = (f: FormData, k: string) => {
  const v = txt(f, k);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const marcado = (f: FormData, k: string) => f.get(k) === "on";

async function sb() {
  return supabaseServidor();
}

function atualizarTudo() {
  revalidatePath("/", "layout");
}

/** "07:05 Como ler uma revisão" por linha -> capítulos */
function lerCapitulos(texto: string | null): Capitulo[] | string {
  if (!texto) return [];
  const caps: Capitulo[] = [];
  for (const linha of texto.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const m = linha.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]?\s*(.+)$/);
    const inicio = m ? lerTempo(m[1]) : null;
    if (!m || inicio === null) return `Capítulo inválido: "${linha}". Use o formato 07:05 Título.`;
    caps.push({ inicio, titulo: m[2].trim() });
  }
  return caps.sort((a, b) => a.inicio - b.inicio);
}

// ---------------------------------------------------------------- encontros

export async function salvarEncontro(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  await exigirDiretoria();
  const id = txt(f, "id");
  const titulo = txt(f, "titulo");
  const data = txt(f, "data");
  const semestre = txt(f, "semestre");
  if (!titulo || !data || !semestre) return { erro: "Preencha título, data e semestre." };

  const youtubeTexto = txt(f, "youtube");
  const youtube_id = youtubeTexto ? idYouTube(youtubeTexto) : null;
  if (youtubeTexto && !youtube_id) return { erro: "Não reconheci o link do YouTube. Cole o link completo do vídeo." };

  const capitulos = lerCapitulos(txt(f, "capitulos"));
  if (typeof capitulos === "string") return { erro: capitulos };

  const dados: Omit<Encontro, "id"> = {
    titulo,
    data,
    semestre,
    numero: num(f, "numero"),
    hora: txt(f, "hora"),
    local: txt(f, "local"),
    eixo_id: num(f, "eixo_id"),
    apresentador: txt(f, "apresentador"),
    youtube_id,
    duracao_min: num(f, "duracao_min"),
    capitulos,
    mensagem_central: txt(f, "mensagem_central"),
    leitura_previa: txt(f, "leitura_previa"),
    resumo: txt(f, "resumo"),
    caso_clinico: txt(f, "caso_clinico"),
    referencias: txt(f, "referencias"),
    destaque: marcado(f, "destaque"),
    publicado: marcado(f, "publicado"),
  };

  let novoId = id;
  if (modoDemo()) {
    if (id) Object.assign(demo.demoEncontros.find((e) => e.id === id) ?? {}, dados);
    else {
      novoId = crypto.randomUUID();
      demo.demoEncontros.push({ id: novoId, ...dados });
    }
  } else {
    const cliente = await sb();
    if (id) {
      const { error } = await cliente.from("encontros").update(dados).eq("id", id);
      if (error) return { erro: `Não foi possível salvar: ${error.message}` };
    } else {
      const { data: criado, error } = await cliente.from("encontros").insert(dados).select("id").single();
      if (error) return { erro: `Não foi possível salvar: ${error.message}` };
      novoId = (criado as { id: string }).id;
    }
  }
  atualizarTudo();
  redirect(`/diretoria/encontros?salvo=${novoId}`);
}

export async function excluirEncontro(f: FormData) {
  await exigirDiretoria();
  const id = txt(f, "id");
  if (!id) return;
  if (modoDemo()) {
    const i = demo.demoEncontros.findIndex((e) => e.id === id);
    if (i >= 0) demo.demoEncontros.splice(i, 1);
  } else {
    const { error } = await (await sb()).from("encontros").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
  atualizarTudo();
  redirect("/diretoria/encontros");
}

// ---------------------------------------------------------------- materiais

export async function salvarMaterial(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  await exigirDiretoria();
  const id = txt(f, "id");
  const titulo = txt(f, "titulo");
  const tipo = txt(f, "tipo") as TipoMaterial | null;
  if (!titulo) return { erro: "Dê um título ao material." };
  if (!tipo || !TIPOS_MATERIAL.includes(tipo)) return { erro: "Escolha o tipo do material." };

  const driveTexto = txt(f, "drive");
  const drive_file_id = driveTexto ? idDrive(driveTexto) : null;
  if (driveTexto && !drive_file_id) return { erro: "Não reconheci o link do Drive. Escolha o arquivo na lista ou cole o link de compartilhamento." };
  const link_url = txt(f, "link_url");
  if (link_url && !/^https?:\/\//.test(link_url)) return { erro: "O link externo precisa começar com http:// ou https://." };
  if (!drive_file_id && !link_url) return { erro: "Escolha um arquivo do Drive ou informe um link." };

  let drive_mime = txt(f, "drive_mime");
  if (drive_file_id && !modoDemo() && driveConfigurado()) {
    const info = await metadados(drive_file_id);
    if (!info) return { erro: "A conta de serviço não consegue abrir esse arquivo. Ele está dentro da pasta compartilhada da liga?" };
    drive_mime = info.mimeType;
  }

  const dados: Omit<Material, "id" | "criado_em"> = {
    titulo,
    tipo,
    descricao: txt(f, "descricao"),
    drive_file_id,
    drive_mime: drive_file_id ? (drive_mime ?? "application/pdf") : null,
    link_url,
    encontro_id: txt(f, "encontro_id"),
    eixo_id: num(f, "eixo_id"),
    nivel_evidencia: txt(f, "nivel_evidencia"),
    referencia_apa: txt(f, "referencia_apa"),
    paginas: num(f, "paginas"),
    destaque: marcado(f, "destaque"),
    publicado: marcado(f, "publicado"),
  };

  if (modoDemo()) {
    if (id) Object.assign(demo.demoMateriais.find((m) => m.id === id) ?? {}, dados);
    else demo.demoMateriais.push({ id: crypto.randomUUID(), criado_em: new Date().toISOString(), ...dados });
  } else {
    const cliente = await sb();
    const { error } = id
      ? await cliente.from("materiais").update(dados).eq("id", id)
      : await cliente.from("materiais").insert(dados);
    if (error) return { erro: `Não foi possível salvar: ${error.message}` };
  }
  atualizarTudo();
  redirect("/diretoria/materiais?salvo=1");
}

export async function excluirMaterial(f: FormData) {
  await exigirDiretoria();
  const id = txt(f, "id");
  if (!id) return;
  if (modoDemo()) {
    const i = demo.demoMateriais.findIndex((m) => m.id === id);
    if (i >= 0) demo.demoMateriais.splice(i, 1);
  } else {
    const { error } = await (await sb()).from("materiais").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
  atualizarTudo();
  redirect("/diretoria/materiais");
}

// ---------------------------------------------------------------- membros

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function adicionarMembros(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  await exigirDiretoria();
  const papel = (txt(f, "papel") === "diretoria" ? "diretoria" : "ligante") as Papel;
  const turma = txt(f, "turma");
  const linhas = (txt(f, "lista") ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (!linhas.length) return { erro: "Cole pelo menos um e-mail." };

  const novos: { email: string; nome: string; papel: Papel; turma: string | null; ativo: boolean }[] = [];
  const invalidos: string[] = [];
  for (const linha of linhas) {
    const partes = linha.split(/[,;\t]/).map((p) => p.trim());
    const email = partes.find((p) => EMAIL.test(p))?.toLowerCase();
    if (!email) {
      invalidos.push(linha);
      continue;
    }
    const nome = partes.filter((p) => p.toLowerCase() !== email).join(" ").trim();
    novos.push({ email, nome, papel, turma, ativo: true });
  }
  if (invalidos.length) return { erro: `Linhas sem e-mail válido: ${invalidos.slice(0, 3).join(" | ")}${invalidos.length > 3 ? "…" : ""}` };

  if (modoDemo()) {
    for (const n of novos) {
      const existente = demo.demoMembros.find((m) => m.email === n.email);
      if (existente) Object.assign(existente, { ...n, nome: n.nome || existente.nome });
      else demo.demoMembros.push(n);
    }
  } else {
    const { error } = await (await sb()).from("membros").upsert(novos, { onConflict: "email" });
    if (error) return { erro: `Não foi possível salvar: ${error.message}` };
  }
  revalidatePath("/diretoria/membros");
  return { ok: `${novos.length} ${novos.length === 1 ? "membro liberado" : "membros liberados"}.` };
}

export async function atualizarMembro(f: FormData) {
  const { membro: eu } = await exigirDiretoria();
  const email = txt(f, "email");
  const acao = txt(f, "acao");
  if (!email || !acao) return;
  if (email === eu.email && acao !== "ativar") return; // ninguém tira o próprio acesso por engano

  const mudanca: Record<string, unknown> =
    acao === "diretoria" ? { papel: "diretoria" } : acao === "ligante" ? { papel: "ligante" } : acao === "desativar" ? { ativo: false } : { ativo: true };

  if (modoDemo()) {
    const m = demo.demoMembros.find((x) => x.email === email);
    if (m) Object.assign(m, mudanca);
  } else {
    const { error } = await (await sb()).from("membros").update(mudanca).eq("email", email);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/diretoria/membros");
}

// ---------------------------------------------------------------- avisos

export async function salvarAviso(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  const { membro } = await exigirDiretoria();
  const titulo = txt(f, "titulo");
  if (!titulo) return { erro: "Escreva um título para o aviso." };
  const dados = { titulo, corpo: txt(f, "corpo") ?? "", autor: txt(f, "autor") ?? membro.nome, fixado: marcado(f, "fixado") };

  if (modoDemo()) demo.demoAvisos.unshift({ id: crypto.randomUUID(), criado_em: new Date().toISOString(), ...dados });
  else {
    const { error } = await (await sb()).from("avisos").insert(dados);
    if (error) return { erro: `Não foi possível publicar: ${error.message}` };
  }
  atualizarTudo();
  return { ok: "Aviso publicado no mural." };
}

export async function alterarAviso(f: FormData) {
  await exigirDiretoria();
  const id = txt(f, "id");
  const acao = txt(f, "acao");
  if (!id) return;
  if (modoDemo()) {
    const i = demo.demoAvisos.findIndex((a) => a.id === id);
    if (i < 0) return;
    if (acao === "excluir") demo.demoAvisos.splice(i, 1);
    else demo.demoAvisos[i].fixado = acao === "fixar";
  } else {
    const t = (await sb()).from("avisos");
    const { error } = acao === "excluir" ? await t.delete().eq("id", id) : await t.update({ fixado: acao === "fixar" }).eq("id", id);
    if (error) throw new Error(error.message);
  }
  atualizarTudo();
}

// ---------------------------------------------------------------- eixos

export async function salvarEixo(f: FormData) {
  await exigirDiretoria();
  const id = num(f, "id");
  const nome = txt(f, "nome");
  if (!nome) return;
  const dados = { nome, ordem: num(f, "ordem") ?? 0 };
  if (modoDemo()) {
    if (id) Object.assign(demo.demoEixos.find((e) => e.id === id) ?? {}, dados);
    else demo.demoEixos.push({ id: Math.max(0, ...demo.demoEixos.map((e) => e.id)) + 1, descricao: null, ...dados });
  } else {
    const t = (await sb()).from("eixos");
    const { error } = id ? await t.update(dados).eq("id", id) : await t.insert(dados);
    if (error) throw new Error(error.message);
  }
  atualizarTudo();
}

export async function excluirEixo(f: FormData) {
  await exigirDiretoria();
  const id = num(f, "id");
  if (!id) return;
  if (modoDemo()) {
    const i = demo.demoEixos.findIndex((e) => e.id === id);
    if (i >= 0) demo.demoEixos.splice(i, 1);
  } else {
    const { error } = await (await sb()).from("eixos").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
  atualizarTudo();
}

// ---------------------------------------------------------------- presença

export async function gerarCodigo(f: FormData) {
  await exigirDiretoria();
  const encontro_id = txt(f, "encontro_id");
  const minutos = Math.min(180, Math.max(5, num(f, "minutos") ?? 20));
  if (!encontro_id) return;
  const codigo = String(randomInt(0, 10000)).padStart(4, "0");
  const expira_em = new Date(Date.now() + minutos * 60_000).toISOString();

  if (modoDemo()) {
    const i = demo.demoCodigos.findIndex((c) => c.encontro_id === encontro_id);
    if (i >= 0) demo.demoCodigos.splice(i, 1);
    demo.demoCodigos.push({ encontro_id, codigo, expira_em });
  } else {
    const { error } = await (await sb()).from("presenca_codigos").upsert({ encontro_id, codigo, expira_em });
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/diretoria/presenca/${encontro_id}`);
}

export async function encerrarCodigo(f: FormData) {
  await exigirDiretoria();
  const encontro_id = txt(f, "encontro_id");
  if (!encontro_id) return;
  if (modoDemo()) {
    const i = demo.demoCodigos.findIndex((c) => c.encontro_id === encontro_id);
    if (i >= 0) demo.demoCodigos.splice(i, 1);
  } else {
    const { error } = await (await sb()).from("presenca_codigos").delete().eq("encontro_id", encontro_id);
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/diretoria/presenca/${encontro_id}`);
}

export async function marcarPresenca(f: FormData) {
  await exigirDiretoria();
  const encontro_id = txt(f, "encontro_id");
  const email = txt(f, "email");
  const presente = txt(f, "presente") === "1";
  if (!encontro_id || !email) return;

  if (modoDemo()) {
    const i = demo.demoPresencas.findIndex((p) => p.encontro_id === encontro_id && p.email === email);
    if (presente && i < 0) demo.demoPresencas.push({ encontro_id, email, origem: "manual", registrado_em: new Date().toISOString() });
    if (!presente && i >= 0) demo.demoPresencas.splice(i, 1);
  } else {
    const t = (await sb()).from("presencas");
    const { error } = presente
      ? await t.upsert({ encontro_id, email, origem: "manual" }, { onConflict: "encontro_id,email", ignoreDuplicates: true })
      : await t.delete().eq("encontro_id", encontro_id).eq("email", email);
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/diretoria/presenca/${encontro_id}`);
  revalidatePath("/", "layout");
}
