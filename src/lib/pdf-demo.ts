/** Gera um PDF simples para o modo demonstração (sem precisar do Google Drive). */
export function pdfDemo(titulo: string, totalPaginas = 4): Uint8Array {
  const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const linhas = quebrar(titulo, 44);
  const objetos: string[] = [];
  const paginasIds: number[] = [];

  objetos[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objetos[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>";
  objetos[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";

  let prox = 5;
  for (let n = 1; n <= totalPaginas; n++) {
    const pagina = prox++;
    const conteudo = prox++;
    paginasIds.push(pagina);
    const texto = [
      "0.04 0.09 0.21 rg 0 535 842 60 re f",
      "0.08 0.34 0.9 rg 48 120 6 300 re f",
      "BT 1 1 1 rg /F2 11 Tf 48 558 Td (LAPBE  -  Liga Academica de Psicologia Baseada em Evidencias) Tj ET",
      ...linhas.map((l, i) => `BT 0.04 0.08 0.19 rg /F1 30 Tf 72 ${390 - i * 36} Td (${esc(l)}) Tj ET`),
      `BT 0.28 0.32 0.44 rg /F2 13 Tf 72 ${360 - linhas.length * 36} Td (Documento de exemplo para o modo demonstracao.) Tj ET`,
      `BT 0.28 0.32 0.44 rg /F2 11 Tf 720 40 Td (${n} / ${totalPaginas}) Tj ET`,
    ].join("\n");
    objetos[pagina] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Contents ${conteudo} 0 R ` +
      "/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>";
    objetos[conteudo] = `<< /Length ${Buffer.byteLength(texto, "latin1")} >>\nstream\n${texto}\nendstream`;
  }
  objetos[2] = `<< /Type /Pages /Kids [${paginasIds.map((i) => `${i} 0 R`).join(" ")}] /Count ${totalPaginas} >>`;

  let saida = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let i = 1; i < objetos.length; i++) {
    offsets[i] = Buffer.byteLength(saida, "latin1");
    saida += `${i} 0 obj\n${objetos[i]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(saida, "latin1");
  saida += `xref\n0 ${objetos.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objetos.length; i++) saida += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  saida += `trailer\n<< /Size ${objetos.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Uint8Array(Buffer.from(saida, "latin1"));
}

function quebrar(texto: string, largura: number) {
  const linhas: string[] = [];
  let atual = "";
  for (const palavra of texto.split(/\s+/)) {
    if ((atual + " " + palavra).trim().length > largura) {
      linhas.push(atual.trim());
      atual = palavra;
    } else atual += " " + palavra;
  }
  if (atual.trim()) linhas.push(atual.trim());
  return linhas.slice(0, 4);
}
