import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ContagemCodigo } from "@/components/ContagemCodigo";
import { encerrarCodigo, gerarCodigo, marcarPresenca } from "../../acoes";
import { codigoDoEncontro, encontroPorId, listarMembros, presencasDoEncontro } from "@/lib/dados";
import { dataCurta, horaDeTimestamp, jaPassou } from "@/lib/formato";

export const metadata: Metadata = { title: "Presença · Diretoria" };

export default async function PresencaEncontro({ params }: PageProps<"/diretoria/presenca/[id]">) {
  const { id } = await params;
  const encontro = await encontroPorId(id);
  if (!encontro) notFound();
  const [membros, presencas, codigo] = await Promise.all([listarMembros(), presencasDoEncontro(id), codigoDoEncontro(id)]);
  const ativos = membros.filter((m) => m.ativo);
  const codigoValido = codigo && !jaPassou(codigo.expira_em);

  return (
    <>
      <section className="box" style={{ maxWidth: 860 }}>
        <h3>
          {encontro.numero ? `Encontro ${encontro.numero} · ` : ""}
          {dataCurta(encontro.data)}
        </h3>
        <p style={{ fontFamily: "var(--f-display)", fontSize: 22 }}>{encontro.titulo}</p>
        {codigoValido ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span className="eyebrow">Código de presença · projete para a turma</span>
            <span className="codigo-grande num">{codigo.codigo}</span>
            <ContagemCodigo expiraEm={codigo.expira_em} />
            <p className="muted" style={{ fontSize: 14 }}>
              Os ligantes digitam o código em Agenda e presença. Recarregue a página para atualizar a lista.
            </p>
            <form action={encerrarCodigo}>
              <input type="hidden" name="encontro_id" value={encontro.id} />
              <button className="btn" type="submit">
                Encerrar código agora
              </button>
            </form>
          </div>
        ) : (
          <form action={gerarCodigo} className="form-acoes">
            <input type="hidden" name="encontro_id" value={encontro.id} />
            <label htmlFor="minutos" className="muted" style={{ fontSize: 14 }}>
              Válido por
            </label>
            <select id="minutos" name="minutos" defaultValue="20" className="input" style={{ width: "auto" }}>
              <option value="10">10 minutos</option>
              <option value="20">20 minutos</option>
              <option value="40">40 minutos</option>
              <option value="90">1h30</option>
            </select>
            <button className="btn primary" type="submit">
              Gerar código de presença
            </button>
          </form>
        )}
      </section>

      <section>
        <div className="sec-head">
          <h2>
            Presentes: {presencas.length} de {ativos.length}
          </h2>
        </div>
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th>Membro</th>
                <th>Situação</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ativos.map((m) => {
                const p = presencas.find((x) => x.email === m.email);
                return (
                  <tr key={m.email}>
                    <td>
                      {m.nome || m.email}
                      <div className="muted mono" style={{ fontSize: 11.5 }}>
                        {m.email}
                      </div>
                    </td>
                    <td>
                      {p ? (
                        <span className="chip ok">
                          presente · {p.origem === "manual" ? "manual" : horaDeTimestamp(p.registrado_em)}
                        </span>
                      ) : (
                        <span className="chip">ausente</span>
                      )}
                    </td>
                    <td className="acoes">
                      <form action={marcarPresenca}>
                        <input type="hidden" name="encontro_id" value={encontro.id} />
                        <input type="hidden" name="email" value={m.email} />
                        <input type="hidden" name="presente" value={p ? "0" : "1"} />
                        <button className="btn pequeno" type="submit">
                          {p ? "Remover presença" : "Marcar presente"}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
