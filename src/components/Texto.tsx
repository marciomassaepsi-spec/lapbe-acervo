import type { ReactNode } from "react";

/**
 * Formatação simples para os textos escritos pela diretoria:
 * "### título", listas com "- " ou "1. ", **negrito**, *itálico* e parágrafos.
 */
export function Texto({ conteudo }: { conteudo: string | null }) {
  if (!conteudo?.trim()) return null;
  const blocos = conteudo.replace(/\r/g, "").split(/\n{2,}/);
  const saida: ReactNode[] = [];

  blocos.forEach((bloco, b) => {
    const linhas = bloco.split("\n").filter((l) => l.trim());
    let lista: { ordenada: boolean; itens: string[] } | null = null;
    let paragrafo: string[] = [];

    const fecharParagrafo = () => {
      if (paragrafo.length) saida.push(<p key={`p${b}-${saida.length}`}>{inline(paragrafo.join(" "))}</p>);
      paragrafo = [];
    };
    const fecharLista = () => {
      if (!lista) return;
      const itens = lista.itens.map((t, i) => <li key={i}>{inline(t)}</li>);
      saida.push(lista.ordenada ? <ol key={`l${b}-${saida.length}`}>{itens}</ol> : <ul key={`l${b}-${saida.length}`}>{itens}</ul>);
      lista = null;
    };

    for (const linha of linhas) {
      const t = linha.trim();
      const titulo = t.match(/^#{1,4}\s+(.*)$/);
      const ul = t.match(/^[-*•]\s+(.*)$/);
      const ol = t.match(/^\d+[.)]\s+(.*)$/);
      if (titulo) {
        fecharParagrafo();
        fecharLista();
        saida.push(<h3 key={`h${b}-${saida.length}`}>{inline(titulo[1])}</h3>);
      } else if (ul || ol) {
        fecharParagrafo();
        const ordenada = Boolean(ol);
        if (lista && lista.ordenada !== ordenada) fecharLista();
        if (!lista) lista = { ordenada, itens: [] };
        lista.itens.push((ul ?? ol)![1]);
      } else {
        fecharLista();
        paragrafo.push(t);
      }
    }
    fecharParagrafo();
    fecharLista();
  });

  return <>{saida}</>;
}

function inline(texto: string): ReactNode[] {
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s)]+)/g);
  return partes.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(p)) return <em key={i}>{p.slice(1, -1)}</em>;
    if (/^https?:\/\//.test(p))
      return (
        <a key={i} href={p} target="_blank" rel="noopener noreferrer">
          {p}
        </a>
      );
    return p;
  });
}
