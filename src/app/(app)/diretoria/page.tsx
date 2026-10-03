import Link from "next/link";
import type { Metadata } from "next";
import { listarAvisos, listarEncontros, listarMateriais, listarMembros, proximosEncontros } from "@/lib/dados";
import { driveConfigurado } from "@/lib/drive";
import { dataCurta } from "@/lib/formato";
import { modoDemo } from "@/lib/sessao";

export const metadata: Metadata = { title: "Diretoria" };

export default async function Painel() {
  const [encontros, materiais, membros, avisos, proximos] = await Promise.all([
    listarEncontros(),
    listarMateriais(),
    listarMembros(),
    listarAvisos(),
    proximosEncontros(1),
  ]);
  const ativos = membros.filter((m) => m.ativo);
  const drive = modoDemo() || (driveConfigurado() && Boolean(process.env.DRIVE_FOLDER_ID));
  const proximo = proximos[0];

  return (
    <>
      {!drive ? (
        <p className="aviso-caixa erro">
          O Google Drive ainda não está conectado. Sem ele, os PDFs não abrem no app. Veja o passo 4 do README do projeto.
        </p>
      ) : null}

      <div className="painel-grid">
        <Link className="painel-card" href="/diretoria/encontros/novo">
          <span className="eyebrow">Encontros</span>
          <b className="num">{encontros.length}</b>
          <p>Cadastrar um encontro com vídeo, resumo, capítulos e referências.</p>
        </Link>
        <Link className="painel-card" href="/diretoria/materiais/novo">
          <span className="eyebrow">Materiais</span>
          <b className="num">{materiais.length}</b>
          <p>Publicar slides, resumos, artigos, casos e simulados da pasta do Drive.</p>
        </Link>
        <Link className="painel-card" href="/diretoria/membros">
          <span className="eyebrow">Membros ativos</span>
          <b className="num">{ativos.length}</b>
          <p>
            {ativos.filter((m) => m.papel === "diretoria").length} da diretoria, {ativos.filter((m) => m.papel === "ligante").length} ligantes.
          </p>
        </Link>
        <Link className="painel-card" href="/diretoria/avisos">
          <span className="eyebrow">Mural</span>
          <b className="num">{avisos.length}</b>
          <p>Publicar, fixar ou remover avisos.</p>
        </Link>
      </div>

      {proximo ? (
        <section className="box" style={{ maxWidth: 640 }}>
          <h3>Próximo encontro</h3>
          <p style={{ fontFamily: "var(--f-display)", fontSize: 21 }}>{proximo.titulo}</p>
          <p className="muted">
            {dataCurta(proximo.data)}
            {proximo.hora ? ` · ${proximo.hora}` : ""}
            {proximo.local ? ` · ${proximo.local}` : ""}
          </p>
          <div className="form-acoes">
            <Link className="btn primary" href={`/diretoria/presenca/${proximo.id}`}>
              Abrir presença
            </Link>
            <Link className="btn" href={`/diretoria/encontros/${proximo.id}`}>
              Editar encontro
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
