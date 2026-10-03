export type Papel = "ligante" | "diretoria";

export type Membro = {
  email: string;
  nome: string;
  papel: Papel;
  turma: string | null;
  ativo: boolean;
};

export type Eixo = {
  id: number;
  nome: string;
  descricao: string | null;
  ordem: number;
};

export type Capitulo = { inicio: number; titulo: string };

export type Encontro = {
  id: string;
  numero: number | null;
  semestre: string;
  titulo: string;
  data: string; // AAAA-MM-DD
  hora: string | null;
  local: string | null;
  eixo_id: number | null;
  apresentador: string | null;
  youtube_id: string | null;
  duracao_min: number | null;
  capitulos: Capitulo[];
  mensagem_central: string | null;
  resumo: string | null;
  caso_clinico: string | null;
  referencias: string | null;
  leitura_previa: string | null;
  destaque: boolean;
  publicado: boolean;
};

export const TIPOS_MATERIAL = ["slides", "resumo", "artigo", "caso", "simulado", "outro"] as const;
export type TipoMaterial = (typeof TIPOS_MATERIAL)[number];

export const NOME_TIPO: Record<TipoMaterial | "aula", string> = {
  aula: "Aula gravada",
  slides: "Slides",
  resumo: "Resumo",
  artigo: "Artigo",
  caso: "Caso clínico",
  simulado: "Simulado",
  outro: "Outro",
};

export type Material = {
  id: string;
  titulo: string;
  tipo: TipoMaterial;
  descricao: string | null;
  drive_file_id: string | null;
  drive_mime: string | null;
  link_url: string | null;
  encontro_id: string | null;
  eixo_id: number | null;
  nivel_evidencia: string | null;
  referencia_apa: string | null;
  paginas: number | null;
  destaque: boolean;
  publicado: boolean;
  criado_em: string;
};

export type Aviso = {
  id: string;
  titulo: string;
  corpo: string;
  autor: string | null;
  fixado: boolean;
  criado_em: string;
};

export type ItemTipo = "encontro" | "material";

export type Progresso = {
  item_tipo: ItemTipo;
  item_id: string;
  percentual: number;
  posicao: number;
  concluido: boolean;
  atualizado_em: string;
};

export type Favorito = { item_tipo: ItemTipo; item_id: string };

export type Presenca = {
  encontro_id: string;
  email: string;
  origem: "codigo" | "manual";
  registrado_em: string;
};

export type CodigoPresenca = { encontro_id: string; codigo: string; expira_em: string };

/** Um item da biblioteca: uma aula gravada (encontro) ou um material. */
export type ItemBiblioteca =
  | { tipo: "aula"; encontro: Encontro; data: string }
  | { tipo: TipoMaterial; material: Material; data: string };
