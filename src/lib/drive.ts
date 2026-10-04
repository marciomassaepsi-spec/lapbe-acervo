/**
 * Acesso ao Google Drive com uma conta de serviço.
 * A pasta da liga é compartilhada (como leitor) com o e-mail da conta de serviço;
 * os arquivos nunca precisam ficar públicos.
 */
import { JWT } from "google-auth-library";

const API = "https://www.googleapis.com/drive/v3";
const NATIVO = "application/vnd.google-apps.";
export const PASTA_MIME = "application/vnd.google-apps.folder";

let cliente: JWT | null = null;

type Credenciais = { email: string; chave: string };

/**
 * Lê a conta de serviço de GOOGLE_SERVICE_ACCOUNT_JSON (o arquivo .json inteiro colado numa variável)
 * ou, se preferir, de GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_KEY.
 */
function credenciais(): Credenciais | null {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    try {
      const dados = JSON.parse(json) as { client_email?: unknown; private_key?: unknown };
      if (typeof dados.client_email === "string" && typeof dados.private_key === "string") {
        return { email: dados.client_email, chave: dados.private_key };
      }
    } catch {
      // JSON colado pela metade ou com aspas a mais: tenta as variáveis separadas.
    }
  }
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const chave = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n");
  return email && chave ? { email, chave } : null;
}

export function driveConfigurado() {
  return credenciais() !== null;
}

async function token() {
  if (!cliente) {
    const c = credenciais();
    if (!c) throw new Error("Conta de serviço do Google não configurada.");
    cliente = new JWT({ email: c.email, key: c.chave, scopes: ["https://www.googleapis.com/auth/drive.readonly"] });
  }
  const { token: t } = await cliente.getAccessToken();
  if (!t) throw new Error("Não foi possível autenticar no Google Drive.");
  return t;
}

async function chamar(caminho: string, params: Record<string, string>) {
  const url = new URL(API + caminho);
  Object.entries({ supportsAllDrives: "true", ...params }).forEach(([k, v]) => url.searchParams.set(k, v));
  return fetch(url, { headers: { Authorization: `Bearer ${await token()}` }, cache: "no-store" });
}

export type ArquivoDrive = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
};

export async function metadados(id: string): Promise<ArquivoDrive | null> {
  const r = await chamar(`/files/${encodeURIComponent(id)}`, { fields: "id,name,mimeType,size,modifiedTime" });
  if (!r.ok) return null;
  return (await r.json()) as ArquivoDrive;
}

/** Conteúdo do arquivo. Documentos, apresentações e planilhas do Google viram PDF. */
export async function baixar(arquivo: ArquivoDrive): Promise<{ corpo: ReadableStream<Uint8Array>; mime: string }> {
  const nativo = arquivo.mimeType.startsWith(NATIVO);
  const r = nativo
    ? await chamar(`/files/${encodeURIComponent(arquivo.id)}/export`, { mimeType: "application/pdf" })
    : await chamar(`/files/${encodeURIComponent(arquivo.id)}`, { alt: "media" });
  if (!r.ok || !r.body) throw new Error(`Drive respondeu ${r.status}`);
  return { corpo: r.body, mime: nativo ? "application/pdf" : arquivo.mimeType };
}

export async function listarPasta(pastaId: string): Promise<ArquivoDrive[]> {
  const r = await chamar("/files", {
    q: `'${pastaId.replace(/'/g, "")}' in parents and trashed = false`,
    fields: "files(id,name,mimeType,size,modifiedTime)",
    orderBy: "folder,name",
    pageSize: "300",
    includeItemsFromAllDrives: "true",
  });
  if (!r.ok) throw new Error(`Drive respondeu ${r.status}`);
  const { files } = (await r.json()) as { files: ArquivoDrive[] };
  return files;
}

export function ehPdfOuNativo(mime: string | null | undefined) {
  return Boolean(mime && (mime === "application/pdf" || mime.startsWith(NATIVO)));
}
