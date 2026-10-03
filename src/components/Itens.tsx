import Link from "next/link";
import { BotaoFavorito } from "./BotaoFavorito";
import { Icone, iconeDoTipo } from "./Icone";
import { dataCurta, duracao } from "@/lib/formato";
import { NOME_TIPO, type Eixo, type ItemBiblioteca } from "@/lib/tipos";

export function hrefDoItem(i: ItemBiblioteca) {
  if (i.tipo === "aula") return `/encontros/${i.encontro.id}`;
  return `/materiais/${i.material.id}`;
}

export function chaveFavorito(i: ItemBiblioteca) {
  return i.tipo === "aula" ? `encontro:${i.encontro.id}` : `material:${i.material.id}`;
}

function nomeEixo(eixos: Eixo[], id: number | null) {
  return eixos.find((e) => e.id === id)?.nome ?? null;
}

type LinhaProps = { item: ItemBiblioteca; eixos: Eixo[]; favorito: boolean; concluido?: boolean };

export function LinhaItem({ item, eixos, favorito, concluido }: LinhaProps) {
  const eixo = nomeEixo(eixos, item.tipo === "aula" ? item.encontro.eixo_id : item.material.eixo_id);
  const titulo = item.tipo === "aula" ? item.encontro.titulo : item.material.titulo;
  const detalhes: string[] = [NOME_TIPO[item.tipo]];
  if (item.tipo === "aula") {
    if (item.encontro.numero) detalhes.push(`encontro ${item.encontro.numero}`);
    const d = duracao(item.encontro.duracao_min);
    if (d) detalhes.push(d);
  } else if (item.material.paginas) {
    detalhes.push(`${item.material.paginas} p.`);
  }
  const nivel = item.tipo !== "aula" ? item.material.nivel_evidencia : null;

  return (
    <div className="item">
      <div className="ico">
        <Icone nome={iconeDoTipo(item.tipo)} />
      </div>
      <Link href={hrefDoItem(item)}>
        <h4>{titulo}</h4>
        <div className="m">
          <span>{detalhes.join(" · ")}</span>
          {eixo ? <span>· {eixo}</span> : null}
          {nivel ? <span className="chip ev">{nivel}</span> : null}
          {concluido ? <span className="chip ok">{item.tipo === "aula" ? "assistida" : "lido"}</span> : null}
        </div>
      </Link>
      <div className="lado">
        <span className="d">{dataCurta(item.data, false)}</span>
        <BotaoFavorito
          tipo={item.tipo === "aula" ? "encontro" : "material"}
          id={item.tipo === "aula" ? item.encontro.id : item.material.id}
          ativo={favorito}
        />
      </div>
    </div>
  );
}

const CAPAS = ["", "c2", "c3"];

export function CartaoDestaque({ item, eixos, indice }: { item: ItemBiblioteca; eixos: Eixo[]; indice: number }) {
  const ehAula = item.tipo === "aula";
  const titulo = ehAula ? item.encontro.titulo : item.material.titulo;
  const descricao = ehAula ? item.encontro.mensagem_central : item.material.descricao;
  const eixo = nomeEixo(eixos, ehAula ? item.encontro.eixo_id : item.material.eixo_id);
  const marca = ehAula
    ? String(item.encontro.numero ?? "").padStart(2, "0")
    : { caso: "§", simulado: "?", artigo: "¶", resumo: "≡", slides: "▤", outro: "·" }[item.tipo];
  const rotulo = ehAula
    ? [NOME_TIPO.aula, duracao(item.encontro.duracao_min)].filter(Boolean).join(" · ")
    : [NOME_TIPO[item.tipo], item.material.paginas ? `${item.material.paginas} p.` : null].filter(Boolean).join(" · ");
  const nivel = !ehAula ? item.material.nivel_evidencia : null;

  return (
    <Link className="card" href={hrefDoItem(item)}>
      <div className={`cover ${CAPAS[indice % 3]}`}>
        <span className="big" aria-hidden="true">
          {marca}
        </span>
        <span className="eyebrow">{rotulo}</span>
      </div>
      <div className="body">
        <h3>{titulo}</h3>
        {descricao ? <p>{descricao.length > 160 ? descricao.slice(0, 157).trimEnd() + "…" : descricao}</p> : null}
        <div className="chips">
          {eixo ? <span className="chip">{eixo}</span> : null}
          {nivel ? <span className="chip ev">{nivel}</span> : null}
        </div>
      </div>
    </Link>
  );
}

export function Vazio({ titulo, children }: { titulo: string; children?: React.ReactNode }) {
  return (
    <div className="vazio">
      <b>{titulo}</b>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
