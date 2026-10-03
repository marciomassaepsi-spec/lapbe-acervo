-- Acervo LAPBE — estrutura do banco
-- Rode este arquivo inteiro no SQL Editor do Supabase (uma vez).

-- ============================================================
-- Funções de acesso
-- ============================================================

create or replace function public.email_atual()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

-- ============================================================
-- Membros (lista de quem pode entrar)
-- ============================================================

create table public.membros (
  email       text primary key check (email = lower(email)),
  nome        text not null default '',
  papel       text not null default 'ligante' check (papel in ('ligante', 'diretoria')),
  turma       text,
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now()
);

create or replace function public.eh_membro()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.membros where email = public.email_atual() and ativo
  )
$$;

create or replace function public.eh_diretoria()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.membros
    where email = public.email_atual() and ativo and papel = 'diretoria'
  )
$$;

-- ============================================================
-- Conteúdo
-- ============================================================

create table public.eixos (
  id          bigint generated always as identity primary key,
  nome        text not null,
  descricao   text,
  ordem       int not null default 0
);

create table public.encontros (
  id                uuid primary key default gen_random_uuid(),
  numero            int,
  semestre          text not null,
  titulo            text not null,
  data              date not null,
  hora              text,
  local             text,
  eixo_id           bigint references public.eixos(id) on delete set null,
  apresentador      text,
  youtube_id        text,
  duracao_min       int,
  capitulos         jsonb not null default '[]'::jsonb,
  mensagem_central  text,
  resumo            text,
  caso_clinico      text,
  referencias       text,
  leitura_previa    text,
  destaque          boolean not null default false,
  publicado         boolean not null default true,
  criado_em         timestamptz not null default now()
);
create index encontros_data_idx on public.encontros (data desc);

create table public.materiais (
  id                uuid primary key default gen_random_uuid(),
  titulo            text not null,
  tipo              text not null check (tipo in ('slides', 'resumo', 'artigo', 'caso', 'simulado', 'outro')),
  descricao         text,
  drive_file_id     text,
  drive_mime        text,
  link_url          text,
  encontro_id       uuid references public.encontros(id) on delete set null,
  eixo_id           bigint references public.eixos(id) on delete set null,
  nivel_evidencia   text,
  referencia_apa    text,
  paginas           int,
  destaque          boolean not null default false,
  publicado         boolean not null default true,
  criado_em         timestamptz not null default now(),
  check (drive_file_id is not null or link_url is not null)
);
create index materiais_criado_idx on public.materiais (criado_em desc);
create index materiais_encontro_idx on public.materiais (encontro_id);
create index materiais_drive_idx on public.materiais (drive_file_id);

create table public.avisos (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  corpo       text not null default '',
  autor       text,
  fixado      boolean not null default false,
  criado_em   timestamptz not null default now()
);

-- ============================================================
-- Dados de cada ligante
-- ============================================================

create table public.progresso (
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_tipo      text not null check (item_tipo in ('encontro', 'material')),
  item_id        uuid not null,
  percentual     int not null default 0 check (percentual between 0 and 100),
  posicao        int not null default 0,
  concluido      boolean not null default false,
  atualizado_em  timestamptz not null default now(),
  primary key (user_id, item_tipo, item_id)
);

create table public.favoritos (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_tipo   text not null check (item_tipo in ('encontro', 'material')),
  item_id     uuid not null,
  criado_em   timestamptz not null default now(),
  primary key (user_id, item_tipo, item_id)
);

-- ============================================================
-- Presença
-- ============================================================

create table public.presencas (
  encontro_id    uuid not null references public.encontros(id) on delete cascade,
  email          text not null references public.membros(email) on delete cascade on update cascade,
  origem         text not null default 'codigo' check (origem in ('codigo', 'manual')),
  registrado_em  timestamptz not null default now(),
  primary key (encontro_id, email)
);

create table public.presenca_codigos (
  encontro_id  uuid primary key references public.encontros(id) on delete cascade,
  codigo       text not null,
  expira_em    timestamptz not null
);

-- Ligante registra a própria presença com o código do dia.
create or replace function public.registrar_presenca(p_codigo text)
returns table (id_encontro uuid, titulo_encontro text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_encontro uuid;
begin
  if not public.eh_membro() then
    raise exception 'acesso negado';
  end if;

  select c.encontro_id into v_encontro
  from public.presenca_codigos c
  where c.codigo = trim(p_codigo) and c.expira_em > now()
  limit 1;

  if v_encontro is null then
    raise exception 'codigo invalido';
  end if;

  insert into public.presencas (encontro_id, email, origem)
  values (v_encontro, public.email_atual(), 'codigo')
  on conflict do nothing;

  return query select e.id, e.titulo from public.encontros e where e.id = v_encontro;
end;
$$;

-- ============================================================
-- Regras de acesso (RLS)
-- ============================================================

alter table public.membros          enable row level security;
alter table public.eixos            enable row level security;
alter table public.encontros        enable row level security;
alter table public.materiais        enable row level security;
alter table public.avisos           enable row level security;
alter table public.progresso        enable row level security;
alter table public.favoritos        enable row level security;
alter table public.presencas        enable row level security;
alter table public.presenca_codigos enable row level security;

-- membros: cada um vê a própria linha; diretoria vê e edita todas
create policy membros_ver on public.membros for select
  using (email = public.email_atual() or public.eh_diretoria());
create policy membros_editar on public.membros for all
  using (public.eh_diretoria()) with check (public.eh_diretoria());

-- conteúdo: membros leem o que está publicado; diretoria faz tudo
create policy eixos_ver on public.eixos for select using (public.eh_membro());
create policy eixos_editar on public.eixos for all
  using (public.eh_diretoria()) with check (public.eh_diretoria());

create policy encontros_ver on public.encontros for select
  using (public.eh_membro() and (publicado or public.eh_diretoria()));
create policy encontros_editar on public.encontros for all
  using (public.eh_diretoria()) with check (public.eh_diretoria());

create policy materiais_ver on public.materiais for select
  using (public.eh_membro() and (publicado or public.eh_diretoria()));
create policy materiais_editar on public.materiais for all
  using (public.eh_diretoria()) with check (public.eh_diretoria());

create policy avisos_ver on public.avisos for select using (public.eh_membro());
create policy avisos_editar on public.avisos for all
  using (public.eh_diretoria()) with check (public.eh_diretoria());

-- progresso e favoritos: cada um só mexe nos seus
create policy progresso_proprio on public.progresso for all
  using (user_id = auth.uid() and public.eh_membro())
  with check (user_id = auth.uid() and public.eh_membro());

create policy favoritos_proprio on public.favoritos for all
  using (user_id = auth.uid() and public.eh_membro())
  with check (user_id = auth.uid() and public.eh_membro());

-- presença: ligante vê a própria; diretoria vê e corrige todas
create policy presencas_ver on public.presencas for select
  using (email = public.email_atual() or public.eh_diretoria());
create policy presencas_editar on public.presencas for all
  using (public.eh_diretoria()) with check (public.eh_diretoria());

create policy codigos_diretoria on public.presenca_codigos for all
  using (public.eh_diretoria()) with check (public.eh_diretoria());

-- permissões para usuários logados
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.eh_membro(), public.eh_diretoria(), public.email_atual(),
  public.registrar_presenca(text) to authenticated;
revoke all on all tables in schema public from anon;
