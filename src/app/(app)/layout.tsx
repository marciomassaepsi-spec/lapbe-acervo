import Image from "next/image";
import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import { Icone } from "@/components/Icone";
import { RegistrarSW } from "@/components/RegistrarSW";
import { exigirMembro, modoDemo } from "@/lib/sessao";
import { iniciais } from "@/lib/formato";

export default async function LayoutApp({ children }: LayoutProps<"/">) {
  const { membro } = await exigirMembro();
  const diretoria = membro.papel === "diretoria";

  return (
    <>
      {modoDemo() ? <div className="demo-faixa">Modo demonstração · dados de exemplo</div> : null}
      <div className="app">
        <aside className="rail">
          <Link href="/" className="brand">
            <Image src="/logo.webp" alt="Brasão da LAPBE" width={64} height={44} priority />
            <div>
              <b>LAPBE</b>
              <span>
                Liga Acadêmica de Psicologia
                <br />
                Baseada em Evidências
              </span>
            </div>
          </Link>
          <nav className="nav" aria-label="Navegação">
            <NavLink href="/">
              <Icone nome="inicio" />
              Início
            </NavLink>
            <NavLink href="/biblioteca">
              <Icone nome="biblioteca" />
              Biblioteca
            </NavLink>
            <NavLink href="/encontros">
              <Icone nome="coluna" />
              Encontros
            </NavLink>
            <NavLink href="/agenda">
              <Icone nome="agenda" />
              Agenda e presença
            </NavLink>
            <NavLink href="/favoritos">
              <Icone nome="estrela" />
              Favoritos
            </NavLink>
            <NavLink href="/mural">
              <Icone nome="sino" />
              Mural
            </NavLink>
            {diretoria ? (
              <>
                <div className="sep" />
                <NavLink href="/diretoria">
                  <Icone nome="engrenagem" />
                  Diretoria
                </NavLink>
              </>
            ) : null}
          </nav>
          <div className="me">
            <div className="avatar" aria-hidden="true">
              {iniciais(membro.nome, membro.email)}
            </div>
            <div>
              {membro.nome || membro.email}
              <small>
                {diretoria ? "Diretoria" : "Ligante"}
                {membro.turma ? ` · turma ${membro.turma}` : ""}
              </small>
              <form action="/auth/sair" method="post">
                <button className="sair" type="submit">
                  Sair
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="conteudo">{children}</main>
      </div>

      <nav className="tabbar" aria-label="Navegação">
        <NavLink href="/">
          <Icone nome="inicio" />
          Início
        </NavLink>
        <NavLink href="/biblioteca">
          <Icone nome="busca" />
          Biblioteca
        </NavLink>
        <NavLink href="/encontros">
          <Icone nome="coluna" />
          Encontros
        </NavLink>
        <NavLink href="/agenda">
          <Icone nome="presenca" />
          Presença
        </NavLink>
        <NavLink href={diretoria ? "/diretoria" : "/favoritos"}>
          <Icone nome={diretoria ? "engrenagem" : "estrela"} />
          {diretoria ? "Diretoria" : "Favoritos"}
        </NavLink>
      </nav>
      <RegistrarSW />
    </>
  );
}
