import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Abas } from "@/components/Abas";
import { BotaoConcluido } from "@/components/BotaoConcluido";
import { BotaoFavorito } from "@/components/BotaoFavorito";
import { Capitulos } from "@/components/Capitulos";
import { Icone, iconeDoTipo } from "@/components/Icone";
import { LeitorPdf } from "@/components/LeitorPdf";
import { MarcaCelular } from "@/components/MarcaCelular";
import { PlayerYouTube } from "@/components/PlayerYouTube";
import { Texto } from "@/components/Texto";
import {
  encontroPorId,
  listarEixos,
  listarEncontros,
  materiaisDoEncontro,
  meuProgresso,
  meusFavoritos,
  minhasPresencas,
} from "@/lib/dados";
import { ehPdfOuNativo } from "@/lib/drive";
import { dataCurta, diaSemana, hoje, horaDeTimestamp, lerReferencias } from "@/lib/formato";
import { exigirMembro } from "@/lib/sessao";
import { NOME_TIPO } from "@/lib/tipos";

export async function generateMetadata({ params }: PageProps<"/encontros/[id]">): Promise<Metadata> {
  const e = await encontroPorId((await params).id);
  return { title: e?.titulo ?? "Encontro" };
}

export default async function PaginaEncontro({ params }: PageProps<"/encontros/[id]">) {
  const { id } = await params;
  const { membro } = await exigirMembro();
  const encontro = await encontroPorId(id);
  if (!encontro) notFound();

  const [eixos, materiais, progresso, favoritos, presencas, todos] = await Promise.all([
    listarEixos(),
    materiaisDoEncontro(encontro.id),
    meuProgresso(),
    meusFavoritos(),
    minhasPresencas(membro.email),
    listarEncontros(),
  ]);

  const eixo = eixos.find((x) => x.id === encontro.eixo_id);
  const meu = progresso.find((p) => p.item_tipo === "encontro" && p.item_id === encontro.id);
  const favorito = favoritos.some((f) => f.item_tipo === "encontro" && f.item_id === encontro.id);
  const presenca = presencas.find((p) => p.encontro_id === encontro.id);
  const hj = hoje();
  const futuro = encontro.data > hj;
  const referencias = lerReferencias(encontro.referencias);
  const slides = materiais.find((m) => m.tipo === "slides" && ehPdfOuNativo(m.drive_mime) && m.drive_file_id);
  const visiveis = todos.filter((e) => e.publicado).sort((a, b) => a.data.localeCompare(b.data));
  const pos = visiveis.findIndex((e) => e.id === encontro.id);
  const seguinte = pos >= 0 ? visiveis[pos + 1] : undefined;

  const abas = [
    encontro.mensagem_central || encontro.resumo || encontro.leitura_previa
      ? {
          rotulo: futuro ? "Preparação" : "Resumo",
          conteudo: (
            <div className="prose">
              {encontro.mensagem_central ? (
                <div className="key">
                  <span className="eyebrow">Mensagem central</span>
                  {encontro.mensagem_central}
                </div>
              ) : null}
              {encontro.leitura_previa ? (
                <p>
                  <strong>Leitura prévia:</strong> {encontro.leitura_previa}
                </p>
              ) : null}
              <Texto conteudo={encontro.resumo} />
            </div>
          ),
        }
      : null,
    slides
      ? { rotulo: "Slides", conteudo: <LeitorPdf url={`/api/arquivo/${slides.id}`} materialId={slides.id} /> }
      : null,
    referencias.length
      ? {
          rotulo: "Referências",
          conteudo: (
            <div className="refs">
              {referencias.map((r, i) => (
                <div className="ref" key={i}>
                  <p>
                    {r.doi ? (
                      <>
                        {r.texto.split(/https?:\/\/(?:dx\.)?doi\.org\/\S+|10\.\d{4,9}\/\S+/)[0]}
                        <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noopener noreferrer">
                          doi.org/{r.doi}
                        </a>
                      </>
                    ) : (
                      r.texto
                    )}
                  </p>
                  {r.nivel ? <span className="lvl">{r.nivel}</span> : <span />}
                </div>
              ))}
            </div>
          ),
        }
      : null,
    encontro.caso_clinico
      ? {
          rotulo: "Caso clínico",
          conteudo: (
            <div className="prose">
              <Texto conteudo={encontro.caso_clinico} />
            </div>
          ),
        }
      : null,
  ].filter((a) => a !== null);

  return (
    <div className="screen">
      <MarcaCelular />
      <div className="lesson-head">
        <nav className="crumbs" aria-label="Você está em">
          <Link href="/encontros">Encontros</Link>
          <span aria-hidden="true">›</span>
          {eixo ? (
            <>
              <Link href={`/biblioteca?eixo=${eixo.id}`}>{eixo.nome}</Link>
              <span aria-hidden="true">›</span>
            </>
          ) : null}
          <span>{encontro.numero ? `Encontro ${String(encontro.numero).padStart(2, "0")}` : "Encontro"}</span>
        </nav>
        <h1>{encontro.titulo}</h1>
        <div className="lmeta">
          <span>
            <b>{dataCurta(encontro.data)}</b> · {diaSemana(encontro.data)}
            {encontro.hora ? `, ${encontro.hora}` : ""}
          </span>
          {encontro.local ? <span>{encontro.local}</span> : null}
          {encontro.apresentador ? <span>Apresentado por {encontro.apresentador}</span> : null}
          {eixo ? <span className="chip">{eixo.nome}</span> : null}
          {!encontro.publicado ? <span className="chip rascunho">rascunho</span> : null}
        </div>
      </div>

      <div className="lgrid">
        <div style={{ minWidth: 0 }}>
          {encontro.youtube_id ? (
            <>
              <PlayerYouTube
                encontroId={encontro.id}
                videoId={encontro.youtube_id}
                titulo={encontro.titulo}
                posicaoInicial={meu && !meu.concluido ? meu.posicao : 0}
              />
              <div className="actions">
                <BotaoConcluido
                  tipo="encontro"
                  id={encontro.id}
                  concluido={Boolean(meu?.concluido)}
                  rotulos={["Marcar como assistida", "Assistida"]}
                />
                <BotaoFavorito tipo="encontro" id={encontro.id} ativo={favorito} grande />
              </div>
            </>
          ) : (
            <>
              <div className="player">
                <div className="stage" />
                <div className="slide">
                  <span className="eyebrow">{futuro ? "Em breve" : "Sem gravação"}</span>
                  <h2>{futuro ? "A gravação aparece aqui depois do encontro." : "Este encontro não foi gravado."}</h2>
                </div>
              </div>
              <div className="actions">
                <BotaoFavorito tipo="encontro" id={encontro.id} ativo={favorito} grande />
              </div>
            </>
          )}

          <Abas abas={abas} />
        </div>

        <aside className="aside">
          {!futuro ? (
            <div className="box">
              <h3>Presença</h3>
              <div className="pres">
                <div className={`seal${presenca ? "" : " nao"}`}>
                  <Icone nome={presenca ? "check" : "presenca"} />
                </div>
                <div>
                  <b>{presenca ? "Confirmada" : encontro.data === hj ? "Ainda não registrada" : "Não registrada"}</b>
                  <p>
                    {presenca
                      ? presenca.origem === "manual"
                        ? "Registrada pela diretoria."
                        : `Código registrado às ${horaDeTimestamp(presenca.registrado_em)}.`
                      : encontro.data === hj
                        ? "Use o código mostrado no encontro."
                        : "Se você esteve presente, fale com a diretoria."}
                  </p>
                  {!presenca && encontro.data === hj ? (
                    <Link href="/agenda#presenca" style={{ fontSize: 13, fontWeight: 600 }}>
                      Registrar agora
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {encontro.capitulos.length && encontro.youtube_id ? (
            <div className="box">
              <h3>Capítulos</h3>
              <Capitulos capitulos={encontro.capitulos} posicao={meu?.posicao ?? 0} />
            </div>
          ) : null}

          {materiais.length ? (
            <div className="box files">
              <h3>Arquivos do encontro</h3>
              {materiais.map((m) => (
                <Link key={m.id} href={`/materiais/${m.id}`}>
                  <span className="ico">
                    <Icone nome={iconeDoTipo(m.tipo)} />
                  </span>
                  <span>{m.titulo}</span>
                  <small>{m.paginas ? `${m.paginas} p.` : NOME_TIPO[m.tipo]}</small>
                </Link>
              ))}
            </div>
          ) : null}

          {seguinte ? (
            <Link className="box nextl" href={`/encontros/${seguinte.id}`}>
              <span className="eyebrow">Próximo{seguinte.numero ? ` · encontro ${String(seguinte.numero).padStart(2, "0")}` : ""}</span>
              <h4>{seguinte.titulo}</h4>
              <span className="muted" style={{ fontSize: 13 }}>
                {dataCurta(seguinte.data, false)}
                {seguinte.data > hj && (seguinte.resumo || seguinte.leitura_previa) ? " · preparação disponível" : ""}
              </span>
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
