import Link from "next/link";
import { Formulario } from "@/components/Formulario";
import { SeletorDrive } from "@/components/SeletorDrive";
import { salvarMaterial } from "../acoes";
import { dataCurta } from "@/lib/formato";
import { NOME_TIPO, TIPOS_MATERIAL, type Eixo, type Encontro, type Material } from "@/lib/tipos";

const NIVEIS = [
  "Revisão sistemática",
  "Meta-análise",
  "Revisão de meta-análises",
  "Ensaio clínico randomizado",
  "Estudo de coorte",
  "Estudo caso-controle",
  "Estudo transversal",
  "Série/relato de caso",
  "Diretriz clínica",
  "Documento de posição",
  "Opinião de especialista",
];

type Props = { material?: Material; eixos: Eixo[]; encontros: Encontro[]; encontroInicial?: string };

export function FormMaterial({ material: m, eixos, encontros, encontroInicial }: Props) {
  return (
    <Formulario
      acao={salvarMaterial}
      botao={m ? "Salvar alterações" : "Publicar material"}
      extra={
        <Link className="btn" href="/diretoria/materiais">
          Cancelar
        </Link>
      }
    >
      {m ? <input type="hidden" name="id" value={m.id} /> : null}
      <fieldset>
        <legend>Arquivo</legend>
        <SeletorDrive valorInicial={m?.drive_file_id ?? ""} mimeInicial={m?.drive_mime ?? ""} />
        <div className="campo">
          <label htmlFor="link_url">Ou um link externo (opcional)</label>
          <input id="link_url" name="link_url" type="url" defaultValue={m?.link_url ?? ""} placeholder="https://… (ex.: artigo no site da revista)" />
        </div>
      </fieldset>

      <fieldset>
        <legend>Informações</legend>
        <div className="campo">
          <label htmlFor="titulo">Título *</label>
          <input id="titulo" name="titulo" required defaultValue={m?.titulo} />
        </div>
        <div className="linha">
          <div className="campo">
            <label htmlFor="tipo">Tipo *</label>
            <select id="tipo" name="tipo" required defaultValue={m?.tipo ?? "slides"}>
              {TIPOS_MATERIAL.map((t) => (
                <option key={t} value={t}>
                  {NOME_TIPO[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="encontro_id">Encontro</label>
            <select id="encontro_id" name="encontro_id" defaultValue={m?.encontro_id ?? encontroInicial ?? ""}>
              <option value="">Nenhum (material avulso)</option>
              {encontros.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.numero ? `${e.numero}. ` : ""}
                  {e.titulo.length > 60 ? e.titulo.slice(0, 58) + "…" : e.titulo} ({dataCurta(e.data, false)})
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="eixo_id">Eixo temático</label>
            <select id="eixo_id" name="eixo_id" defaultValue={m?.eixo_id ?? ""}>
              <option value="">Sem eixo</option>
              {eixos.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="linha">
          <div className="campo">
            <label htmlFor="nivel_evidencia">Tipo de estudo (para artigos)</label>
            <input id="nivel_evidencia" name="nivel_evidencia" list="niveis" defaultValue={m?.nivel_evidencia ?? ""} />
            <datalist id="niveis">
              {NIVEIS.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>
          <div className="campo">
            <label htmlFor="paginas">Nº de páginas</label>
            <input id="paginas" name="paginas" type="number" min={1} defaultValue={m?.paginas ?? ""} />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="descricao">Descrição curta</label>
          <textarea id="descricao" name="descricao" style={{ minHeight: 70 }} defaultValue={m?.descricao ?? ""} />
        </div>
        <div className="campo">
          <label htmlFor="referencia_apa">Referência em APA (para artigos)</label>
          <textarea id="referencia_apa" name="referencia_apa" style={{ minHeight: 70 }} defaultValue={m?.referencia_apa ?? ""} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Publicação</legend>
        <div className="campo check">
          <input id="publicado" name="publicado" type="checkbox" defaultChecked={m?.publicado ?? true} />
          <label htmlFor="publicado">Visível para os ligantes</label>
        </div>
        <div className="campo check">
          <input id="destaque" name="destaque" type="checkbox" defaultChecked={m?.destaque ?? false} />
          <label htmlFor="destaque">Mostrar nos destaques da tela inicial</label>
        </div>
      </fieldset>
    </Formulario>
  );
}
