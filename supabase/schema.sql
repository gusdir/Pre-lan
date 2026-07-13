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

-- ============================================================================
-- ON-RAMP REAL (Fase 2): acreditacion de saldo via webhook server-side
-- ============================================================================

-- Mapeo wallet (direccion de deposito) -> usuario. En produccion cada usuario
-- debe tener su propia wallet real (p.ej. CDP Server Wallet), no una comun.
create table if not exists public.wallets (
  wallet_address text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now ()
);

alter table public.wallets enable row level security;

create policy "ver propia wallet" on public.wallets
  for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

-- Acredita un deposito real del on-ramp. Solo la invoca el webhook (seguridad).
-- Calcula el coste medio y actualiza holdings + registra el movimiento.
create or replace function public.credit_deposit(
  p_user_id uuid,
  p_coin_id text,
  p_symbol text,
  p_amount numeric,
  p_avg_cost_eur numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cur numeric := 0;
  cur_cost numeric := 0;
  new_amt numeric;
  new_cost numeric;
begin
  -- Asegura la fila de cartera (sin dar saldo demo si ya existe).
  insert into public.portfolios (user_id, cash_eur, holdings)
  values (p_user_id, 0, '{}'::jsonb)
  on conflict (user_id) do nothing;

  select coalesce((holdings -> p_coin_id ->> 'amount')::numeric, 0),
         coalesce((holdings -> p_coin_id ->> 'avg_cost_eur')::numeric, 0)
  into cur, cur_cost
  from public.portfolios
  where user_id = p_user_id;

  new_amt = cur + p_amount;
  if new_amt > 0 then
    new_cost = (cur * cur_cost + p_amount * p_avg_cost_eur) / new_amt;
  else
    new_cost = 0;
  end if;

  update public.portfolios
  set holdings = jsonb_set(
        coalesce(holdings, '{}'::jsonb),
        array[p_coin_id],
        jsonb_build_object(
          'coin_id', p_coin_id,
          'symbol', p_symbol,
          'amount', new_amt,
          'avg_cost_eur', new_cost
        )
      ),
      updated_at = now()
  where user_id = p_user_id;

  insert into public.trades (user_id, coin_id, symbol, side, amount, price_eur, value_eur)
  values (p_user_id, p_coin_id, p_symbol, 'deposit', p_amount, p_avg_cost_eur, p_amount * p_avg_cost_eur);
end;
$$;
