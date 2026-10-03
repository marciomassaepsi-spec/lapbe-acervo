import Link from "next/link";
import type { Metadata } from "next";
import { Vazio } from "@/components/Itens";
import { MarcaCelular } from "@/components/MarcaCelular";
import { listarEixos, listarEncontros, meuProgresso, minhasPresencas } from "@/lib/dados";
import { dataCurta, duracao, hoje } from "@/lib/formato";
import { exigirMembro } from "@/lib/sessao";
import type { Encontro } from "@/lib/tipos";

export const metadata: Metadata = { title: "Encontros" };

export default async function Encontros() {
  const { membro } = await exigirMembro();
  const [encontros, eixos, progresso, presencas] = await Promise.all([
    listarEncontros(),
    listarEixos(),
    meuProgresso(),
    minhasPresencas(membro.email),
  ]);
  const hj = hoje();
  const presentes = new Set(presencas.map((p) => p.encontro_id));
  const assistidos = new Set(progresso.filter((p) => p.item_tipo === "encontro" && p.concluido).map((p) => p.item_id));

  const porSemestre = new Map<string, Encontro[]>();
  for (const e of encontros.filter((x) => x.publicado)) {
    porSemestre.set(e.semestre, [...(porSemestre.get(e.semestre) ?? []), e]);
  }
  const semestres = [...porSemestre.keys()].sort().reverse();

  return (
    <div className="screen">
      <MarcaCelular />
      <header className="page-head">
        <span className="eyebrow">Por data</span>
        <h1>Encontros</h1>
        <p>Cada encontro reúne a aula gravada, os slides, o resumo, as referências e o caso discutido.</p>
      </header>

      {semestres.length ? (
        semestres.map((s) => (
          <section className="semestre" key={s}>
            <h2>Semestre {s}</h2>
            <div className="list">
              {porSemestre
                .get(s)!
                .sort((a, b) => b.data.localeCompare(a.data))
                .map((e) => {
                  const futuro = e.data > hj;
                  return (
                    <Link className="enc" href={`/encontros/${e.id}`} key={e.id}>
                      <span className="n num">{e.numero ? String(e.numero).padStart(2, "0") : "·"}</span>
                      <div style={{ minWidth: 0 }}>
                        <h4>{e.titulo}</h4>
                        <div className="m">
                          <span>{dataCurta(e.data)}</span>
                          {eixos.find((x) => x.id === e.eixo_id) ? <span>{eixos.find((x) => x.id === e.eixo_id)!.nome}</span> : null}
                          {e.youtube_id && duracao(e.duracao_min) ? <span>aula de {duracao(e.duracao_min)}</span> : null}
                        </div>
                      </div>
                      <div className="estado">
                        {futuro ? <span className="chip ev">em breve</span> : null}
                        {!futuro && presentes.has(e.id) ? <span className="chip ok">presente</span> : null}
                        {assistidos.has(e.id) ? <span className="chip ok">assistida</span> : null}
                        {!futuro && !e.youtube_id ? <span className="chip">sem gravação</span> : null}
                      </div>
                    </Link>
                  );
                })}
            </div>
          </section>
        ))
      ) : (
        <Vazio titulo="Nenhum encontro cadastrado">A diretoria cadastra os encontros pelo painel.</Vazio>
      )}
    </div>
  );
}
