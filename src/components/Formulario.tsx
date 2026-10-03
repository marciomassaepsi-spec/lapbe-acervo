"use client";

import { startTransition, useActionState, useEffect, useRef, type ReactNode } from "react";
import type { EstadoForm } from "@/app/(app)/diretoria/acoes";

type Props = {
  acao: (estado: EstadoForm, form: FormData) => Promise<EstadoForm>;
  botao: string;
  children: ReactNode;
  extra?: ReactNode;
  limparAoSalvar?: boolean;
};

/** Formulário do painel: mostra erros de validação e trava o botão enquanto salva. */
export function Formulario({ acao, botao, children, extra, limparAoSalvar = false }: Props) {
  const [estado, enviar, salvando] = useActionState(acao, null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (limparAoSalvar && estado?.ok) form.current?.reset();
  }, [estado, limparAoSalvar]);

  return (
    <form
      ref={form}
      className="form"
      // Envio manual: o React não limpa os campos quando há erro de validação.
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        startTransition(() => enviar(dados));
      }}
    >
      {children}
      <div aria-live="polite">
        {estado?.erro ? <p className="aviso-caixa erro">{estado.erro}</p> : null}
        {estado?.ok ? <p className="aviso-caixa ok">{estado.ok}</p> : null}
      </div>
      <div className="form-acoes">
        <button className="btn primary" type="submit" disabled={salvando}>
          {salvando ? "Salvando…" : botao}
        </button>
        {extra}
      </div>
    </form>
  );
}

/** Botão que pede confirmação antes de enviar (excluir, remover acesso). */
export function BotaoConfirmar({ mensagem, children, className = "btn perigo pequeno" }: { mensagem: string; children: ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(mensagem)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
