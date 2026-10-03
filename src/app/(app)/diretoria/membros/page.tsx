import type { Metadata } from "next";
import { BotaoConfirmar, Formulario } from "@/components/Formulario";
import { adicionarMembros, atualizarMembro } from "../acoes";
import { listarMembros } from "@/lib/dados";
import { exigirDiretoria } from "@/lib/sessao";

export const metadata: Metadata = { title: "Membros · Diretoria" };

export default async function Membros() {
  const { membro: eu } = await exigirDiretoria();
  const membros = await listarMembros();
  const ativos = membros.filter((m) => m.ativo);
  const inativos = membros.filter((m) => !m.ativo);

  return (
    <>
      <Formulario acao={adicionarMembros} botao="Liberar acesso" limparAoSalvar>
        <h2>Liberar acesso</h2>
        <div className="campo">
          <label htmlFor="lista">E-mails Google (um por linha, com o nome se quiser)</label>
          <textarea id="lista" name="lista" placeholder={"maria.silva@gmail.com, Maria Silva\njoao.santos@gmail.com, João Santos"} required />
          <small>Dá para colar direto de uma planilha. Quem já está na lista é atualizado.</small>
        </div>
        <div className="linha">
          <div className="campo">
            <label htmlFor="papel">Papel</label>
            <select id="papel" name="papel" defaultValue="ligante">
              <option value="ligante">Ligante</option>
              <option value="diretoria">Diretoria</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="turma">Turma</label>
            <input id="turma" name="turma" placeholder="2026.2" />
          </div>
        </div>
      </Formulario>

      <section>
        <div className="sec-head">
          <h2>Membros ativos ({ativos.length})</h2>
        </div>
        <TabelaMembros membros={ativos} eu={eu.email} />
      </section>

      {inativos.length ? (
        <section>
          <div className="sec-head">
            <h2>Sem acesso ({inativos.length})</h2>
          </div>
          <TabelaMembros membros={inativos} eu={eu.email} />
        </section>
      ) : null}
    </>
  );
}

function TabelaMembros({ membros, eu }: { membros: Awaited<ReturnType<typeof listarMembros>>; eu: string }) {
  return (
    <div className="tabela-wrap">
      <table className="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Papel</th>
            <th>Turma</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {membros.map((m) => (
            <tr key={m.email}>
              <td>{m.nome || "—"}</td>
              <td className="mono" style={{ fontSize: 12.5 }}>
                {m.email}
              </td>
              <td>{m.papel === "diretoria" ? <span className="chip ev">diretoria</span> : <span className="chip">ligante</span>}</td>
              <td>{m.turma ?? "—"}</td>
              <td className="acoes">
                {m.email === eu ? (
                  <span className="muted" style={{ fontSize: 12.5 }}>
                    você
                  </span>
                ) : (
                  <>
                    <form action={atualizarMembro}>
                      <input type="hidden" name="email" value={m.email} />
                      <input type="hidden" name="acao" value={m.papel === "diretoria" ? "ligante" : "diretoria"} />
                      <button className="btn pequeno" type="submit">
                        {m.papel === "diretoria" ? "Tornar ligante" : "Tornar diretoria"}
                      </button>
                    </form>{" "}
                    <form action={atualizarMembro}>
                      <input type="hidden" name="email" value={m.email} />
                      <input type="hidden" name="acao" value={m.ativo ? "desativar" : "ativar"} />
                      {m.ativo ? (
                        <BotaoConfirmar mensagem={`Remover o acesso de ${m.nome || m.email}? O histórico de presença é mantido.`}>
                          Remover acesso
                        </BotaoConfirmar>
                      ) : (
                        <button className="btn pequeno" type="submit">
                          Devolver acesso
                        </button>
                      )}
                    </form>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
