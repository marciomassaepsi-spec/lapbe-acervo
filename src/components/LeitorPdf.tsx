"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { salvarProgresso } from "@/app/acoes";
import { Icone } from "./Icone";

type Props = {
  url: string;
  /** Quando informado, salva a página em que a pessoa parou. */
  materialId?: string;
  paginaInicial?: number;
  altura?: "limitada" | "livre";
};

/** Leitor de PDF dentro do app (pdf.js). Funciona no celular, onde o navegador não abre PDF embutido. */
export function LeitorPdf({ url, materialId, paginaInicial = 1, altura = "limitada" }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const rolagem = useRef<HTMLDivElement>(null);
  const semRaiz = useRef<HTMLDivElement>(null); // altura livre: a página inteira rola, então observa a janela
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [largura, setLargura] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pagina, setPagina] = useState(1);
  const maxVista = useRef(0);
  const ultimoEnvio = useRef(0);

  // Carrega o documento
  useEffect(() => {
    let cancelado = false;
    let tarefa: PDFDocumentLoadingTask | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        tarefa = pdfjs.getDocument({ url });
        const carregado = await tarefa.promise;
        if (cancelado) return;
        setDoc(carregado);
      } catch {
        if (!cancelado) setErro("Não foi possível abrir este arquivo. Tente baixar pelo botão acima.");
      }
    })();
    return () => {
      cancelado = true;
      void tarefa?.destroy();
    };
  }, [url]);

  // Largura disponível
  useEffect(() => {
    const el = rolagem.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setLargura(Math.floor(e.contentRect.width) - 32));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Vai para a página onde a pessoa parou
  useEffect(() => {
    if (!doc || paginaInicial <= 1) return;
    const t = setTimeout(() => {
      rolagem.current?.querySelector(`[data-pagina="${paginaInicial}"]`)?.scrollIntoView({ block: "start" });
    }, 150);
    return () => clearTimeout(t);
  }, [doc, paginaInicial]);

  const visivel = useCallback(
    (n: number) => {
      setPagina(n);
      if (!materialId || !doc) return;
      maxVista.current = Math.max(maxVista.current, n);
      const agora = Date.now();
      const ultima = n === doc.numPages;
      if (!ultima && agora - ultimoEnvio.current < 8000) return;
      ultimoEnvio.current = agora;
      void salvarProgresso("material", materialId, (maxVista.current / doc.numPages) * 100, n, ultima);
    },
    [materialId, doc],
  );

  function telaCheia() {
    const el = caixa.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.().catch(() => {});
  }

  return (
    <div className={`leitor${altura === "livre" ? " cheio" : ""}`} ref={caixa}>
      <div className="leitor-barra">
        <span className="mono num">{doc ? `Página ${pagina} de ${doc.numPages}` : "Carregando…"}</span>
        <div className="grupo">
          <button type="button" className="btn pequeno" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} aria-label="Diminuir zoom">
            <Icone nome="menos" />
          </button>
          <span className="mono num" style={{ minWidth: 44, textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button type="button" className="btn pequeno" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} aria-label="Aumentar zoom">
            <Icone nome="mais" />
          </button>
          <button type="button" className="btn pequeno" onClick={telaCheia} aria-label="Tela cheia">
            <Icone nome="tela" />
          </button>
          <a className="btn pequeno" href={`${url}${url.includes("?") ? "&" : "?"}baixar=1`} aria-label="Baixar arquivo">
            <Icone nome="baixar" />
          </a>
        </div>
      </div>
      <div className="leitor-paginas" ref={rolagem}>
        {erro ? <p className="leitor-msg">{erro}</p> : null}
        {!doc && !erro ? <p className="leitor-msg">Abrindo o arquivo…</p> : null}
        {doc && largura > 0
          ? Array.from({ length: doc.numPages }, (_, i) => (
              <Pagina key={i} doc={doc} numero={i + 1} largura={Math.round(largura * zoom)} raiz={altura === "livre" ? semRaiz : rolagem} aoVer={visivel} />
            ))
          : null}
      </div>
    </div>
  );
}

type PaginaProps = {
  doc: PDFDocumentProxy;
  numero: number;
  largura: number;
  raiz: React.RefObject<HTMLDivElement | null>;
  aoVer: (n: number) => void;
};

function Pagina({ doc, numero, largura, raiz, aoVer }: PaginaProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [perto, setPerto] = useState(numero <= 2);
  const [proporcao, setProporcao] = useState(0.5625);

  // Renderiza só quando a página se aproxima da tela
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const obsPerto = new IntersectionObserver(([e]) => e.isIntersecting && setPerto(true), {
      root: raiz.current,
      rootMargin: "800px 0px",
    });
    const obsAtual = new IntersectionObserver(([e]) => e.isIntersecting && aoVer(numero), {
      root: raiz.current,
      threshold: 0.55,
    });
    obsPerto.observe(el);
    obsAtual.observe(el);
    return () => {
      obsPerto.disconnect();
      obsAtual.disconnect();
    };
  }, [numero, raiz, aoVer]);

  useEffect(() => {
    if (!perto || !canvas.current) return;
    let tarefa: RenderTask | null = null;
    let cancelado = false;
    (async () => {
      const pg = await doc.getPage(numero);
      if (cancelado || !canvas.current) return;
      const base = pg.getViewport({ scale: 1 });
      setProporcao(base.height / base.width);
      const escala = largura / base.width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vp = pg.getViewport({ scale: escala * dpr });
      const c = canvas.current;
      c.width = Math.floor(vp.width);
      c.height = Math.floor(vp.height);
      c.style.width = `${Math.floor(vp.width / dpr)}px`;
      tarefa = pg.render({ canvas: c, canvasContext: c.getContext("2d")!, viewport: vp });
      await tarefa.promise.catch(() => {});
    })();
    return () => {
      cancelado = true;
      tarefa?.cancel();
    };
  }, [perto, doc, numero, largura]);

  return (
    <div
      className="leitor-pagina"
      ref={wrap}
      data-pagina={numero}
      style={{ width: largura, minHeight: perto ? undefined : Math.round(largura * proporcao) }}
    >
      <canvas ref={canvas} aria-label={`Página ${numero}`} />
    </div>
  );
}
