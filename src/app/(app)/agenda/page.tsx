import Link from "next/link";
import type { Metadata } from "next";
import { FormPresenca } from "@/components/FormPresenca";
import { Vazio } from "@/components/Itens";
import { MarcaCelular } from "@/components/MarcaCelular";
import { listarEixos, listarEncontros, minhasPresencas } from "@/lib/dados";
import { dataCurta, dia, diaSemana, hoje, mes } from "@/lib/formato";
import { exigirMembro } from "@/lib/sessao";

export const metadata: Metadata = { title: "Agenda e presença" };

export default async function Agenda() {
  const { membro } = await exigirMembro();
  const [encontros, eixos, presencas] = await Promise.all([listarEncontros(), listarEixos(), minhasPresencas(membro.email)]);
  const hj = hoje();
  const publicados = encontros.filter((e) => e.publicado);
  const proximos = publicados.filter((e) => e.data >= hj).sort((a, b) => a.data.localeCompare(b.data));
  const semestre = proximos[0]?.semestre ?? publicados[0]?.semestre;
  const passados = publicados.filter((e) => e.data < hj && e.semestre === semestre);
  const presentes = new Set(presencas.map((p) => p.encontro_id));
  const taxa = passados.length ? Math.round((passados.filter((e) => presentes.has(e.id)).length / passados.length) * 100) : null;

  return (
    <div className="screen">
      <MarcaCelular />
      <header className="page-head">
        <span className="eyebrow">{semestre ? `Semestre ${semestre}` : "Agenda"}</span>
        <h1>Agenda e presença</h1>
      </header>

      <div className="split">
        <section>
          <div className="sec-head">
            <h2>Próximos encontros</h2>
          </div>
          {proximos.length ? (
            <div className="list" style={{ padding: "4px 16px" }}>
              <div className="agenda">
                {proximos.map((e) => (
                  <Link className="ag" key={e.id} href={`/encontros/${e.id}`}>
                    <div className="dt">
                      <b className="num">{dia(e.data)}</b>
                      <span>{mes(e.data)}</span>
                    </div>
                    <div>
                      <h4>
                        {e.data === hj ? "Hoje · " : ""}
                        {e.titulo}
                      </h4>
                      <p>
                        {[e.numero ? `Encontro ${e.numero}` : null, diaSemana(e.data), e.hora, e.local, eixos.find((x) => x.id === e.eixo_id)?.nome]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Vazio titulo="Nenhum encontro marcado">Os próximos encontros aparecem aqui quando a diretoria cadastrar.</Vazio>
          )}
        </section>

        <div className="side">
          <section className="box" id="presenca">
            <h3>Registrar presença</h3>
            <FormPresenca />
          </section>
          <section className="progress-box">
            <h2>Sua frequência</h2>
            <p className="muted" style={{ fontSize: 14 }}>
              {taxa === null
                ? "Ainda não houve encontros neste semestre."
                : `${passados.filter((e) => presentes.has(e.id)).length} de ${passados.length} encontros (${taxa}%).`}
            </p>
            {passados.length ? (
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, fontSize: 13.5 }}>
                {passados.map((e) => (
                  <li key={e.id} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <span>
                      {dataCurta(e.data, false)} · {e.titulo.length > 42 ? e.titulo.slice(0, 40) + "…" : e.titulo}
                    </span>
                    <span className={`chip ${presentes.has(e.id) ? "ok" : ""}`}>{presentes.has(e.id) ? "presente" : "falta"}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
