import type { ReactNode } from "react";

const caminhos: Record<string, ReactNode> = {
  inicio: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  biblioteca: (
    <>
      <path d="M4 4h4v16H4zM10 4h4v16h-4z" />
      <path d="m16 5 3.8-1 3 15.5-3.8 1z" />
    </>
  ),
  coluna: (
    <>
      <path d="M4 21h16M5 18h14M6 6h12M5 3h14l-1 3H6z" />
      <path d="M8 6v12M12 6v12M16 6v12" />
    </>
  ),
  agenda: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  estrela: <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />,
  sino: (
    <>
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  engrenagem: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10 5-3v10l-5-3z" />
    </>
  ),
  slides: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M12 16v4M8 20h8M7 9h6M7 12h4" />
    </>
  ),
  pdf: (
    <>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h5M8 13h8M8 17h5" />
    </>
  ),
  resumo: (
    <>
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  caso: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  artigo: (
    <>
      <path d="M4 5h11v15H4z" />
      <path d="M15 8h5v12H6" />
      <path d="M7 9h5M7 12h5M7 15h3" />
    </>
  ),
  simulado: (
    <>
      <path d="M9 4h6v3H9z" />
      <path d="M7 5H5v16h14V5h-2" />
      <path d="m9 13 2 2 4-4" />
    </>
  ),
  outro: (
    <>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  busca: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  pasta: <path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />,
  voltar: <path d="M15 5l-7 7 7 7" />,
  externo: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  baixar: (
    <>
      <path d="M12 4v11M7 10l5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),
  mais: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  tela: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  presenca: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </>
  ),
};

export function Icone({ nome, titulo }: { nome: keyof typeof caminhos | string; titulo?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={titulo ? undefined : true}
      role={titulo ? "img" : undefined}
    >
      {titulo ? <title>{titulo}</title> : null}
      {caminhos[nome] ?? caminhos.outro}
    </svg>
  );
}

export function iconeDoTipo(tipo: string) {
  return tipo === "aula" ? "video" : tipo;
}
