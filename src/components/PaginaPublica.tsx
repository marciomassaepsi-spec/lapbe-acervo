import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/** Moldura das páginas abertas ao público (privacidade e termos). */
export function PaginaPublica({ titulo, atualizado, children }: { titulo: string; atualizado: string; children: ReactNode }) {
  return (
    <div className="publica">
      <header className="publica-topo">
        <Link href="/entrar" className="brand">
          <Image src="/logo.webp" alt="Brasão da LAPBE" width={56} height={38} />
          <div>
            <b>LAPBE</b>
            <span>Acervo da liga</span>
          </div>
        </Link>
      </header>
      <article className="publica-texto">
        <span className="eyebrow">Atualizado em {atualizado}</span>
        <h1>{titulo}</h1>
        {children}
      </article>
      <footer className="publica-rodape">
        <Link href="/privacidade">Política de Privacidade</Link>
        <Link href="/termos">Termos de Uso</Link>
        <Link href="/entrar">Entrar no acervo</Link>
      </footer>
    </div>
  );
}

export function contato() {
  return process.env.NEXT_PUBLIC_EMAIL_CONTATO?.trim() || null;
}
