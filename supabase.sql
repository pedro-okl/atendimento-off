create extension if not exists "pgcrypto";

create table if not exists public.atendimentos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique,
  nome_atendido text not null,
  descricao text not null,
  atendimento_em timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.atendimentos
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists client_id uuid,
  add column if not exists nome_atendido text,
  add column if not exists descricao text,
  add column if not exists atendimento_em timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$
declare
  id_type text;
  id_default text;
begin
  select data_type, column_default
  into id_type, id_default
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'atendimentos'
    and column_name = 'id';

  if id_type = 'uuid' then
    update public.atendimentos
    set id = gen_random_uuid()
    where id is null;

    alter table public.atendimentos
      alter column id set default gen_random_uuid(),
      alter column id set not null;
  elsif id_type in ('integer', 'bigint', 'smallint') and id_default is null then
    execute 'create sequence if not exists public.atendimentos_id_seq owned by public.atendimentos.id';
    execute 'select setval(''public.atendimentos_id_seq'', coalesce((select max(id)::bigint from public.atendimentos), 0) + 1, false)';
    execute 'update public.atendimentos set id = nextval(''public.atendimentos_id_seq'') where id is null';
    execute 'alter table public.atendimentos alter column id set default nextval(''public.atendimentos_id_seq'')';
    execute 'alter table public.atendimentos alter column id set not null';
  end if;
end $$;

update public.atendimentos
set client_id = gen_random_uuid()
where client_id is null;

update public.atendimentos
set
  nome_atendido = coalesce(nullif(trim(nome_atendido), ''), 'Atendido sem nome'),
  descricao = coalesce(nullif(trim(descricao), ''), 'Registro antigo sem descricao.'),
  atendimento_em = coalesce(atendimento_em, now()),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now())
where
  nome_atendido is null
  or trim(nome_atendido) = ''
  or descricao is null
  or trim(descricao) = ''
  or atendimento_em is null
  or created_at is null
  or updated_at is null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'atendimentos'
      and column_name = 'nome'
  ) then
    update public.atendimentos
    set nome = coalesce(nullif(trim(nome), ''), nome_atendido, 'Atendido sem nome')
    where nome is null or trim(nome) = '';

    alter table public.atendimentos
      alter column nome set default 'Atendido sem nome';
  end if;
end $$;

do $$
declare
  data_hora_type text;
begin
  select data_type
  into data_hora_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'atendimentos'
    and column_name = 'data_hora';

  if data_hora_type in ('timestamp with time zone', 'timestamp without time zone') then
    update public.atendimentos
    set data_hora = coalesce(data_hora, atendimento_em, now())
    where data_hora is null;

    alter table public.atendimentos
      alter column data_hora set default now();
  elsif data_hora_type = 'date' then
    update public.atendimentos
    set data_hora = coalesce(data_hora, atendimento_em::date, current_date)
    where data_hora is null;

    alter table public.atendimentos
      alter column data_hora set default current_date;
  elsif data_hora_type in ('text', 'character varying', 'character') then
    update public.atendimentos
    set data_hora = coalesce(nullif(trim(data_hora), ''), atendimento_em::text, now()::text)
    where data_hora is null or trim(data_hora) = '';

    alter table public.atendimentos
      alter column data_hora set default now()::text;
  end if;
end $$;

alter table public.atendimentos
  alter column client_id set not null,
  alter column nome_atendido set not null,
  alter column descricao set not null,
  alter column atendimento_em set not null,
  alter column created_at set default now(),
  alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'atendimentos_client_id_key'
      and conrelid = 'public.atendimentos'::regclass
  ) then
    alter table public.atendimentos
      add constraint atendimentos_client_id_key unique (client_id);
  end if;
end $$;

alter table public.atendimentos enable row level security;

drop policy if exists "Permitir leitura anonima de atendimentos" on public.atendimentos;
drop policy if exists "Permitir insercao anonima de atendimentos" on public.atendimentos;
drop policy if exists "Permitir atualizacao anonima de atendimentos" on public.atendimentos;

create policy "Permitir leitura anonima de atendimentos"
on public.atendimentos
for select
to anon
using (true);

create policy "Permitir insercao anonima de atendimentos"
on public.atendimentos
for insert
to anon
with check (true);

create policy "Permitir atualizacao anonima de atendimentos"
on public.atendimentos
for update
to anon
using (true)
with check (true);
