import { NextResponse, type NextRequest } from "next/server";
import { driveConfigurado, listarPasta, type ArquivoDrive } from "@/lib/drive";
import { modoDemo, obterSessao } from "@/lib/sessao";

const EXEMPLO: ArquivoDrive[] = [
  { id: "demo-pasta-2026-2-encontros", name: "2026.2 · Encontros", mimeType: "application/vnd.google-apps.folder" },
  { id: "demo-arquivo-novo1-slides-lapbe", name: "Slides encontro 09 - Ativação comportamental.pdf", mimeType: "application/pdf", size: "3811200" },
  { id: "demo-arquivo-novo2-resumo-lapbe", name: "Resumo encontro 09", mimeType: "application/vnd.google-apps.document" },
  { id: "demo-arquivo-novo3-artigo-lapbe", name: "Dimidjian et al 2006.pdf", mimeType: "application/pdf", size: "1203300" },
];

/** Lista uma pasta do Drive da liga para o painel da diretoria. */
export async function GET(request: NextRequest) {
  const sessao = await obterSessao();
  if (sessao?.membro.papel !== "diretoria") {
    return NextResponse.json({ erro: "Somente a diretoria pode navegar pelo Drive." }, { status: 403 });
  }
  const raiz = process.env.DRIVE_FOLDER_ID ?? "";
  const pasta = request.nextUrl.searchParams.get("pasta") || raiz;

  if (modoDemo()) return NextResponse.json({ raiz: "demo", arquivos: pasta === "demo-pasta-2026-2-encontros" ? EXEMPLO.slice(1) : EXEMPLO });
  if (!driveConfigurado() || !raiz) {
    return NextResponse.json({ erro: "Configure GOOGLE_SERVICE_ACCOUNT_* e DRIVE_FOLDER_ID para listar o Drive." }, { status: 503 });
  }
  try {
    return NextResponse.json({ raiz, arquivos: await listarPasta(pasta) });
  } catch {
    return NextResponse.json({ erro: "Não foi possível ler a pasta. Ela foi compartilhada com a conta de serviço?" }, { status: 502 });
  }
}
