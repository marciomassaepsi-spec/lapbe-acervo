import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FormEncontro } from "../FormEncontro";
import { BotaoConfirmar } from "@/components/Formulario";
import { excluirEncontro } from "../../acoes";
import { encontroPorId, listarEixos } from "@/lib/dados";

export const metadata: Metadata = { title: "Editar encontro · Diretoria" };

export default async function EditarEncontro({ params }: PageProps<"/diretoria/encontros/[id]">) {
  const { id } = await params;
  const [encontro, eixos] = await Promise.all([encontroPorId(id), listarEixos()]);
  if (!encontro) notFound();
  return (
    <>
      <FormEncontro encontro={encontro} eixos={eixos} />
      <form action={excluirEncontro}>
        <input type="hidden" name="id" value={encontro.id} />
        <BotaoConfirmar mensagem="Excluir este encontro? A presença registrada nele também será apagada. Os materiais continuam na biblioteca.">
          Excluir encontro
        </BotaoConfirmar>
      </form>
    </>
  );
}
