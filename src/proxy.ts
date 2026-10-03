import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { atualizarSessao } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (process.env.LAPBE_DEMO === "1") return NextResponse.next();
  return atualizarSessao(request);
}

export const config = {
  matcher: [
    // Tudo, menos arquivos estáticos, ícones, manifesto e o worker do leitor de PDF.
    "/((?!_next/static|_next/image|icon|apple-icon|manifest.webmanifest|logo.webp|icone-|pdf.worker|sw.js).*)",
  ],
};
