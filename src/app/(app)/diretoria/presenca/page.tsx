import Link from "next/link";
import type { Metadata } from "next";
import { Vazio } from "@/components/Itens";
import { listarEncontros, listarMembros, todasPresencas } from "@/lib/dados";
import { dataCurta, hoje } from "@/lib/formato";

export const metadata: Metadata = { title: "Presença · Diretoria" };

export default async function PresencaDiretoria() {
  const [encontros, membros, presencas] = await Promise.all([listarEncontros(), listarMembros(), todasPresencas()]);
  const hj = hoje();
  const ativos = membros.filter((m) => m.ativo).length;
  const ordenados = [...encontros].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <>
      <div className="form-acoes">
        <a className="btn" href="/diretoria/presenca/planilha" download>
          Baixar planilha de frequência (CSV)
        </a>
      </div>
      {ordenados.length ? (
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th>Encontro</th>
                <th>Data</th>
                <th>Presentes</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ordenados.map((e) => {
                const n = presencas.filter((p) => p.encontro_id === e.id).length;
                return (
                  <tr key={e.id}>
                    <td>
                      {e.numero ? `${e.numero}. ` : ""}
                      {e.titulo}
                    </td>
                    <td className="num" style={{ whiteSpace: "nowrap" }}>
                      {dataCurta(e.data)}
                      {e.data === hj ? <span className="chip ev" style={{ marginLeft: 6 }}>hoje</span> : null}
                    </td>
                    <td className="num">{e.data > hj ? "—" : `${n} de ${ativos}`}</td>
                    <td className="acoes">
                      <Link className={`btn pequeno${e.data === hj ? " primary" : ""}`} href={`/diretoria/presenca/${e.id}`}>
                        {e.data === hj ? "Abrir código" : "Ver lista"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Vazio titulo="Cadastre um encontro primeiro" />
      )}
    </>
  );
}
