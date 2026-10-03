import Link from "next/link";
import { CartaoDestaque, chaveFavorito, LinhaItem, Vazio } from "@/components/Itens";
import { Icone } from "@/components/Icone";
import { MarcaCelular } from "@/components/MarcaCelular";
import {
  biblioteca,
  destaques,
  listarAvisos,
  listarEixos,
  listarEncontros,
  listarMateriais,
  meuProgresso,
  meusFavoritos,
  minhasPresencas,
  proximosEncontros,
} from "@/lib/dados";
import { dataCurta, dataDeTimestamp, dia, diaSemana, hoje, mes, primeiroNome, saudacao, tempo } from "@/lib/formato";
import { exigirMembro } from "@/lib/sessao";
import { NOME_TIPO } from "@/lib/tipos";

export default async function Inicio() {
  const { membro } = await exigirMembro();
  const [eixos, encontros, materiais, recentes, destacados, avisos, progresso, favoritos, presencas, proximos] =
    await Promise.all([
      listarEixos(),
      listarEncontros(),
      listarMateriais(),
      biblioteca(),
      destaques(),
      listarAvisos(),
      meuProgresso(),
      meusFavoritos(),
      minhasPresencas(membro.email),
      proximosEncontros(3),
    ]);

  const hj = hoje();
  const proximo = proximos[0];
  const semestre = proximo?.semestre ?? encontros[0]?.semestre ?? null;
  const doSemestre = encontros.filter((e) => e.publicado && e.semestre === semestre).sort((a, b) => a.data.localeCompare(b.data));
  const realizados = doSemestre.filter((e) => e.data < hj || (e.data === hj && presencas.some((p) => p.encontro_id === e.id)));
  const presentes = new Set(presencas.map((p) => p.encontro_id));
  const favSet = new Set(favoritos.map((f) => `${f.item_tipo}:${f.item_id}`));
  const concluidos = new Set(progresso.filter((p) => p.concluido).map((p) => `${p.item_tipo}:${p.item_id}`));
  const totalItens = recentes.length;
  const vistos = recentes.filter((i) => concluidos.has(chaveFavorito(i))).length;

  // Continuar de onde parou: itens começados e não concluídos
  const emAndamento = progresso
    .filter((p) => !p.concluido && p.percentual > 0)
    .map((p) => {
      if (p.item_tipo === "encontro") {
        const e = encontros.find((x) => x.id === p.item_id);
        return e ? { p, href: `/encontros/${e.id}`, titulo: e.titulo, video: true, e, m: null } : null;
      }
      const m = materiais.find((x) => x.id === p.item_id);
      return m ? { p, href: `/materiais/${m.id}`, titulo: m.titulo, video: false, e: null, m } : null;
    })
    .filter((x) => x !== null)
    .slice(0, 2);

  const encontroHoje = doSemestre.find((e) => e.data === hj);
  const nome = primeiroNome(membro.nome);

  return (
    <div className="screen">
      <MarcaCelular />

      <section className="hero">
        <div>
          <span className="eyebrow">
            {semestre ? `Semestre ${semestre}` : "LAPBE"}
            {proximo?.numero && doSemestre.length ? ` · encontro ${proximo.numero} de ${doSemestre.length}` : ""}
          </span>
          <h1>
            {saudacao()}
            {nome ? `, ${nome}` : ""}.
            {proximo ? (
              <>
                <br />
                {proximo.data === hj ? "Hoje" : "Próximo encontro"}: <em>{proximo.titulo.split(":")[0]}</em>.
              </>
            ) : null}
          </h1>
          {proximo?.leitura_previa ? <p className="sub">Preparação: {proximo.leitura_previa}</p> : null}
          <div className="hero-stats">
            <div>
              <b className="num">
                {vistos}/{totalItens}
              </b>
              <span>materiais vistos</span>
            </div>
            <div>
              <b className="num">
                {realizados.filter((e) => presentes.has(e.id)).length}/{realizados.length}
              </b>
              <span>presenças</span>
            </div>
            <div>
              <b className="num">{favoritos.length}</b>
              <span>favoritos</span>
            </div>
          </div>
        </div>

        {proximo ? (
          <div className="next">
            <span className="eyebrow">{proximo.data === hj ? "Encontro de hoje" : "Próximo encontro"}</span>
            <div className="when">
              <span className="day num">{dia(proximo.data)}</span>
              <span className="mon">
                {mes(proximo.data)} · {diaSemana(proximo.data)}
                <br />
                {[proximo.hora, proximo.local].filter(Boolean).join(" · ")}
              </span>
            </div>
            <h3>{proximo.titulo}</h3>
            <p className="meta">{eixos.find((x) => x.id === proximo.eixo_id)?.nome ?? ""}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              <Link className="btn light" href={`/encontros/${proximo.id}`}>
                Ver preparação
              </Link>
              {encontroHoje && !presentes.has(encontroHoje.id) ? (
                <Link className="btn light" href="/agenda#presenca">
                  Registrar presença
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      {emAndamento.length ? (
        <section>
          <div className="sec-head">
            <h2>Continue de onde parou</h2>
          </div>
          <div className="resume">
            {emAndamento.map(({ p, href, titulo, video, e, m }) => (
              <Link className="res" href={href} key={href}>
                <div className={`thumb${video ? "" : " doc"}`}>
                  <div className="play">{video ? <i /> : <Icone nome="pdf" />}</div>
                </div>
                <div className="info">
                  <h3>{titulo}</h3>
                  <div className="bar">
                    <i style={{ width: `${p.percentual}%` }} />
                  </div>
                  <div className="row">
                    <span>{video ? `Aula gravada${e?.numero ? ` · encontro ${e.numero}` : ""}` : NOME_TIPO[m!.tipo]}</span>
                    <span className="num">
                      {video
                        ? `${tempo(p.posicao)}${e?.duracao_min ? ` de ${e.duracao_min} min` : ""}`
                        : `p. ${p.posicao}${m?.paginas ? ` de ${m.paginas}` : ""}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {destacados.length ? (
        <section>
          <div className="sec-head">
            <h2>Destaques da diretoria</h2>
            <Link href="/biblioteca">Ver biblioteca</Link>
          </div>
          <div className={`feat${destacados.length === 1 ? " n1" : destacados.length === 2 ? " n2" : ""}`}>
            {destacados.map((item, i) => (
              <CartaoDestaque key={chaveFavorito(item)} item={item} eixos={eixos} indice={i} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="split">
        <section>
          <div className="sec-head">
            <h2>Adicionados recentemente</h2>
            <Link href="/biblioteca">Ver tudo</Link>
          </div>
          {recentes.length ? (
            <div className="list">
              {recentes.slice(0, 7).map((item) => (
                <LinhaItem
                  key={chaveFavorito(item)}
                  item={item}
                  eixos={eixos}
                  favorito={favSet.has(chaveFavorito(item))}
                  concluido={concluidos.has(chaveFavorito(item))}
                />
              ))}
            </div>
          ) : (
            <Vazio titulo="Nada publicado ainda">Os materiais aparecem aqui assim que a diretoria publicar.</Vazio>
          )}
        </section>

        <div className="side">
          <section>
            <div className="sec-head">
              <h2>Mural</h2>
              {avisos.length > 2 ? <Link href="/mural">Ver todos</Link> : null}
            </div>
            {avisos.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {avisos.slice(0, 2).map((a) => (
                  <article key={a.id} className={`notice${a.fixado ? " pin" : ""}`}>
                    <span className="mono">
                      {a.fixado ? "Fixado" : dataCurta(dataDeTimestamp(a.criado_em), false)}
                      {a.autor ? ` · ${a.autor}` : ""}
                    </span>
                    <h4>{a.titulo}</h4>
                    {a.corpo ? <p>{a.corpo}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <Vazio titulo="Sem avisos" />
            )}
          </section>

          {proximos.length ? (
            <section>
              <div className="sec-head">
                <h2>Agenda</h2>
                <Link href="/agenda">Ver agenda</Link>
              </div>
              <div className="agenda">
                {proximos.map((e) => (
                  <Link className="ag" key={e.id} href={`/encontros/${e.id}`}>
                    <div className="dt">
                      <b className="num">{dia(e.data)}</b>
                      <span>{mes(e.data)}</span>
                    </div>
                    <div>
                      <h4>{e.titulo}</h4>
                      <p>{[e.numero ? `Encontro ${e.numero}` : null, e.hora, e.local].filter(Boolean).join(" · ")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {doSemestre.length ? (
            <section className="progress-box">
              <h2>Seu semestre</h2>
              <div className="pr-row">
                <div className="lbl">
                  <span>Materiais vistos</span>
                  <span className="num">
                    {vistos} de {totalItens}
                  </span>
                </div>
                <div className="bar">
                  <i style={{ width: `${totalItens ? Math.round((vistos / totalItens) * 100) : 0}%` }} />
                </div>
              </div>
              <div className="pr-row">
                <div className="lbl">
                  <span>Presença</span>
                  <span className="num">
                    {realizados.length ? Math.round((realizados.filter((e) => presentes.has(e.id)).length / realizados.length) * 100) : 0}%
                  </span>
                </div>
                <div
                  className="dots"
                  role="img"
                  aria-label={`${realizados.filter((e) => presentes.has(e.id)).length} presenças em ${realizados.length} encontros realizados; ${doSemestre.length - realizados.length} a acontecer`}
                >
                  {doSemestre.map((e) => (
                    <i
                      key={e.id}
                      className={presentes.has(e.id) ? "p" : realizados.includes(e) ? "f" : undefined}
                      title={`${e.numero ? `Encontro ${e.numero} · ` : ""}${dataCurta(e.data, false)}`}
                    />
                  ))}
                </div>
                <div className="legend">
                  <span className="l1">presente</span>
                  <span className="l2">falta</span>
                  <span className="l3">a acontecer</span>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
