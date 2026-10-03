-- Rode depois de 0001_estrutura.sql.
-- 1) Troque o e-mail e o nome abaixo pelos seus (o mesmo e-mail Google que você usa para entrar).
insert into public.membros (email, nome, papel)
values (lower('SEU-EMAIL@gmail.com'), 'Seu nome', 'diretoria');

-- 2) Eixos temáticos iniciais (edite ou apague depois pelo painel da diretoria).
insert into public.eixos (nome, ordem) values
  ('Fundamentos da PBE', 1),
  ('Intervenções baseadas em evidência', 2),
  ('Prática clínica', 3),
  ('Avaliação e psicometria', 4),
  ('Pesquisa e leitura crítica', 5);
