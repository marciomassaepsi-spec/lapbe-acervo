import type { Metadata } from "next";
import { contato, PaginaPublica } from "@/components/PaginaPublica";

export const metadata: Metadata = { title: "Política de Privacidade", robots: { index: true, follow: true } };

export default function Privacidade() {
  const email = contato();
  return (
    <PaginaPublica titulo="Política de Privacidade" atualizado="3 de outubro de 2026">
      <p>
        O <strong>Acervo LAPBE</strong> é o site de materiais de estudo da Liga Acadêmica de Psicologia Baseada em Evidências
        (LAPBE) da UNIME Anhanguera. Esta política explica quais dados pessoais o site usa, para quê e quais são os seus
        direitos, de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).
      </p>

      <h2>Quem é responsável pelos dados</h2>
      <p>
        A diretoria da LAPBE é a controladora dos dados tratados no site.
        {email ? (
          <>
            {" "}
            Para qualquer assunto sobre seus dados, escreva para <a href={`mailto:${email}`}>{email}</a>.
          </>
        ) : (
          " Para qualquer assunto sobre seus dados, fale com a diretoria da liga pelos canais oficiais da LAPBE."
        )}
      </p>

      <h2>Quais dados usamos</h2>
      <ul>
        <li>
          <strong>Dados da sua conta Google</strong>, recebidos quando você entra: nome, endereço de e-mail e foto de perfil.
          O site não acessa seu Gmail, seu Google Drive, seus contatos nem qualquer outro dado da sua conta Google.
        </li>
        <li>
          <strong>Cadastro de membro</strong>, feito pela diretoria: nome, e-mail, turma e papel (ligante ou diretoria).
        </li>
        <li>
          <strong>Uso do acervo</strong>: quais aulas e materiais você marcou como vistos, até onde assistiu ou leu e quais
          itens favoritou.
        </li>
        <li>
          <strong>Presença</strong>: os encontros em que sua presença foi registrada, com data e hora.
        </li>
        <li>
          <strong>Dados técnicos</strong>: cookies de sessão, necessários para manter você conectado, e registros de acesso
          gerados automaticamente pelos serviços de hospedagem.
        </li>
      </ul>
      <p>O site não usa cookies de publicidade nem ferramentas de rastreamento de terceiros.</p>

      <h2>Para que usamos</h2>
      <ul>
        <li>Confirmar que você é membro da liga e liberar o acesso aos materiais.</li>
        <li>Mostrar seu progresso, seus favoritos e de onde continuar.</li>
        <li>Controlar a frequência nos encontros, conforme as regras da liga.</li>
        <li>Manter o site seguro e funcionando.</li>
      </ul>
      <p>
        A base legal é o legítimo interesse da liga em organizar suas atividades acadêmicas e o seu consentimento ao entrar no
        site como membro (art. 7º, incisos I e IX, da LGPD).
      </p>

      <h2>Com quem compartilhamos</h2>
      <p>Não vendemos nem compartilhamos seus dados para fins comerciais. Eles ficam guardados em serviços que operam o site:</p>
      <ul>
        <li>
          <strong>Supabase</strong>: banco de dados e login.
        </li>
        <li>
          <strong>Vercel</strong>: hospedagem do site.
        </li>
        <li>
          <strong>Google</strong>: login com conta Google, armazenamento dos arquivos (Google Drive) e vídeos (YouTube).
        </li>
      </ul>
      <p>
        Esses serviços podem guardar dados fora do Brasil, com as garantias previstas em seus próprios termos. Dentro da liga,
        só a diretoria vê a lista de membros e a frequência de todos. Cada ligante vê apenas os próprios dados.
      </p>

      <h2>Por quanto tempo guardamos</h2>
      <p>
        Enquanto você for membro da liga. Quando você sai, a diretoria remove seu acesso. O histórico de frequência pode ser
        mantido para emissão de certificados e declarações de participação, e é apagado a pedido quando não for mais necessário.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir, a qualquer momento, para confirmar quais dados temos sobre você, acessá-los, corrigi-los, levá-los para
        outro serviço ou apagá-los, além de revogar seu consentimento (art. 18 da LGPD). Basta falar com a diretoria. Você também
        pode remover o acesso do site à sua conta Google em{" "}
        <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">
          myaccount.google.com/connections
        </a>
        .
      </p>

      <h2>Casos clínicos</h2>
      <p>
        Os casos clínicos publicados no acervo são fictícios ou totalmente anonimizados. O site não deve receber dados que
        identifiquem pacientes.
      </p>

      <h2>Mudanças nesta política</h2>
      <p>Se esta política mudar, a data no topo da página será atualizada e os membros serão avisados pelo mural do site.</p>
    </PaginaPublica>
  );
}
