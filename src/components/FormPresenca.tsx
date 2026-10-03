"use client";

import { useActionState } from "react";
import { registrarPresenca, type EstadoPresenca } from "@/app/acoes";

export function FormPresenca() {
  const [estado, acao, enviando] = useActionState<EstadoPresenca, FormData>(registrarPresenca, null);
  return (
    <form action={acao} className="presenca-form-wrap" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label htmlFor="codigo-presenca" className="muted" style={{ fontSize: 13 }}>
        Digite o código de 4 números mostrado pela diretoria durante o encontro.
      </label>
      <div className="presenca-form">
        <input
          id="codigo-presenca"
          name="codigo"
          inputMode="numeric"
          autoComplete="off"
          pattern="[0-9]{4}"
          maxLength={4}
          required
          placeholder="0000"
          aria-describedby="presenca-retorno"
        />
        <button className="btn primary" type="submit" disabled={enviando}>
          {enviando ? "Registrando…" : "Registrar presença"}
        </button>
      </div>
      <div id="presenca-retorno" aria-live="polite">
        {estado ? <p className={`aviso-caixa ${estado.ok ? "ok" : "erro"}`}>{estado.mensagem}</p> : null}
      </div>
    </form>
  );
}
