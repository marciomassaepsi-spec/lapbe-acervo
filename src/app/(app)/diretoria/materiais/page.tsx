import Link from "next/link";
import type { Metadata } from "next";
import { Vazio } from "@/components/Itens";
import { listarEncontros, listarMateriais } from "@/lib/dados";
import { dataCurta, dataDeTimestamp } from "@/lib/formato";
import { NOME_TIPO } from "@/lib/tipos";

export const metadata: Metadata = { title: "Materiais · Diretoria" };

export default async function MateriaisDiretoria({ searchParams }: PageProps<"/diretoria/materiais">) {
  const { salvo } = await searchParams;
  const [materiais, encontros] = await Promise.all([listarMateriais(), listarEncontros()]);

  return (
    <>
      <div className="form-acoes">
        <Link className="btn primary" href="/diretoria/materiais/novo">
          Novo material
        </Link>
        {salvo ? <span className="aviso-caixa ok">Material salvo.</span> : null}
      </div>
      {materiais.length ? (
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th>Material</th>
                <th>Tipo</th>
                <th>Encontro</th>
                <th>Publicado em</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {materiais.map((m) => {
                const e = encontros.find((x) => x.id === m.encontro_id);
                return (
                  <tr key={m.id}>
                    <td>
                      <Link href={`/diretoria/materiais/${m.id}`}>{m.titulo}</Link>
                      <div className="chips" style={{ marginTop: 4 }}>
                        {!m.publicado ? <span className="chip rascunho">rascunho</span> : null}
                        {m.destaque ? <span className="chip ev">destaque</span> : null}
                        {m.link_url && !m.drive_file_id ? <span className="chip">link externo</span> : null}
                      </div>
                    </td>
                    <td>{NOME_TIPO[m.tipo]}</td>
                    <td>{e ? (e.numero ? `Encontro ${e.numero}` : dataCurta(e.data, false)) : "—"}</td>
                    <td className="num" style={{ whiteSpace: "nowrap" }}>
                      {dataCurta(dataDeTimestamp(m.criado_em))}
                    </td>
                    <td className="acoes">
                      <Link className="btn pequeno" href={`/materiais/${m.id}`}>
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
        <Vazio titulo="Nenhum material ainda">Publique o primeiro escolhendo um arquivo da pasta da liga.</Vazio>
      )}
    </>
  );
}
