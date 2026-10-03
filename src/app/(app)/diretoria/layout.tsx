import { MarcaCelular } from "@/components/MarcaCelular";
import { NavLink } from "@/components/NavLink";
import { exigirDiretoria } from "@/lib/sessao";

export default async function LayoutDiretoria({ children }: LayoutProps<"/diretoria">) {
  await exigirDiretoria();
  return (
    <div className="screen">
      <MarcaCelular />
      <header className="page-head">
        <span className="eyebrow">Somente diretoria</span>
        <h1>Painel da diretoria</h1>
      </header>
      <nav className="dir-nav" aria-label="Seções do painel">
        <NavLink href="/diretoria" exato>
          Visão geral
        </NavLink>
        <NavLink href="/diretoria/encontros">Encontros</NavLink>
        <NavLink href="/diretoria/materiais">Materiais</NavLink>
        <NavLink href="/diretoria/presenca">Presença</NavLink>
        <NavLink href="/diretoria/membros">Membros</NavLink>
        <NavLink href="/diretoria/avisos">Mural</NavLink>
        <NavLink href="/diretoria/eixos">Eixos</NavLink>
      </nav>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>{children}</div>
    </div>
  );
}
