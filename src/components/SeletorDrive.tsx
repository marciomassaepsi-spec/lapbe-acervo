"use client";

import { useEffect, useState } from "react";
import { Icone } from "./Icone";

type Arquivo = { id: string; name: string; mimeType: string; size?: string };
const PASTA = "application/vnd.google-apps.folder";

function tipoLegivel(mime: string) {
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("document")) return "Docs";
  if (mime.includes("presentation")) return "Apresentação";
  if (mime.includes("spreadsheet")) return "Planilha";
  if (mime.startsWith("video/")) return "Vídeo";
  if (mime.includes("word")) return "Word";
  if (mime.includes("powerpoint") || mime.includes("presentationml")) return "PowerPoint";
  return mime.split("/").pop() ?? "";
}

function tamanho(bytes?: string) {
  if (!bytes) return "";
  const n = Number(bytes);
  return n > 1e6 ? `${(n / 1e6).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`;
}

/**
 * Navega pela pasta da liga no Drive e escolhe um arquivo.
 * Preenche os campos "drive" e "drive_mime" do formulário (e o título, se estiver vazio).
 */
export function SeletorDrive({ valorInicial, mimeInicial }: { valorInicial: string; mimeInicial: string }) {
  const [caminho, setCaminho] = useState<{ id: string; nome: string }[]>([]);
  const [arquivos, setArquivos] = useState<Arquivo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [escolhido, setEscolhido] = useState(valorInicial);
  const [mime, setMime] = useState(mimeInicial);
  const pastaAtual = caminho.at(-1)?.id ?? "";

  useEffect(() => {
    let ativo = true;
    fetch(`/api/drive${pastaAtual ? `?pasta=${encodeURIComponent(pastaAtual)}` : ""}`)
      .then(async (r) => {
        const j = (await r.json()) as { arquivos?: Arquivo[]; erro?: string };
        if (!ativo) return;
        if (!r.ok) {
          setErro(j.erro ?? "Não foi possível listar o Drive.");
          setArquivos([]);
        } else {
          setErro(null);
          setArquivos(j.arquivos ?? []);
        }
      })
      .catch(() => ativo && setErro("Sem conexão com o servidor."));
    return () => {
      ativo = false;
    };
  }, [pastaAtual]);

  function escolher(a: Arquivo) {
    if (a.mimeType === PASTA) {
      setArquivos(null);
      setCaminho((c) => [...c, { id: a.id, nome: a.name }]);
      return;
    }
    setEscolhido(a.id);
    setMime(a.mimeType);
    const titulo = document.getElementById("titulo") as HTMLInputElement | null;
    if (titulo && !titulo.value) titulo.value = a.name.replace(/\.[a-z0-9]{2,5}$/i, "");
  }

  return (
    <div className="campo">
      <span className="rotulo">Arquivo do Drive</span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", fontSize: 13 }}>
        <button type="button" className="btn pequeno" onClick={() => { setArquivos(null); setCaminho([]); }} disabled={!caminho.length}>
          <Icone nome="pasta" /> Pasta da liga
        </button>
        {caminho.map((p, i) => (
          <button type="button" key={p.id} className="btn pequeno" onClick={() => { setArquivos(null); setCaminho((c) => c.slice(0, i + 1)); }}>
            › {p.nome}
          </button>
        ))}
      </div>
      <div className="drive-lista" role="listbox" aria-label="Arquivos da pasta">
        {erro ? <p className="leitor-msg" style={{ padding: 16 }}>{erro}</p> : null}
        {!arquivos && !erro ? <p className="leitor-msg" style={{ padding: 16 }}>Carregando…</p> : null}
        {arquivos?.length === 0 && !erro ? <p className="leitor-msg" style={{ padding: 16 }}>Pasta vazia.</p> : null}
        {arquivos?.map((a) => (
          <button
            key={a.id}
            type="button"
            role="option"
            aria-selected={escolhido === a.id}
            onClick={() => escolher(a)}
          >
            <Icone nome={a.mimeType === PASTA ? "pasta" : a.mimeType.includes("presentation") ? "slides" : "pdf"} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
            <small className="mono muted">{a.mimeType === PASTA ? "pasta" : [tipoLegivel(a.mimeType), tamanho(a.size)].filter(Boolean).join(" · ")}</small>
          </button>
        ))}
      </div>
      <label htmlFor="drive" style={{ marginTop: 6 }}>
        Ou cole o link do arquivo no Drive
      </label>
      <input
        id="drive"
        name="drive"
        value={escolhido}
        onChange={(e) => {
          setEscolhido(e.target.value);
          setMime("");
        }}
        placeholder="https://drive.google.com/file/d/…"
      />
      <input type="hidden" name="drive_mime" value={mime} />
      <small>PDFs, Documentos e Apresentações do Google abrem dentro do app. Outros formatos ficam disponíveis para baixar.</small>
    </div>
  );
}
