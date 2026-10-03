import type { Metadata } from "next";
import { Vazio } from "@/components/Itens";
import { MarcaCelular } from "@/components/MarcaCelular";
import { listarAvisos } from "@/lib/dados";
import { dataCurta, dataDeTimestamp } from "@/lib/formato";

export const metadata: Metadata = { title: "Mural" };

export default async function Mural() {
  const avisos = await listarAvisos();
  return (
    <div className="screen" style={{ maxWidth: 760 }}>
      <MarcaCelular />
      <header className="page-head">
        <span className="eyebrow">Recados da diretoria</span>
        <h1>Mural</h1>
      </header>
      {avisos.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {avisos.map((a) => (
            <article key={a.id} className={`notice${a.fixado ? " pin" : ""}`}>
              <span className="mono">
                {a.fixado ? "Fixado · " : ""}
                {dataCurta(dataDeTimestamp(a.criado_em))}
                {a.autor ? ` · ${a.autor}` : ""}
              </span>
              <h4 style={{ fontSize: 17 }}>{a.titulo}</h4>
              {a.corpo ? <p style={{ fontSize: 15 }}>{a.corpo}</p> : null}
            </article>
          ))}
        </div>
      ) : (
        <Vazio titulo="Sem avisos por enquanto" />
      )}
    </div>
  );
}
