import { NextResponse, type NextRequest } from "next/server";
import { materialPorId } from "@/lib/dados";
import { baixar, driveConfigurado, metadados } from "@/lib/drive";
import { pdfDemo } from "@/lib/pdf-demo";
import { modoDemo, obterSessao } from "@/lib/sessao";

/**
 * Entrega um arquivo do Drive só para membros e só se ele estiver cadastrado como material.
 * Assim o link do Drive nunca aparece para quem usa o app.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/arquivo/[id]">) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Acesso restrito a membros da liga." }, { status: 401 });

  const { id } = await ctx.params;
  const material = await materialPorId(id);
  if (!material?.drive_file_id) return NextResponse.json({ erro: "Arquivo não encontrado." }, { status: 404 });

  const baixarArquivo = request.nextUrl.searchParams.has("baixar");
  const nomeSeguro = material.titulo.replace(/[^\p{L}\p{N} ._()-]/gu, "").slice(0, 120) || "arquivo";

  if (modoDemo()) {
    return new NextResponse(Buffer.from(pdfDemo(material.titulo, material.paginas ? Math.min(material.paginas, 6) : 4)), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${baixarArquivo ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(nomeSeguro)}.pdf`,
      },
    });
  }

  if (!driveConfigurado()) {
    return NextResponse.json({ erro: "O acesso ao Google Drive ainda não foi configurado." }, { status: 503 });
  }

  const info = await metadados(material.drive_file_id);
  if (!info) return NextResponse.json({ erro: "O arquivo não está acessível no Drive." }, { status: 404 });

  try {
    const { corpo, mime } = await baixar(info);
    const extensao = mime === "application/pdf" ? ".pdf" : (info.name.match(/\.[\w]+$/)?.[0] ?? "");
    const nome = nomeSeguro.endsWith(extensao) ? nomeSeguro : nomeSeguro + extensao;
    return new NextResponse(corpo, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `${baixarArquivo ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(nome)}`,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ erro: "Não foi possível buscar o arquivo no Drive." }, { status: 502 });
  }
}
