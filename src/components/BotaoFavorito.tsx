"use client";

import { useOptimistic, useTransition } from "react";
import { alternarFavorito } from "@/app/acoes";
import { Icone } from "./Icone";

type Props = { tipo: "encontro" | "material"; id: string; ativo: boolean; grande?: boolean };

export function BotaoFavorito({ tipo, id, ativo, grande = false }: Props) {
  const [estado, setEstado] = useOptimistic(ativo);
  const [, iniciar] = useTransition();

  function clicar() {
    iniciar(async () => {
      setEstado(!estado);
      await alternarFavorito(tipo, id);
    });
  }

  if (grande) {
    return (
      <button type="button" className="btn toggle favorito" aria-pressed={estado} onClick={clicar}>
        <Icone nome="estrela" />
        <span>{estado ? "Nos favoritos" : "Favoritar"}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      className="fav"
      aria-pressed={estado}
      aria-label={estado ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      title={estado ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      onClick={clicar}
    >
      <Icone nome="estrela" />
    </button>
  );
}
