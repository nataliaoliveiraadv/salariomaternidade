-- Rode este script uma vez no Supabase: painel do projeto > SQL Editor > New query > colar > Run

create extension if not exists "pgcrypto";

-- =========================================================
-- Tabela: beneficios (aba "Controle de Benefícios")
-- =========================================================
create table if not exists beneficios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  situacao text not null default 'Em Análise',
  status text default '-',
  tipo text default 'SM Urbano',
  nome text not null,
  cpf text,
  data_parto date,
  data_der date,
  data_concessao date,
  data_inicio_pagamento date,
  dia_util_pagamento int,
  data_cessacao date,
  qtd_parcelas int,
  valor_beneficio numeric,
  valor_honorarios numeric,
  data_pagamento date,
  observacoes text,
  created_at timestamptz not null default now()
);

alter table beneficios enable row level security;

create policy "beneficios_select_own" on beneficios
  for select using (auth.uid() = user_id);
create policy "beneficios_insert_own" on beneficios
  for insert with check (auth.uid() = user_id);
create policy "beneficios_update_own" on beneficios
  for update using (auth.uid() = user_id);
create policy "beneficios_delete_own" on beneficios
  for delete using (auth.uid() = user_id);

-- =========================================================
-- Tabela: partos_futuros (aba "Partos Futuros")
-- =========================================================
create table if not exists partos_futuros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome text not null,
  contato text,
  tipo text default 'SM Urbano',
  status text default 'Lead',
  dpp date,
  situacao text default 'Pré-parto',
  observacao text,
  created_at timestamptz not null default now()
);

alter table partos_futuros enable row level security;

create policy "partos_select_own" on partos_futuros
  for select using (auth.uid() = user_id);
create policy "partos_insert_own" on partos_futuros
  for insert with check (auth.uid() = user_id);
create policy "partos_update_own" on partos_futuros
  for update using (auth.uid() = user_id);
create policy "partos_delete_own" on partos_futuros
  for delete using (auth.uid() = user_id);

-- Com o RLS acima, cada escritório/cliente autenticado só enxerga e só
-- consegue alterar as próprias linhas — o isolamento fica garantido pelo
-- próprio banco de dados, não pelo código do app.
