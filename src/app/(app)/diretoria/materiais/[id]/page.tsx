import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FormMaterial } from "../FormMaterial";
import { BotaoConfirmar } from "@/components/Formulario";
import { excluirMaterial } from "../../acoes";
import { listarEixos, listarEncontros, materialPorId } from "@/lib/dados";

export const metadata: Metadata = { title: "Editar material · Diretoria" };

export default async function EditarMaterial({ params }: PageProps<"/diretoria/materiais/[id]">) {
  const { id } = await params;
  const [material, eixos, encontros] = await Promise.all([materialPorId(id), listarEixos(), listarEncontros()]);
  if (!material) notFound();
  return (
    <>
      <FormMaterial material={material} eixos={eixos} encontros={encontros} />
      <form action={excluirMaterial}>
        <input type="hidden" name="id" value={material.id} />
        <BotaoConfirmar mensagem="Remover este material do app? O arquivo continua no Google Drive.">Remover material</BotaoConfirmar>
      </form>
    </>
  );
}
