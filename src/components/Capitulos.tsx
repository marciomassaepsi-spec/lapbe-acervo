"use client";

import { EVENTO_PULAR } from "./PlayerYouTube";
import { tempo } from "@/lib/formato";
import type { Capitulo } from "@/lib/tipos";

export function Capitulos({ capitulos, posicao }: { capitulos: Capitulo[]; posicao: number }) {
  const atual = capitulos.reduce((idx, c, i) => (c.inicio <= posicao ? i : idx), -1);
  return (
    <div className="chap">
      {capitulos.map((c, i) => (
        <button
          key={i}
          type="button"
          className={posicao > 0 && i === atual ? "now" : undefined}
          onClick={() => window.dispatchEvent(new CustomEvent(EVENTO_PULAR, { detail: c.inicio }))}
        >
          <span className="t num">{tempo(c.inicio)}</span>
          <span>{c.titulo}</span>
        </button>
      ))}
    </div>
  );
}
