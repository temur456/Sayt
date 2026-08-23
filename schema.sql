-- ============================================================
-- Daftar.uz — Supabase sxemasi
-- Supabase loyihangizda: SQL Editor -> New query -> shu faylni
-- to'liq nusxalab joylashtiring -> Run tugmasini bosing.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- QARZDORLAR (sizga qarz bo'lganlar) ----------
create table if not exists debtors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  amount numeric not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- MENING QARZIM (siz qarz bo'lgan odamlar) ----------
create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  amount numeric not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- ESLATMALAR ----------
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- ---------- YAKUNLANGAN KUNLAR (Daromad tarixi, oxirgi 31 kun) ----------
create table if not exists income_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  products jsonb not null default '[]',
  daromad numeric not null default 0,
  foyda numeric not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- HOZIRGI OCHIQ KUN (har bir userda faqat bitta qator) ----------
create table if not exists income_current (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  products jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- ---------- ROW LEVEL SECURITY: har kim faqat o'z ma'lumotini ko'radi ----------
alter table debtors enable row level security;
alter table debts enable row level security;
alter table reminders enable row level security;
alter table income_days enable row level security;
alter table income_current enable row level security;

create policy "own rows only - debtors" on debtors
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows only - debts" on debts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows only - reminders" on reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows only - income_days" on income_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows only - income_current" on income_current
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
