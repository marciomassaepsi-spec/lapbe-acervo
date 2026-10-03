"use client";

import { useOptimistic, useTransition } from "react";
import { definirConcluido } from "@/app/acoes";
import { Icone } from "./Icone";

type Props = { tipo: "encontro" | "material"; id: string; concluido: boolean; rotulos: [string, string] };

/** rotulos: [antes, depois] — ex.: ["Marcar como assistida", "Assistida"] */
export function BotaoConcluido({ tipo, id, concluido, rotulos }: Props) {
  const [estado, setEstado] = useOptimistic(concluido);
  const [, iniciar] = useTransition();

  return (
    <button
      type="button"
      className="btn toggle"
      aria-pressed={estado}
      onClick={() =>
        iniciar(async () => {
          setEstado(!estado);
          await definirConcluido(tipo, id, !estado);
        })
      }
    >
      <Icone nome="check" />
      <span>{estado ? rotulos[1] : rotulos[0]}</span>
    </button>
  );
}
