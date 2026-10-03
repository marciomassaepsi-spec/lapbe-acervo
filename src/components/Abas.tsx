"use client";

import { useId, useState, type ReactNode } from "react";

export function Abas({ abas }: { abas: { rotulo: string; conteudo: ReactNode }[] }) {
  const [atual, setAtual] = useState(0);
  const base = useId();
  if (!abas.length) return null;
  return (
    <div>
      <div className="tabs" role="tablist" aria-label="Materiais do encontro">
        {abas.map((a, i) => (
          <button
            key={a.rotulo}
            role="tab"
            type="button"
            id={`${base}-t${i}`}
            aria-selected={i === atual}
            aria-controls={`${base}-p${i}`}
            onClick={() => setAtual(i)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>
      {abas.map((a, i) => (
        <div key={a.rotulo} className="panel" role="tabpanel" id={`${base}-p${i}`} aria-labelledby={`${base}-t${i}`} hidden={i !== atual}>
          {a.conteudo}
        </div>
      ))}
    </div>
  );
}
