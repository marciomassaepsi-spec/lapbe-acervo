import type { Metadata } from "next";
import { BotaoConfirmar } from "@/components/Formulario";
import { excluirEixo, salvarEixo } from "../acoes";
import { listarEixos } from "@/lib/dados";

export const metadata: Metadata = { title: "Eixos · Diretoria" };

export default async function Eixos() {
  const eixos = await listarEixos();
  return (
    <section className="form" style={{ gap: 10 }}>
      <h2>Eixos temáticos</h2>
      <p className="muted" style={{ fontSize: 14 }}>
        Organizam a biblioteca e os encontros. A ordem define a sequência nos filtros.
      </p>
      {eixos.map((e) => (
        <div key={e.id} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
          <form action={salvarEixo} style={{ display: "flex", gap: 8, flex: 1, minWidth: 0, alignItems: "end", flexWrap: "wrap" }}>
            <input type="hidden" name="id" value={e.id} />
            <div className="campo" style={{ width: 80 }}>
              <label htmlFor={`ordem-${e.id}`}>Ordem</label>
              <input id={`ordem-${e.id}`} name="ordem" type="number" defaultValue={e.ordem} />
            </div>
            <div className="campo" style={{ flex: 1, minWidth: 200 }}>
              <label htmlFor={`nome-${e.id}`}>Nome</label>
              <input id={`nome-${e.id}`} name="nome" defaultValue={e.nome} required />
            </div>
            <button className="btn" type="submit">
              Salvar
            </button>
          </form>
          <form action={excluirEixo}>
            <input type="hidden" name="id" value={e.id} />
            <BotaoConfirmar mensagem={`Excluir o eixo "${e.nome}"? Encontros e materiais desse eixo ficam sem eixo.`} className="btn perigo">
              Excluir
            </BotaoConfirmar>
          </form>
        </div>
      ))}
      <form action={salvarEixo} style={{ display: "flex", gap: 8, alignItems: "end", flexWrap: "wrap", borderTop: "1px solid var(--line)", paddingTop: 14 }}>
        <div className="campo" style={{ width: 80 }}>
          <label htmlFor="ordem-novo">Ordem</label>
          <input id="ordem-novo" name="ordem" type="number" defaultValue={eixos.length + 1} />
        </div>
        <div className="campo" style={{ flex: 1, minWidth: 200 }}>
          <label htmlFor="nome-novo">Novo eixo</label>
          <input id="nome-novo" name="nome" required placeholder="Ex.: Neuropsicologia" />
        </div>
        <button className="btn primary" type="submit">
          Adicionar
        </button>
      </form>
    </section>
  );
}
