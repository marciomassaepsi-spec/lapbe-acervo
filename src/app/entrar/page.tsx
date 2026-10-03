import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BotaoGoogle } from "./BotaoGoogle";
import { modoDemo } from "@/lib/sessao";

export const metadata: Metadata = { title: "Entrar" };

const MENSAGENS: Record<string, string> = {
  acesso:
    "Seu e-mail ainda não está na lista de membros da liga. Peça para a diretoria liberar o acesso e entre com o mesmo e-mail Google.",
  falha: "Não foi possível concluir a entrada. Tente de novo.",
};

export default async function Entrar({ searchParams }: PageProps<"/entrar">) {
  const { erro } = await searchParams;
  const mensagem = typeof erro === "string" ? MENSAGENS[erro] : undefined;

  return (
    <div className="entrar">
      <div className="entrar-arte">
        <span className="eyebrow" style={{ color: "rgba(238,242,251,.6)" }}>
          Acervo da liga
        </span>
        <h1>
          Aulas, artigos e casos da <em>LAPBE</em> em um só lugar.
        </h1>
        <p>Liga Acadêmica de Psicologia Baseada em Evidências · UNIME Anhanguera</p>
      </div>
      <div className="entrar-form">
        <Image src="/logo.webp" alt="Brasão da LAPBE" width={220} height={151} priority />
        <div>
          <h2>Entrar no acervo</h2>
          <p className="muted">Use a conta Google cadastrada na liga.</p>
          {mensagem ? (
            <p className="aviso-caixa erro" role="alert">
              {mensagem}
            </p>
          ) : null}
          {modoDemo() ? (
            <Link className="btn primary" href="/">
              Abrir demonstração
            </Link>
          ) : (
            <BotaoGoogle trocarConta={erro === "acesso"} />
          )}
        </div>
      </div>
    </div>
  );
}
