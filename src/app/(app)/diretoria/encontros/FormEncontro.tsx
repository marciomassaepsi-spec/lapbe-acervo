import Link from "next/link";
import { Formulario } from "@/components/Formulario";
import { salvarEncontro } from "../acoes";
import { tempo } from "@/lib/formato";
import type { Eixo, Encontro } from "@/lib/tipos";

function semestreAtual() {
  const d = new Date();
  return `${d.getFullYear()}.${d.getMonth() < 6 ? 1 : 2}`;
}

export function FormEncontro({ encontro, eixos, sugestaoNumero }: { encontro?: Encontro; eixos: Eixo[]; sugestaoNumero?: number }) {
  const e = encontro;
  return (
    <Formulario
      acao={salvarEncontro}
      botao={e ? "Salvar alterações" : "Cadastrar encontro"}
      extra={
        <Link className="btn" href="/diretoria/encontros">
          Cancelar
        </Link>
      }
    >
      {e ? <input type="hidden" name="id" value={e.id} /> : null}
      <fieldset>
        <legend>Dados do encontro</legend>
        <div className="campo">
          <label htmlFor="titulo">Título *</label>
          <input id="titulo" name="titulo" required defaultValue={e?.titulo} placeholder="Ex.: Ativação comportamental para depressão" />
        </div>
        <div className="linha">
          <div className="campo">
            <label htmlFor="data">Data *</label>
            <input id="data" name="data" type="date" required defaultValue={e?.data} />
          </div>
          <div className="campo">
            <label htmlFor="hora">Horário</label>
            <input id="hora" name="hora" defaultValue={e?.hora ?? "19:00"} placeholder="19:00" />
          </div>
          <div className="campo">
            <label htmlFor="numero">Nº do encontro</label>
            <input id="numero" name="numero" type="number" min={1} defaultValue={e?.numero ?? sugestaoNumero} />
          </div>
          <div className="campo">
            <label htmlFor="semestre">Semestre *</label>
            <input id="semestre" name="semestre" required defaultValue={e?.semestre ?? semestreAtual()} placeholder="2026.2" />
          </div>
        </div>
        <div className="linha">
          <div className="campo">
            <label htmlFor="eixo_id">Eixo temático</label>
            <select id="eixo_id" name="eixo_id" defaultValue={e?.eixo_id ?? ""}>
              <option value="">Sem eixo</option>
              {eixos.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="local">Local</label>
            <input id="local" name="local" defaultValue={e?.local ?? ""} placeholder="Sala 204 ou Online" />
          </div>
          <div className="campo">
            <label htmlFor="apresentador">Apresentado por</label>
            <input id="apresentador" name="apresentador" defaultValue={e?.apresentador ?? ""} placeholder="Diretoria Científica" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Aula gravada</legend>
        <div className="linha">
          <div className="campo" style={{ gridColumn: "span 2" }}>
            <label htmlFor="youtube">Link do YouTube (não listado)</label>
            <input
              id="youtube"
              name="youtube"
              defaultValue={e?.youtube_id ? `https://youtu.be/${e.youtube_id}` : ""}
              placeholder="https://youtu.be/…"
            />
          </div>
          <div className="campo">
            <label htmlFor="duracao_min">Duração (min)</label>
            <input id="duracao_min" name="duracao_min" type="number" min={1} defaultValue={e?.duracao_min ?? ""} />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="capitulos">Capítulos</label>
          <textarea
            id="capitulos"
            name="capitulos"
            defaultValue={e?.capitulos.map((c) => `${tempo(c.inicio)} ${c.titulo}`).join("\n")}
            placeholder={"00:00 Abertura e objetivos\n07:05 Como ler uma revisão de meta-análises\n24:10 Efeitos por transtorno"}
          />
          <small>Um por linha: tempo e título. O ligante clica para pular direto para o trecho.</small>
        </div>
      </fieldset>

      <fieldset>
        <legend>Conteúdo da página</legend>
        <div className="campo">
          <label htmlFor="mensagem_central">Mensagem central</label>
          <textarea id="mensagem_central" name="mensagem_central" style={{ minHeight: 70 }} defaultValue={e?.mensagem_central ?? ""} />
          <small>Uma ou duas frases com a principal conclusão do encontro. Aparece em destaque.</small>
        </div>
        <div className="campo">
          <label htmlFor="leitura_previa">Leitura prévia</label>
          <input id="leitura_previa" name="leitura_previa" defaultValue={e?.leitura_previa ?? ""} placeholder="Ex.: Resumo do encontro e artigo-base (18 páginas)." />
        </div>
        <div className="campo">
          <label htmlFor="resumo">Resumo</label>
          <textarea id="resumo" name="resumo" style={{ minHeight: 180 }} defaultValue={e?.resumo ?? ""} />
          <small>Use &quot;### &quot; para subtítulos, &quot;- &quot; para listas e **negrito**.</small>
        </div>
        <div className="campo">
          <label htmlFor="caso_clinico">Caso clínico (fictício ou anonimizado)</label>
          <textarea id="caso_clinico" name="caso_clinico" defaultValue={e?.caso_clinico ?? ""} />
          <small>Nunca inclua dados que identifiquem pacientes reais.</small>
        </div>
        <div className="campo">
          <label htmlFor="referencias">Referências</label>
          <textarea
            id="referencias"
            name="referencias"
            style={{ minHeight: 140 }}
            defaultValue={e?.referencias ?? ""}
            placeholder={"Uma referência APA por linha. Para indicar o tipo de estudo, termine com \" | Revisão sistemática\"."}
          />
          <small>O DOI vira link automaticamente.</small>
        </div>
      </fieldset>

      <fieldset>
        <legend>Publicação</legend>
        <div className="campo check">
          <input id="publicado" name="publicado" type="checkbox" defaultChecked={e?.publicado ?? true} />
          <label htmlFor="publicado">Visível para os ligantes</label>
        </div>
        <div className="campo check">
          <input id="destaque" name="destaque" type="checkbox" defaultChecked={e?.destaque ?? false} />
          <label htmlFor="destaque">Mostrar nos destaques da tela inicial</label>
        </div>
      </fieldset>
    </Formulario>
  );
}
