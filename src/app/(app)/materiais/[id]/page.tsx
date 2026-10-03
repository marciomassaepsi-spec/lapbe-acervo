import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BotaoConcluido } from "@/components/BotaoConcluido";
import { BotaoFavorito } from "@/components/BotaoFavorito";
import { Icone } from "@/components/Icone";
import { LeitorPdf } from "@/components/LeitorPdf";
import { MarcaCelular } from "@/components/MarcaCelular";
import { encontroPorId, listarEixos, materialPorId, meuProgresso, meusFavoritos } from "@/lib/dados";
import { ehPdfOuNativo } from "@/lib/drive";
import { dataCurta, dataDeTimestamp } from "@/lib/formato";
import { NOME_TIPO } from "@/lib/tipos";

export async function generateMetadata({ params }: PageProps<"/materiais/[id]">): Promise<Metadata> {
  const m = await materialPorId((await params).id);
  return { title: m?.titulo ?? "Material" };
}

export default async function PaginaMaterial({ params }: PageProps<"/materiais/[id]">) {
  const { id } = await params;
  const material = await materialPorId(id);
  if (!material) notFound();

  const [eixos, progresso, favoritos, encontro] = await Promise.all([
    listarEixos(),
    meuProgresso(),
    meusFavoritos(),
    material.encontro_id ? encontroPorId(material.encontro_id) : Promise.resolve(null),
  ]);
  const eixo = eixos.find((x) => x.id === material.eixo_id);
  const meu = progresso.find((p) => p.item_tipo === "material" && p.item_id === material.id);
  const favorito = favoritos.some((f) => f.item_tipo === "material" && f.item_id === material.id);
  const legivel = Boolean(material.drive_file_id && ehPdfOuNativo(material.drive_mime));
  const arquivo = `/api/arquivo/${material.id}`;

  return (
    <div className="screen">
      <MarcaCelular />
      <div className="lesson-head">
        <nav className="crumbs" aria-label="Você está em">
          <Link href="/biblioteca">Biblioteca</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/biblioteca?tipo=${material.tipo}`}>{NOME_TIPO[material.tipo]}</Link>
        </nav>
        <h1 style={{ maxWidth: "32ch" }}>{material.titulo}</h1>
        <div className="lmeta">
          <span>
            Publicado em <b>{dataCurta(dataDeTimestamp(material.criado_em))}</b>
          </span>
          {material.paginas ? <span>{material.paginas} páginas</span> : null}
          {eixo ? <span className="chip">{eixo.nome}</span> : null}
          {material.nivel_evidencia ? <span className="chip ev">{material.nivel_evidencia}</span> : null}
          {!material.publicado ? <span className="chip rascunho">rascunho</span> : null}
        </div>
        {material.descricao ? <p className="muted" style={{ maxWidth: "68ch" }}>{material.descricao}</p> : null}
        {material.referencia_apa ? (
          <p style={{ maxWidth: "78ch", fontSize: 14, paddingLeft: "2em", textIndent: "-2em", overflowWrap: "anywhere" }}>
            {material.referencia_apa}
          </p>
        ) : null}
        <div className="actions" style={{ marginTop: 0 }}>
          <BotaoConcluido tipo="material" id={material.id} concluido={Boolean(meu?.concluido)} rotulos={["Marcar como lido", "Lido"]} />
          <BotaoFavorito tipo="material" id={material.id} ativo={favorito} grande />
          {encontro ? (
            <Link className="btn" href={`/encontros/${encontro.id}`}>
              <Icone nome="coluna" />
              {encontro.numero ? `Encontro ${encontro.numero}` : "Ver encontro"}
            </Link>
          ) : null}
          {material.link_url ? (
            <a className="btn" href={material.link_url} target="_blank" rel="noopener noreferrer">
              <Icone nome="externo" />
              Abrir link
            </a>
          ) : null}
        </div>
      </div>

      {legivel ? (
        <LeitorPdf url={arquivo} materialId={material.id} paginaInicial={meu && !meu.concluido ? meu.posicao : 1} altura="livre" />
      ) : material.drive_file_id ? (
        <div className="vazio">
          <b>Este arquivo não abre dentro do app</b>
          <p>Baixe para abrir no seu computador ou celular.</p>
          <a className="btn primary" href={`${arquivo}?baixar=1`}>
            <Icone nome="baixar" />
            Baixar arquivo
          </a>
        </div>
      ) : null}
    </div>
  );
}
