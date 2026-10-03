import type { Metadata } from "next";
import { BotaoConfirmar, Formulario } from "@/components/Formulario";
import { alterarAviso, salvarAviso } from "../acoes";
import { listarAvisos } from "@/lib/dados";
import { dataCurta, dataDeTimestamp } from "@/lib/formato";
import { exigirDiretoria } from "@/lib/sessao";

export const metadata: Metadata = { title: "Mural · Diretoria" };

export default async function AvisosDiretoria() {
  const { membro } = await exigirDiretoria();
  const avisos = await listarAvisos();
  return (
    <>
      <Formulario acao={salvarAviso} botao="Publicar aviso" limparAoSalvar>
        <h2>Novo aviso</h2>
        <div className="campo">
          <label htmlFor="titulo">Título *</label>
          <input id="titulo" name="titulo" required />
        </div>
        <div className="campo">
          <label htmlFor="corpo">Texto</label>
          <textarea id="corpo" name="corpo" />
        </div>
        <div className="linha">
          <div className="campo">
            <label htmlFor="autor">Assinado por</label>
            <input id="autor" name="autor" placeholder={membro.nome || "Diretoria"} />
          </div>
        </div>
        <div className="campo check">
          <input id="fixado" name="fixado" type="checkbox" />
          <label htmlFor="fixado">Fixar no topo do mural</label>
        </div>
      </Formulario>

      <section style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 860 }}>
        {avisos.map((a) => (
          <article key={a.id} className={`notice${a.fixado ? " pin" : ""}`}>
            <span className="mono">
              {a.fixado ? "Fixado · " : ""}
              {dataCurta(dataDeTimestamp(a.criado_em))}
              {a.autor ? ` · ${a.autor}` : ""}
            </span>
            <h4>{a.titulo}</h4>
            {a.corpo ? <p>{a.corpo}</p> : null}
            <div className="form-acoes" style={{ marginTop: 4 }}>
              <form action={alterarAviso}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="acao" value={a.fixado ? "desafixar" : "fixar"} />
                <button className="btn pequeno" type="submit">
                  {a.fixado ? "Desafixar" : "Fixar"}
                </button>
              </form>
              <form action={alterarAviso}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="acao" value="excluir" />
                <BotaoConfirmar mensagem="Excluir este aviso do mural?">Excluir</BotaoConfirmar>
              </form>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
