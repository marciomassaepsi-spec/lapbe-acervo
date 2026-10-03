import Link from "next/link";
import type { Metadata } from "next";
import { chaveFavorito, LinhaItem, Vazio } from "@/components/Itens";
import { Icone } from "@/components/Icone";
import { MarcaCelular } from "@/components/MarcaCelular";
import { biblioteca, listarEixos, meuProgresso, meusFavoritos } from "@/lib/dados";
import { NOME_TIPO } from "@/lib/tipos";

export const metadata: Metadata = { title: "Biblioteca" };

const FILTROS_TIPO = ["aula", "slides", "resumo", "artigo", "caso", "simulado", "outro"] as const;

export default async function Biblioteca({ searchParams }: PageProps<"/biblioteca">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const tipo = typeof sp.tipo === "string" ? sp.tipo : "";
  const eixo = typeof sp.eixo === "string" ? sp.eixo : "";

  const [itens, eixos, favoritos, progresso] = await Promise.all([
    biblioteca({ q, tipo, eixo }),
    listarEixos(),
    meusFavoritos(),
    meuProgresso(),
  ]);
  const favSet = new Set(favoritos.map((f) => `${f.item_tipo}:${f.item_id}`));
  const concluidos = new Set(progresso.filter((p) => p.concluido).map((p) => `${p.item_tipo}:${p.item_id}`));

  const link = (novoTipo: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (eixo) p.set("eixo", eixo);
    if (novoTipo) p.set("tipo", novoTipo);
    const s = p.toString();
    return s ? `/biblioteca?${s}` : "/biblioteca";
  };

  return (
    <div className="screen">
      <MarcaCelular />
      <header className="page-head">
        <span className="eyebrow">Acervo da liga</span>
        <h1>Biblioteca</h1>
        <p>Aulas gravadas, slides, resumos, artigos discutidos, casos clínicos e simulados.</p>
      </header>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <form className="filtros" method="get" action="/biblioteca" role="search">
          <div className="campo busca">
            <label htmlFor="q">Buscar pelo título</label>
            <div style={{ position: "relative" }}>
              <Icone nome="busca" />
              <input id="q" name="q" type="search" defaultValue={q} placeholder="Ex.: ansiedade, meta-análise, TCC" />
            </div>
          </div>
          <div className="campo">
            <label htmlFor="eixo">Eixo temático</label>
            <select id="eixo" name="eixo" defaultValue={eixo}>
              <option value="">Todos os eixos</option>
              {eixos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="tipo">Tipo</label>
            <select id="tipo" name="tipo" defaultValue={tipo}>
              <option value="">Todos os tipos</option>
              {FILTROS_TIPO.map((t) => (
                <option key={t} value={t}>
                  {NOME_TIPO[t]}
                </option>
              ))}
            </select>
          </div>
          <button className="btn primary" type="submit">
            Filtrar
          </button>
        </form>

        <nav className="tipos" aria-label="Filtrar por tipo">
          <Link href={link("")} aria-current={!tipo ? "true" : undefined}>
            Tudo
          </Link>
          {FILTROS_TIPO.map((t) => (
            <Link key={t} href={link(t)} aria-current={tipo === t ? "true" : undefined}>
              {NOME_TIPO[t]}
            </Link>
          ))}
        </nav>
      </section>

      <section>
        <p className="contagem" aria-live="polite" style={{ marginBottom: 10 }}>
          {itens.length} {itens.length === 1 ? "item" : "itens"}
          {q ? ` para “${q}”` : ""}
          {q || tipo || eixo ? (
            <>
              {" · "}
              <Link href="/biblioteca">limpar filtros</Link>
            </>
          ) : null}
        </p>
        {itens.length ? (
          <div className="list">
            {itens.map((item) => (
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
          <Vazio titulo="Nada encontrado">Tente outra palavra ou remova algum filtro.</Vazio>
        )}
      </section>
    </div>
  );
}
