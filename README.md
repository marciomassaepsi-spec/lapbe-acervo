# Acervo LAPBE

Aplicativo web da **Liga Acadêmica de Psicologia Baseada em Evidências (LAPBE) · UNIME Anhanguera**
para os ligantes acessarem aulas gravadas, slides, resumos, artigos discutidos, casos clínicos e simulados.

- Os **arquivos continuam na pasta da liga no Google Drive**. O app lê a pasta com uma conta de serviço
  e mostra os PDFs no leitor interno, sem expor o link do Drive.
- Os **vídeos ficam no YouTube como "não listado"** e tocam dentro da página do encontro.
- **Só membros entram**: login com Google, liberado apenas para os e-mails cadastrados pela diretoria.
- Custo: **R$ 0** (planos gratuitos da Vercel e do Supabase).

## O que o app faz

| Para os ligantes | Para a diretoria |
| --- | --- |
| Tela inicial com próximo encontro, "continue de onde parou", destaques, recentes, mural e agenda | Cadastro de encontros: vídeo, capítulos, mensagem central, resumo, caso clínico e referências |
| Biblioteca com busca por título e filtros por tipo e eixo temático | Publicação de materiais escolhendo o arquivo direto da pasta do Drive |
| Página de cada encontro: vídeo com capítulos, slides, resumo, referências com DOI e caso clínico | Lista de membros: liberar acesso colando e-mails, trocar papel, remover acesso |
| Leitor de PDF que funciona no celular, com zoom e tela cheia | Código de presença de 4 dígitos com validade, lista de presentes e marcação manual |
| Marcar como assistido/lido, progresso salvo automaticamente | Planilha de frequência (CSV que abre no Excel) |
| Favoritos | Mural de avisos (fixar, remover) e eixos temáticos |
| Registro de presença com o código do dia e histórico de frequência | |
| Instalável na tela inicial do celular (PWA) | |

## Ver funcionando sem configurar nada (modo demonstração)

```bash
npm install
npm run demo        # abre em http://localhost:3000 com dados de exemplo
```

No modo demonstração você entra como alguém da diretoria e pode testar tudo. Nada é salvo de verdade:
ao reiniciar, os dados voltam ao exemplo.

## Colocar no ar (passo a passo)

Leva cerca de 40 minutos na primeira vez. Use a mesma conta Google da liga em todos os passos.

### 1. Supabase (login e banco de dados)

1. Crie uma conta em [supabase.com](https://supabase.com) e um projeto novo (plano Free, região São Paulo).
2. Abra **SQL Editor**, cole todo o conteúdo de [`supabase/migrations/0001_estrutura.sql`](supabase/migrations/0001_estrutura.sql) e clique em **Run**.
3. Abra [`supabase/primeiro-acesso.sql`](supabase/primeiro-acesso.sql), **troque o e-mail e o nome pelos seus**, cole no SQL Editor e rode.
   Isso libera você como diretoria e cria os eixos temáticos iniciais.
4. Em **Project Settings → API**, copie a **Project URL** e a **publishable key** (ou anon key).

### 2. Google Cloud (login com Google e acesso ao Drive)

1. Entre em [console.cloud.google.com](https://console.cloud.google.com) e crie um projeto (ex.: `acervo-lapbe`).
2. **Ative a Google Drive API**: menu **APIs e serviços → Biblioteca → Google Drive API → Ativar**.
3. **Tela de consentimento OAuth**: tipo **Externo**, nome "Acervo LAPBE", seu e-mail de suporte. Publique o app
   (status "Em produção") para qualquer conta Google conseguir entrar.
4. **Credenciais → Criar credenciais → ID do cliente OAuth → Aplicativo da Web**.
   Em *URIs de redirecionamento autorizados*, coloque o endereço que o Supabase mostra em
   **Authentication → Sign In / Providers → Google** (algo como `https://SEU-PROJETO.supabase.co/auth/v1/callback`).
5. Copie o **ID do cliente** e a **chave secreta** para o Supabase, em **Authentication → Sign In / Providers → Google**, e ative o provedor.
6. **Conta de serviço** (para ler o Drive): **IAM e administrador → Contas de serviço → Criar**. Não precisa dar papel nenhum.
   Depois, em **Chaves → Adicionar chave → JSON**, baixe o arquivo. Guarde com cuidado: ele dá acesso de leitura aos arquivos compartilhados com ela.

### 3. Compartilhar a pasta da liga com a conta de serviço

No Google Drive, clique com o botão direito na pasta da liga → **Compartilhar** → cole o e-mail da conta de serviço
(`...@...iam.gserviceaccount.com`) como **Leitor**. Desmarque "Notificar pessoas".
O **ID da pasta** é o trecho do link depois de `/folders/`.

Os arquivos **não precisam** ficar públicos. Só a conta de serviço lê a pasta, e o app só entrega um arquivo
para quem está logado e é membro.

### 4. Vercel (hospedagem)

1. Crie uma conta em [vercel.com](https://vercel.com) entrando com o GitHub.
2. **Add New → Project →** escolha o repositório `lapbe-acervo`. O nome do projeto vira o endereço: `lapbe-acervo.vercel.app`
   (dá para trocar para `lapbe` em Settings → Domains, se estiver livre).
3. Em **Environment Variables**, cadastre as variáveis do arquivo [`.env.example`](.env.example):
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_KEY` (passo 1)
   - `GOOGLE_SERVICE_ACCOUNT_JSON` (o conteúdo inteiro do arquivo `.json` da conta de serviço)
   - `DRIVE_FOLDER_ID` (passo 3)
4. Clique em **Deploy**.
5. Volte ao Supabase em **Authentication → URL Configuration**:
   - **Site URL**: `https://lapbe-acervo.vercel.app` (o seu endereço)
   - **Redirect URLs**: `https://lapbe-acervo.vercel.app/auth/callback` e `http://localhost:3000/auth/callback`

Pronto. Entre com sua conta Google, abra **Diretoria → Membros** e libere os e-mails dos ligantes.

## Uso no dia a dia

- **Novo encontro**: Diretoria → Encontros → Novo encontro. Cole o link do YouTube (não listado) e, se quiser,
  os capítulos (`07:05 Título`, um por linha). No resumo, `### ` vira subtítulo e `- ` vira lista.
- **Referências**: uma por linha. Para mostrar o tipo de estudo, termine com ` | Revisão sistemática`. O DOI vira link.
- **Novo material**: Diretoria → Materiais → Novo material → escolha o arquivo na lista da pasta. PDFs, Documentos e
  Apresentações do Google abrem dentro do app. Outros formatos ficam para baixar.
- **Presença**: no dia, Diretoria → Presença → Abrir código → projete o número. Os ligantes digitam em
  *Agenda e presença*. Quem esqueceu pode ser marcado à mão na mesma tela.
- **Casos clínicos**: só fictícios ou anonimizados. O app não deve receber dados que identifiquem pacientes.

## Limites dos planos gratuitos

| Serviço | Limite | Uso previsto (40 pessoas) |
| --- | --- | --- |
| Vercel Hobby | 100 GB de tráfego por mês | ~6 GB (PDFs passam pelo app) |
| Supabase Free | 500 MB de banco | menos de 5 MB |
| Supabase Free | **pausa após 7 dias sem uso** | nas férias, abra o app uma vez por semana ou reative o projeto no painel do Supabase |

Vídeos não contam no limite: eles vêm direto do YouTube.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local   # preencha
npm run dev                  # http://localhost:3000
npm run lint && npm run typecheck && npm run build
```

Estrutura principal:

```
supabase/migrations/   tabelas e regras de acesso (RLS) — toda permissão é checada no banco
src/proxy.ts           manda quem não entrou para /entrar
src/lib/dados.ts       consultas (com dados de exemplo no modo demonstração)
src/lib/drive.ts       leitura da pasta do Drive com a conta de serviço
src/app/(app)/         telas dos ligantes
src/app/(app)/diretoria/  painel da diretoria
src/app/api/arquivo/   entrega os arquivos do Drive só para membros
```

Feito com Next.js 16, Supabase e pdf.js.
