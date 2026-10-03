"use client";

import { useEffect, useRef, useState } from "react";
import { salvarProgresso } from "@/app/acoes";

type YTPlayer = {
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  seekTo(s: number, permitir: boolean): void;
  playVideo(): void;
  destroy(): void;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opcoes: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: { onStateChange?: (e: { data: number }) => void; onReady?: () => void };
    },
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiCarregando: Promise<YTNamespace> | null = null;
function carregarApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiCarregando) {
    apiCarregando = new Promise((ok) => {
      const anterior = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        anterior?.();
        ok(window.YT!);
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    });
  }
  return apiCarregando;
}

export const EVENTO_PULAR = "lapbe:pular";

type Props = { encontroId: string; videoId: string; titulo: string; posicaoInicial: number };

/**
 * Player do YouTube (vídeo não listado). Salva até onde a pessoa assistiu
 * e marca a aula como assistida quando passa de 90%.
 */
export function PlayerYouTube({ encontroId, videoId, titulo, posicaoInicial }: Props) {
  const alvo = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const ultimoEnvio = useRef(0);
  const [iniciado, setIniciado] = useState(false);
  const demo = videoId.startsWith("demo-");

  useEffect(() => {
    if (!iniciado || demo || !alvo.current) return;
    let ativo = true;
    let relogio: ReturnType<typeof setInterval> | undefined;

    const enviar = (forcar = false) => {
      const p = player.current;
      if (!p) return;
      const dur = p.getDuration();
      const pos = p.getCurrentTime();
      if (!dur) return;
      const agora = Date.now();
      if (!forcar && agora - ultimoEnvio.current < 15000) return;
      ultimoEnvio.current = agora;
      void salvarProgresso("encontro", encontroId, (pos / dur) * 100, pos);
    };

    carregarApi().then((YT) => {
      if (!ativo || !alvo.current) return;
      // O YouTube troca este elemento pelo iframe; por isso ele é criado fora do React.
      const el = document.createElement("div");
      alvo.current.replaceChildren(el);
      player.current = new YT.Player(el, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, autoplay: 1, start: Math.floor(posicaoInicial) },
        events: {
          onStateChange: (e) => {
            // 2 = pausado, 0 = terminou
            if (e.data === 2 || e.data === 0) enviar(true);
          },
        },
      });
      relogio = setInterval(() => enviar(), 5000);
    });

    const pular = (ev: Event) => {
      const s = (ev as CustomEvent<number>).detail;
      player.current?.seekTo(s, true);
      player.current?.playVideo();
    };
    window.addEventListener(EVENTO_PULAR, pular);

    return () => {
      ativo = false;
      if (relogio) clearInterval(relogio);
      window.removeEventListener(EVENTO_PULAR, pular);
      enviar(true);
      player.current?.destroy();
      player.current = null;
    };
  }, [iniciado, demo, videoId, encontroId, posicaoInicial]);

  // Clicar num capítulo antes de iniciar o vídeo também inicia o player.
  useEffect(() => {
    if (iniciado) return;
    const iniciar = () => setIniciado(true);
    window.addEventListener(EVENTO_PULAR, iniciar);
    return () => window.removeEventListener(EVENTO_PULAR, iniciar);
  }, [iniciado]);

  return (
    <div className="player">
      {iniciado && !demo ? (
        <div data-yt ref={alvo} />
      ) : (
        <>
          <div className="stage" />
          <div className="slide">
            <span className="eyebrow">Aula gravada</span>
            <h2>{titulo}</h2>
          </div>
          <button className="bigplay" type="button" aria-label="Assistir à aula" onClick={() => setIniciado(true)} />
          {demo && iniciado ? <p className="nota">Modo demonstração: aqui aparece o vídeo do YouTube.</p> : null}
        </>
      )}
    </div>
  );
}
