import type { Metadata } from "next";
import { FormEncontro } from "../FormEncontro";
import { listarEixos, listarEncontros } from "@/lib/dados";

export const metadata: Metadata = { title: "Novo encontro · Diretoria" };

export default async function NovoEncontro() {
  const [eixos, encontros] = await Promise.all([listarEixos(), listarEncontros()]);
  const ultimo = encontros[0];
  return <FormEncontro eixos={eixos} sugestaoNumero={ultimo?.numero ? ultimo.numero + 1 : 1} />;
}
