/**
 * Endereço e chave do Supabase, corrigindo enganos comuns ao copiar do painel:
 * espaços, barra no final e o sufixo "/rest/v1" (endereço da API de dados, não do projeto).
 * As variáveis NEXT_PUBLIC_ precisam ser lidas pelo nome literal para chegarem ao navegador.
 */
const URL_BRUTA = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const CHAVE_BRUTA = process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "";

export const SUPABASE_URL = URL_BRUTA.trim()
  .replace(/^["']|["']$/g, "")
  .replace(/\/+$/, "")
  .replace(/\/(rest|auth)\/v1$/, "");

export const SUPABASE_KEY = CHAVE_BRUTA.trim().replace(/^["']|["']$/g, "");
