/**
 * Dados de exemplo para o modo demonstração (LAPBE_DEMO=1).
 * Servem para ver o app funcionando antes de configurar o Supabase e o Drive.
 * Nada aqui é salvo: ao reiniciar o servidor, tudo volta ao estado inicial.
 */
import type { Aviso, CodigoPresenca, Eixo, Encontro, Favorito, Material, Membro, Presenca, Progresso } from "./tipos";

export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

export const demoMembros: Membro[] = [
  { email: "ana.lima@exemplo.com", nome: "Ana Lima", papel: "diretoria", turma: "2026.2", ativo: true },
  { email: "bruno.souza@exemplo.com", nome: "Bruno Souza", papel: "ligante", turma: "2026.2", ativo: true },
  { email: "carla.mendes@exemplo.com", nome: "Carla Mendes", papel: "ligante", turma: "2026.1", ativo: true },
  { email: "diego.ramos@exemplo.com", nome: "Diego Ramos", papel: "ligante", turma: "2026.2", ativo: true },
];

export const demoEixos: Eixo[] = [
  { id: 1, nome: "Fundamentos da PBE", descricao: null, ordem: 1 },
  { id: 2, nome: "Intervenções baseadas em evidência", descricao: null, ordem: 2 },
  { id: 3, nome: "Prática clínica", descricao: null, ordem: 3 },
  { id: 4, nome: "Avaliação e psicometria", descricao: null, ordem: 4 },
  { id: 5, nome: "Pesquisa e leitura crítica", descricao: null, ordem: 5 },
];

function encontro(e: Partial<Encontro> & Pick<Encontro, "id" | "numero" | "titulo" | "data" | "eixo_id">): Encontro {
  return {
    semestre: "2026.2",
    hora: "19:00",
    local: "Sala 204",
    apresentador: "Diretoria Científica",
    youtube_id: null,
    duracao_min: null,
    capitulos: [],
    mensagem_central: null,
    resumo: null,
    caso_clinico: null,
    referencias: null,
    leitura_previa: null,
    destaque: false,
    publicado: true,
    ...e,
  };
}

export const demoEncontros: Encontro[] = [
  encontro({
    id: "e0000000-0000-4000-8000-000000000001",
    numero: 1,
    titulo: "O que é psicologia baseada em evidências",
    data: "2026-08-13",
    eixo_id: 1,
    youtube_id: "demo-lapbe1",
    duracao_min: 64,
    mensagem_central:
      "A prática baseada em evidências integra a melhor pesquisa disponível, a experiência clínica e as características, a cultura e as preferências do paciente.",
    resumo:
      "### O que vimos\n- A definição da APA (2006) e os três pilares da prática baseada em evidências.\n- Diferença entre \"baseado em evidências\" e \"validado empiricamente\".\n- Por que a experiência clínica sozinha não basta, e por que a pesquisa sozinha também não.",
    referencias:
      "APA Presidential Task Force on Evidence-Based Practice. (2006). Evidence-based practice in psychology. American Psychologist, 61(4), 271–285. https://doi.org/10.1037/0003-066X.61.4.271 | Documento de posição",
  }),
  encontro({
    id: "e0000000-0000-4000-8000-000000000002",
    numero: 2,
    titulo: "Hierarquia de evidências e o modelo dos três pilares",
    data: "2026-08-20",
    eixo_id: 1,
    youtube_id: "demo-lapbe2",
    duracao_min: 71,
  }),
  encontro({
    id: "e0000000-0000-4000-8000-000000000003",
    numero: 3,
    titulo: "Como ler um ensaio clínico randomizado",
    data: "2026-08-27",
    eixo_id: 5,
    youtube_id: "demo-lapbe3",
    duracao_min: 82,
  }),
  encontro({
    id: "e0000000-0000-4000-8000-000000000004",
    numero: 4,
    titulo: "Revisões sistemáticas e meta-análises para clínicos",
    data: "2026-09-03",
    eixo_id: 5,
    youtube_id: "demo-lapbe4",
    duracao_min: 76,
  }),
  encontro({
    id: "e0000000-0000-4000-8000-000000000005",
    numero: 5,
    titulo: "Validade e fidedignidade de instrumentos",
    data: "2026-09-10",
    eixo_id: 4,
    youtube_id: "demo-lapbe5",
    duracao_min: 68,
  }),
  encontro({
    id: "e0000000-0000-4000-8000-000000000006",
    numero: 6,
    titulo: "Formulação de caso orientada por processos",
    data: "2026-09-17",
    eixo_id: 3,
    youtube_id: "demo-lapbe6",
    duracao_min: 73,
  }),
  encontro({
    id: "e0000000-0000-4000-8000-000000000007",
    numero: 7,
    titulo: "Medidas de desfecho na rotina clínica",
    data: "2026-09-24",
    eixo_id: 4,
    youtube_id: "demo-lapbe7",
    duracao_min: 65,
  }),
  encontro({
    id: "e0000000-0000-4000-8000-000000000008",
    numero: 8,
    titulo: "TCC para transtornos de ansiedade: o que as meta-análises mostram",
    data: "2026-10-01",
    eixo_id: 2,
    youtube_id: "demo-lapbe8",
    duracao_min: 78,
    destaque: true,
    capitulos: [
      { inicio: 0, titulo: "Abertura e objetivos" },
      { inicio: 425, titulo: "Como ler uma revisão de meta-análises" },
      { inicio: 1450, titulo: "Efeitos por transtorno" },
      { inicio: 2435, titulo: "Controle ativo vs. lista de espera" },
      { inicio: 3470, titulo: "Discussão do caso clínico" },
    ],
    mensagem_central:
      "A TCC é a psicoterapia com a base de evidências mais ampla para os transtornos de ansiedade. O efeito é consistente em revisões de meta-análises, mas varia por transtorno e cai quando o grupo controle é ativo.",
    resumo:
      "### O que vimos no encontro\n- Como ler uma revisão de meta-análises: o que entra, o que fica de fora e por que isso importa.\n- Diferença entre comparar com lista de espera e com controle ativo, e o que acontece com o tamanho de efeito.\n- Componentes com mais suporte: exposição, reestruturação cognitiva e prevenção de resposta.\n- Limites: heterogeneidade entre estudos, amostras pouco diversas e seguimento curto.\n\n### Para levar para a prática\nAntes de escolher um protocolo, verifique qual foi o comparador dos estudos que o sustentam. Um efeito grande contra lista de espera não diz o mesmo que um efeito moderado contra outra psicoterapia.",
    caso_clinico:
      "### Paciente com pânico e evitação agorafóbica\nCaso fictício para discussão.\n\n- **Queixa:** ataques de pânico há 8 meses; deixou de usar transporte público.\n- **Medida inicial:** PDSS (Panic Disorder Severity Scale) aplicada na primeira sessão.\n\n### Para discutir\n1. Qual protocolo tem melhor suporte para este quadro?\n2. Que desfecho você mediria e com qual frequência?\n3. O que muda se o paciente recusar exposição?",
    referencias: [
      "Hofmann, S. G., Asnaani, A., Vonk, I. J. J., Sawyer, A. T., & Fang, A. (2012). The efficacy of cognitive behavioral therapy: A review of meta-analyses. Cognitive Therapy and Research, 36(5), 427–440. https://doi.org/10.1007/s10608-012-9476-1 | Revisão de meta-análises",
      "APA Presidential Task Force on Evidence-Based Practice. (2006). Evidence-based practice in psychology. American Psychologist, 61(4), 271–285. https://doi.org/10.1037/0003-066X.61.4.271 | Documento de posição",
      "Sackett, D. L., Rosenberg, W. M. C., Gray, J. A. M., Haynes, R. B., & Richardson, W. S. (1996). Evidence based medicine: What it is and what it isn't. BMJ, 312(7023), 71–72. https://doi.org/10.1136/bmj.312.7023.71 | Editorial",
    ].join("\n"),
  }),
  encontro({
    id: "e0000000-0000-4000-8000-000000000009",
    numero: 9,
    titulo: "Ativação comportamental para depressão: o que dizem os ensaios clínicos",
    data: "2026-10-08",
    eixo_id: 2,
    leitura_previa: "Resumo do encontro e artigo-base (18 páginas).",
  }),
  encontro({
    id: "e0000000-0000-4000-8000-000000000010",
    numero: 10,
    titulo: "Clube de revista: leitura crítica de ECR",
    data: "2026-10-15",
    eixo_id: 5,
    local: "Online (link no mural)",
  }),
  encontro({
    id: "e0000000-0000-4000-8000-000000000011",
    numero: 11,
    titulo: "Psicometria: validade e fidedignidade na prática",
    data: "2026-10-22",
    eixo_id: 4,
  }),
];

function material(m: Partial<Material> & Pick<Material, "id" | "titulo" | "tipo" | "criado_em">): Material {
  return {
    descricao: null,
    drive_file_id: `demo-arquivo-${m.id.slice(-4)}-lapbe`,
    drive_mime: "application/pdf",
    link_url: null,
    encontro_id: null,
    eixo_id: null,
    nivel_evidencia: null,
    referencia_apa: null,
    paginas: null,
    destaque: false,
    publicado: true,
    ...m,
  };
}

export const demoMateriais: Material[] = [
  material({
    id: "m0000000-0000-4000-8000-000000000001",
    titulo: "Slides: TCC e ansiedade — tamanhos de efeito por transtorno",
    tipo: "slides",
    encontro_id: "e0000000-0000-4000-8000-000000000008",
    eixo_id: 2,
    paginas: 32,
    criado_em: "2026-10-01T23:10:00Z",
  }),
  material({
    id: "m0000000-0000-4000-8000-000000000002",
    titulo: "Hofmann et al. (2012). The efficacy of cognitive behavioral therapy: A review of meta-analyses",
    tipo: "artigo",
    encontro_id: "e0000000-0000-4000-8000-000000000008",
    eixo_id: 2,
    nivel_evidencia: "Revisão de meta-análises",
    paginas: 14,
    criado_em: "2026-09-29T14:00:00Z",
  }),
  material({
    id: "m0000000-0000-4000-8000-000000000003",
    titulo: "Caso clínico: pânico com evitação agorafóbica",
    tipo: "caso",
    encontro_id: "e0000000-0000-4000-8000-000000000008",
    eixo_id: 3,
    paginas: 2,
    destaque: true,
    descricao: "Formulação, escolha de protocolo e medidas de desfecho.",
    criado_em: "2026-09-26T12:00:00Z",
  }),
  material({
    id: "m0000000-0000-4000-8000-000000000004",
    titulo: "Resumo: hierarquia de evidências e o modelo dos três pilares",
    tipo: "resumo",
    encontro_id: "e0000000-0000-4000-8000-000000000002",
    eixo_id: 1,
    paginas: 10,
    criado_em: "2026-09-22T12:00:00Z",
  }),
  material({
    id: "m0000000-0000-4000-8000-000000000005",
    titulo: "Simulado do processo seletivo 2026.1",
    tipo: "simulado",
    paginas: 8,
    destaque: true,
    descricao: "20 questões com gabarito comentado e referências.",
    criado_em: "2026-09-15T12:00:00Z",
  }),
  material({
    id: "m0000000-0000-4000-8000-000000000006",
    titulo: "Resumo: TCC para transtornos de ansiedade",
    tipo: "resumo",
    encontro_id: "e0000000-0000-4000-8000-000000000008",
    eixo_id: 2,
    paginas: 6,
    criado_em: "2026-10-02T12:00:00Z",
  }),
];

export const demoAvisos: Aviso[] = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    titulo: "Leitura obrigatória para quinta",
    corpo: "O artigo-base sobre ativação comportamental está na página do encontro 9. Tragam dúvidas anotadas.",
    autor: "Diretoria de Ensino",
    fixado: true,
    criado_em: "2026-10-02T15:00:00Z",
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    titulo: "Inscrições abertas para o grupo de revisão sistemática",
    corpo: "6 vagas. Prioridade para quem tem 75% de presença ou mais.",
    autor: "Diretoria Científica",
    fixado: false,
    criado_em: "2026-09-29T15:00:00Z",
  },
];

export const demoProgresso: Progresso[] = [
  { item_tipo: "encontro", item_id: "e0000000-0000-4000-8000-000000000008", percentual: 62, posicao: 2892, concluido: false, atualizado_em: "2026-10-02T22:00:00Z" },
  { item_tipo: "material", item_id: "m0000000-0000-4000-8000-000000000004", percentual: 30, posicao: 3, concluido: false, atualizado_em: "2026-10-01T22:00:00Z" },
  ...["1", "2", "3", "4", "5", "6", "7"].map((n) => ({
    item_tipo: "encontro" as const,
    item_id: `e0000000-0000-4000-8000-00000000000${n}`,
    percentual: 100,
    posicao: 0,
    concluido: true,
    atualizado_em: "2026-09-25T22:00:00Z",
  })),
];

export const demoFavoritos: Favorito[] = [
  { item_tipo: "encontro", item_id: "e0000000-0000-4000-8000-000000000008" },
  { item_tipo: "material", item_id: "m0000000-0000-4000-8000-000000000003" },
];

export const demoPresencas: Presenca[] = ["1", "2", "3", "5", "6", "7", "8"].map((n) => ({
  encontro_id: `e0000000-0000-4000-8000-00000000000${n}`,
  email: "ana.lima@exemplo.com",
  origem: "codigo" as const,
  registrado_em: "2026-09-01T22:04:00Z",
}));

export const demoCodigos: CodigoPresenca[] = [];
