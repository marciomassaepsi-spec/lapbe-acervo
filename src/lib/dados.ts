/**
 * Leitura de dados. Toda consulta passa pelas regras de acesso (RLS) do Supabase,
 * com a sessão de quem está usando o app. No modo demonstração, lê dos exemplos.
 */
import { cache } from "react";
import { supabaseServidor } from "./supabase/server";
import { modoDemo } from "./sessao";
import * as demo from "./demo";
import { dataDeTimestamp, hoje } from "./formato";
import type {
  Aviso,
  CodigoPresenca,
  Eixo,
  Encontro,
  Favorito,
  ItemBiblioteca,
  Material,
  Membro,
  Presenca,
  Progresso,
  TipoMaterial,
} from "./tipos";

type Resultado = { data: unknown; error: { message: string } | null };

function lista<T>(r: Resultado): T[] {
  if (r.error) throw new Error(r.error.message);
  return (r.data ?? []) as T[];
}

function um<T>(r: Resultado): T | null {
  if (r.error) throw new Error(r.error.message);
  return (r.data ?? null) as T | null;
}

const ID_VALIDO = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/i;
export const idValido = (id: string) => ID_VALIDO.test(id);

// ---------------------------------------------------------------- conteúdo

export const listarEixos = cache(async (): Promise<Eixo[]> => {
  if (modoDemo()) return demo.demoEixos;
  const sb = await supabaseServidor();
  return lista<Eixo>(await sb.from("eixos").select("*").order("ordem").order("nome"));
});

export const listarEncontros = cache(async (): Promise<Encontro[]> => {
  if (modoDemo()) return [...demo.demoEncontros].sort((a, b) => b.data.localeCompare(a.data));
  const sb = await supabaseServidor();
  return lista<Encontro>(await sb.from("encontros").select("*").order("data", { ascending: false }));
});

export async function encontroPorId(id: string): Promise<Encontro | null> {
  if (!idValido(id)) return null;
  if (modoDemo()) return demo.demoEncontros.find((e) => e.id === id) ?? null;
  const sb = await supabaseServidor();
  return um<Encontro>(await sb.from("encontros").select("*").eq("id", id).maybeSingle());
}

export async function proximosEncontros(limite = 3): Promise<Encontro[]> {
  const hj = hoje();
  return (await listarEncontros())
    .filter((e) => e.publicado && e.data >= hj)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, limite);
}

export const listarMateriais = cache(async (): Promise<Material[]> => {
  if (modoDemo()) return [...demo.demoMateriais].sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  const sb = await supabaseServidor();
  return lista<Material>(await sb.from("materiais").select("*").order("criado_em", { ascending: false }));
});

export async function materialPorId(id: string): Promise<Material | null> {
  if (!idValido(id)) return null;
  return (await listarMateriais()).find((m) => m.id === id) ?? null;
}

export async function materialPorArquivo(driveId: string): Promise<Material | null> {
  if (modoDemo()) return demo.demoMateriais.find((m) => m.drive_file_id === driveId) ?? null;
  const sb = await supabaseServidor();
  const r = await sb.from("materiais").select("*").eq("drive_file_id", driveId).limit(1);
  return lista<Material>(r)[0] ?? null;
}

export async function materiaisDoEncontro(encontroId: string): Promise<Material[]> {
  return (await listarMateriais()).filter((m) => m.encontro_id === encontroId);
}

export type FiltroBiblioteca = { q?: string; tipo?: string; eixo?: string };

/** Aulas gravadas + materiais, do mais novo para o mais antigo. */
export async function biblioteca(filtro: FiltroBiblioteca = {}): Promise<ItemBiblioteca[]> {
  const [encontros, materiais] = await Promise.all([listarEncontros(), listarMateriais()]);
  const hj = hoje();
  const itens: ItemBiblioteca[] = [
    ...encontros
      .filter((e) => e.publicado && e.youtube_id && e.data <= hj)
      .map((e) => ({ tipo: "aula" as const, encontro: e, data: e.data })),
    ...materiais
      .filter((m) => m.publicado)
      .map((m) => ({ tipo: m.tipo, material: m, data: dataDeTimestamp(m.criado_em) })),
  ];

  const busca = normalizar(filtro.q ?? "");
  const eixo = filtro.eixo ? Number(filtro.eixo) : null;
  return itens
    .filter((i) => !filtro.tipo || i.tipo === filtro.tipo)
    .filter((i) => !eixo || eixoDoItem(i) === eixo)
    .filter((i) => !busca || normalizar(tituloDoItem(i)).includes(busca))
    .sort((a, b) => b.data.localeCompare(a.data));
}

export function tituloDoItem(i: ItemBiblioteca) {
  return i.tipo === "aula" ? i.encontro.titulo : i.material.titulo;
}

export function eixoDoItem(i: ItemBiblioteca) {
  return i.tipo === "aula" ? i.encontro.eixo_id : i.material.eixo_id;
}

export function idDoItem(i: ItemBiblioteca) {
  return i.tipo === "aula" ? i.encontro.id : i.material.id;
}

function normalizar(t: string) {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export async function destaques(): Promise<ItemBiblioteca[]> {
  return (await biblioteca()).filter((i) => (i.tipo === "aula" ? i.encontro.destaque : i.material.destaque)).slice(0, 3);
}

export const listarAvisos = cache(async (): Promise<Aviso[]> => {
  const ordenar = (a: Aviso[]) =>
    [...a].sort((x, y) => Number(y.fixado) - Number(x.fixado) || y.criado_em.localeCompare(x.criado_em));
  if (modoDemo()) return ordenar(demo.demoAvisos);
  const sb = await supabaseServidor();
  return ordenar(lista<Aviso>(await sb.from("avisos").select("*")));
});

// ---------------------------------------------------------------- dados do ligante

export const meuProgresso = cache(async (): Promise<Progresso[]> => {
  if (modoDemo()) return demo.demoProgresso;
  const sb = await supabaseServidor();
  return lista<Progresso>(await sb.from("progresso").select("*").order("atualizado_em", { ascending: false }));
});

export const meusFavoritos = cache(async (): Promise<Favorito[]> => {
  if (modoDemo()) return demo.demoFavoritos;
  const sb = await supabaseServidor();
  return lista<Favorito>(await sb.from("favoritos").select("item_tipo, item_id").order("criado_em", { ascending: false }));
});

export const minhasPresencas = cache(async (email: string): Promise<Presenca[]> => {
  if (modoDemo()) return demo.demoPresencas.filter((p) => p.email === email);
  const sb = await supabaseServidor();
  return lista<Presenca>(await sb.from("presencas").select("*").eq("email", email));
});

// ---------------------------------------------------------------- diretoria

export async function listarMembros(): Promise<Membro[]> {
  if (modoDemo()) return [...demo.demoMembros].sort((a, b) => a.nome.localeCompare(b.nome));
  const sb = await supabaseServidor();
  return lista<Membro>(await sb.from("membros").select("*").order("nome"));
}

export async function presencasDoEncontro(encontroId: string): Promise<Presenca[]> {
  if (modoDemo()) return demo.demoPresencas.filter((p) => p.encontro_id === encontroId);
  const sb = await supabaseServidor();
  return lista<Presenca>(await sb.from("presencas").select("*").eq("encontro_id", encontroId));
}

export async function todasPresencas(): Promise<Presenca[]> {
  if (modoDemo()) return demo.demoPresencas;
  const sb = await supabaseServidor();
  return lista<Presenca>(await sb.from("presencas").select("*"));
}

export async function codigoDoEncontro(encontroId: string): Promise<CodigoPresenca | null> {
  if (modoDemo()) return demo.demoCodigos.find((c) => c.encontro_id === encontroId) ?? null;
  const sb = await supabaseServidor();
  return um<CodigoPresenca>(await sb.from("presenca_codigos").select("*").eq("encontro_id", encontroId).maybeSingle());
}

export type { TipoMaterial };
