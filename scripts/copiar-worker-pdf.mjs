// Copia o worker do pdf.js (versão "legacy", compatível com navegadores mais antigos) para /public, para o leitor de PDF funcionar em qualquer navegador.
import { copyFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const origem = require.resolve("pdfjs-dist/legacy/build/pdf.worker.min.mjs");
copyFileSync(origem, new URL("../public/pdf.worker.min.mjs", import.meta.url));
