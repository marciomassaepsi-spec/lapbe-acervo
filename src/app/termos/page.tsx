import type { Metadata } from "next";
import { contato, PaginaPublica } from "@/components/PaginaPublica";

export const metadata: Metadata = { title: "Termos de Uso", robots: { index: true, follow: true } };

export default function Termos() {
  const email = contato();
  return (
    <PaginaPublica titulo="Termos de Uso" atualizado="3 de outubro de 2026">
      <p>
        Estes termos valem para o <strong>Acervo LAPBE</strong>, o site de materiais de estudo da Liga Acadêmica de Psicologia
        Baseada em Evidências da UNIME Anhanguera. Ao entrar no site, você concorda com eles.
      </p>

      <h2>Quem pode usar</h2>
      <p>
        O acesso é exclusivo para membros da liga cadastrados pela diretoria. A conta é pessoal: não compartilhe seu acesso. A
        diretoria pode remover o acesso de quem deixar a liga ou descumprir estes termos.
      </p>

      <h2>Uso dos materiais</h2>
      <ul>
        <li>Os materiais servem para estudo dos membros da liga.</li>
        <li>
          Não redistribua aulas, slides, resumos ou simulados fora da liga sem autorização da diretoria e de quem produziu o
          material.
        </li>
        <li>
          Artigos científicos pertencem aos seus autores e editoras. Eles aparecem no acervo apenas para discussão acadêmica
          dentro da liga.
        </li>
        <li>Os vídeos são publicados como &quot;não listados&quot; no YouTube. Não divulgue os links fora da liga.</li>
      </ul>

      <h2>Conteúdo clínico</h2>
      <p>
        Os casos clínicos são fictícios ou anonimizados e têm finalidade exclusivamente educacional. O conteúdo do acervo não
        substitui supervisão clínica, avaliação profissional nem as orientações do Conselho Federal de Psicologia.
      </p>

      <h2>Presença</h2>
      <p>
        O código de presença é registrado apenas por quem está no encontro. Registrar presença para outra pessoa, ou sem estar
        presente, é uma falta às regras da liga.
      </p>

      <h2>Disponibilidade</h2>
      <p>
        O site é mantido voluntariamente pela diretoria, sem custo para os membros. Ele pode ficar fora do ar em alguns momentos
        e pode mudar sem aviso prévio.
      </p>

      <h2>Privacidade</h2>
      <p>
        O uso dos seus dados está descrito na <a href="/privacidade">Política de Privacidade</a>.
      </p>

      <h2>Contato</h2>
      <p>
        {email ? (
          <>
            Dúvidas sobre estes termos: <a href={`mailto:${email}`}>{email}</a>.
          </>
        ) : (
          "Dúvidas sobre estes termos: fale com a diretoria da LAPBE pelos canais oficiais da liga."
        )}
      </p>
    </PaginaPublica>
  );
}
