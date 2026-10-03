import { NextResponse } from "next/server";
import { listarEncontros, listarMembros, todasPresencas } from "@/lib/dados";
import { dataCurta, hoje } from "@/lib/formato";
import { obterSessao } from "@/lib/sessao";

/** Planilha de frequência: uma linha por membro, uma coluna por encontro já realizado. */
export async function GET() {
  const sessao = await obterSessao();
  if (sessao?.membro.papel !== "diretoria") return NextResponse.json({ erro: "Somente a diretoria." }, { status: 403 });

  const [encontros, membros, presencas] = await Promise.all([listarEncontros(), listarMembros(), todasPresencas()]);
  const hj = hoje();
  const realizados = encontros.filter((e) => e.data <= hj).sort((a, b) => a.data.localeCompare(b.data));
  const marcou = new Set(presencas.map((p) => `${p.encontro_id}|${p.email}`));
  const cel = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

  const cabecalho = ["Nome", "E-mail", "Papel", "Turma", ...realizados.map((e) => `${e.numero ? `E${e.numero} ` : ""}${dataCurta(e.data)}`), "Presenças", "%"];
  const linhas = membros
    .filter((m) => m.ativo)
    .map((m) => {
      const marcas = realizados.map((e) => (marcou.has(`${e.id}|${m.email}`) ? "P" : "F"));
      const total = marcas.filter((x) => x === "P").length;
      return [m.nome, m.email, m.papel, m.turma ?? "", ...marcas, total, realizados.length ? Math.round((total / realizados.length) * 100) : 0];
    });

  // BOM + ponto e vírgula: abre certo no Excel em português.
  const csv = "﻿" + [cabecalho, ...linhas].map((l) => l.map(cel).join(";")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="frequencia-lapbe-${hj}.csv"`,
    },
  });
}
