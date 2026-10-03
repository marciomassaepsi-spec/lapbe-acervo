import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="screen" style={{ padding: "64px 16px", maxWidth: 560, textAlign: "center", alignItems: "center" }}>
      <span className="eyebrow">Erro 404</span>
      <h1 style={{ fontSize: 36, fontWeight: 400 }}>Página não encontrada</h1>
      <p className="muted">O endereço pode ter mudado, ou o material foi removido pela diretoria.</p>
      <Link className="btn primary" href="/">
        Voltar ao início
      </Link>
    </div>
  );
}
