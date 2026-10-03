import Link from "next/link";
import type { Metadata } from "next";
import { Vazio } from "@/components/Itens";
import { listarEixos, listarEncontros, listarMateriais } from "@/lib/dados";
import { dataCurta } from "@/lib/formato";

export const metadata: Metadata = { title: "Encontros · Diretoria" };

export default async function EncontrosDiretoria({ searchParams }: PageProps<"/diretoria/encontros">) {
  const { salvo } = await searchParams;
  const [encontros, eixos, materiais] = await Promise.all([listarEncontros(), listarEixos(), listarMateriais()]);

  return (
    <>
      <div className="form-acoes">
        <Link className="btn primary" href="/diretoria/encontros/novo">
          Novo encontro
        </Link>
        {salvo ? <span className="aviso-caixa ok">Encontro salvo.</span> : null}
      </div>
      {encontros.length ? (
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Encontro</th>
                <th>Data</th>
                <th>Conteúdo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {encontros.map((e) => {
                const qtd = materiais.filter((m) => m.encontro_id === e.id).length;
                return (
                  <tr key={e.id}>
                    <td className="num">{e.numero ?? "—"}</td>
                    <td>
                      <Link href={`/diretoria/encontros/${e.id}`}>{e.titulo}</Link>
                      <div className="muted" style={{ fontSize: 12.5 }}>
                        {eixos.find((x) => x.id === e.eixo_id)?.nome ?? "Sem eixo"} · {e.semestre}
                      </div>
                    </td>
                    <td className="num" style={{ whiteSpace: "nowrap" }}>
                      {dataCurta(e.data)}
                    </td>
                    <td>
                      <div className="chips">
                        {e.youtube_id ? <span className="chip ok">vídeo</span> : <span className="chip">sem vídeo</span>}
                        {qtd ? <span className="chip">{qtd} arquivo{qtd > 1 ? "s" : ""}</span> : null}
                        {!e.publicado ? <span className="chip rascunho">rascunho</span> : null}
                        {e.destaque ? <span className="chip ev">destaque</span> : null}
                      </div>
                    </td>
                    <td className="acoes">
                      <Link className="btn pequeno" href={`/diretoria/presenca/${e.id}`}>
                        Presença
                      </Link>{" "}
                      <Link className="btn pequeno" href={`/encontros/${e.id}`}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Vazio titulo="Nenhum encontro ainda">Comece cadastrando o primeiro encontro do semestre.</Vazio>
      )}
    </>
  );
}
