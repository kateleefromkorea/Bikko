-- Additive migration — safe to run against the live database.
-- Adds per-item food logging without touching any existing table.

create table if not exists public.food_log_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  meal text not null check (meal in ('breakfast','lunch','dinner','snacks')),
  name text not null,
  grams numeric not null,
  calories_per_100g numeric not null,
  calories numeric not null
);

alter table public.food_log_items enable row level security;

drop policy if exists "food_log_items are self-owned" on public.food_log_items;
create policy "food_log_items are self-owned" on public.food_log_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
