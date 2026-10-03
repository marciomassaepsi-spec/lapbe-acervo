export const FUSO = "America/Bahia";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

/** Data de hoje (AAAA-MM-DD) no fuso da liga. */
export function hoje(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(new Date());
}

function partes(iso: string) {
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return { a, m, d, semana: new Date(Date.UTC(a, m - 1, d)).getUTCDay() };
}

export function dia(iso: string) {
  return String(partes(iso).d).padStart(2, "0");
}

export function mes(iso: string) {
  return MESES[partes(iso).m - 1];
}

export function diaSemana(iso: string) {
  return DIAS[partes(iso).semana];
}

/** "08 out 2026" */
export function dataCurta(iso: string, comAno = true) {
  const p = partes(iso);
  return `${String(p.d).padStart(2, "0")} ${MESES[p.m - 1]}${comAno ? ` ${p.a}` : ""}`;
}

/** Data de um timestamp (criado_em) convertida para o fuso da liga. */
export function dataDeTimestamp(ts: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(new Date(ts));
}

export function horaDeTimestamp(ts: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" }).format(
    new Date(ts),
  );
}

/** O instante (ISO) já passou? */
export function jaPassou(iso: string) {
  return new Date(iso).getTime() <= Date.now();
}

export function saudacao() {
  const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: FUSO, hour: "numeric", hourCycle: "h23" }).format(new Date()));
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function duracao(min: number | null) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h${m ? String(m).padStart(2, "0") : ""}` : `${m} min`;
}

/** 125 -> "02:05"; 3725 -> "1:02:05" */
export function tempo(seg: number) {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = Math.floor(seg % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** "07:05" ou "1:02:05" -> segundos */
export function lerTempo(txt: string): number | null {
  const p = txt.trim().split(":").map(Number);
  if (p.length < 2 || p.length > 3 || p.some((n) => Number.isNaN(n))) return null;
  return p.reduce((acc, n) => acc * 60 + n, 0);
}

/** Aceita link do YouTube em qualquer formato ou o próprio ID. */
export function idYouTube(entrada: string | null | undefined): string | null {
  if (!entrada) return null;
  const t = entrada.trim();
  if (/^[\w-]{11}$/.test(t)) return t;
  const m = t.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** Aceita link do Google Drive/Docs ou o próprio ID. */
export function idDrive(entrada: string | null | undefined): string | null {
  if (!entrada) return null;
  const t = entrada.trim();
  const m = t.match(/\/d\/([\w-]{20,})/) ?? t.match(/[?&]id=([\w-]{20,})/);
  if (m) return m[1];
  return /^[\w-]{20,}$/.test(t) ? t : null;
}

/** Iniciais para o avatar: "Ana Lima" -> "AL" */
export function iniciais(nome: string, email: string) {
  const base = nome.trim() || email;
  const p = base.split(/[\s.@_-]+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

export function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0] ?? "";
}

export type Referencia = { texto: string; nivel: string | null; doi: string | null };

/** Uma referência por linha. Nível opcional depois de " | ". */
export function lerReferencias(txt: string | null): Referencia[] {
  if (!txt) return [];
  return txt
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linha) => {
      const [texto, nivel] = linha.split(/\s+\|\s+/);
      const doi = texto.match(/10\.\d{4,9}\/[^\s]+[^\s.,;)]/)?.[0] ?? null;
      return { texto, nivel: nivel?.trim() || null, doi };
    });
}
