-- Esquema para el clon demo de Coinbase (Pre-lan)
-- Entorno SIMULADO: sin dinero real. España / EUR.

create table if not exists public.portfolios (
  user_id uuid primary key references auth.users (id) on delete cascade,
  cash_eur numeric not null default 10000,
  holdings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  coin_id text not null,
  symbol text not null,
  side text not null check (side in ('buy', 'sell', 'deposit', 'withdraw')),
  amount numeric not null,
  price_eur numeric not null,
  value_eur numeric not null,
  created_at timestamptz not null default now ()
);

create index if not exists trades_user_idx on public.trades (user_id, created_at desc);

-- KYC simulado (demo): el usuario debe verificar identidad antes de operar.
create table if not exists public.kyc (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'none' check (status in ('none', 'pending', 'verified')),
  full_name text,
  document_type text,
  document_number text,
  country text default 'ES',
  submitted_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now ()
);

alter table public.kyc enable row level security;

create policy "ver propio kyc" on public.kyc
  for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

alter table public.portfolios enable row level security;
alter table public.trades enable row level security;

create policy "ver propia cartera" on public.portfolios
  for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

create policy "ver propias operaciones" on public.trades
  for all using (auth.uid () = user_id) with check (auth.uid () = user_id);
