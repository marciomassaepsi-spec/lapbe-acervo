import type { Metadata } from "next";
import { FormMaterial } from "../FormMaterial";
import { listarEixos, listarEncontros } from "@/lib/dados";

export const metadata: Metadata = { title: "Novo material · Diretoria" };

export default async function NovoMaterial({ searchParams }: PageProps<"/diretoria/materiais/novo">) {
  const { encontro } = await searchParams;
  const [eixos, encontros] = await Promise.all([listarEixos(), listarEncontros()]);
  return <FormMaterial eixos={eixos} encontros={encontros} encontroInicial={typeof encontro === "string" ? encontro : undefined} />;
}
