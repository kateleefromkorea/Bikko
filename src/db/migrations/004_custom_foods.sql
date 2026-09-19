-- Additive migration — safe to run against the live database.
-- Stores foods the user entered manually so they can be reused later
-- instead of re-typing the calories every time.

create table if not exists public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  calories_per_100g numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.custom_foods enable row level security;

drop policy if exists "custom_foods are self-owned" on public.custom_foods;
create policy "custom_foods are self-owned" on public.custom_foods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
