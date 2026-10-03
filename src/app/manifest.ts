import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Acervo LAPBE",
    short_name: "LAPBE",
    description: "Aulas, slides, resumos e artigos da Liga Acadêmica de Psicologia Baseada em Evidências.",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f5fa",
    theme_color: "#0a1736",
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
