-- Additive migration — safe to run against the live database.
-- Adds the fields captured during onboarding, plus the metabolic baseline
-- (BMR/TDEE) computed at the end of it. Existing users get NULLs and will
-- be shown the onboarding wizard on their next visit.

alter table public.profiles
  -- Null until the wizard is finished; this is what gates the modal.
  add column if not exists onboarding_completed_at timestamptz,

  -- Step 3 — goals
  add column if not exists primary_goal text,
  add column if not exists target_weight_kg numeric,
  -- Signed: negative = losing that many kg/week, positive = gaining.
  add column if not exists weekly_rate_kg numeric,

  -- Step 4 — diet (skippable)
  add column if not exists dietary_pattern text,
  add column if not exists allergies text[] not null default '{}',

  -- Step 5 — wearable (skippable, mocked for now)
  add column if not exists wearable text,

  -- Step 6 — preferences
  add column if not exists tracking_style text,
  add column if not exists reminders_enabled boolean not null default false,

  -- Remembered so height/weight are shown back in the unit they were entered.
  add column if not exists height_unit text not null default 'cm',
  add column if not exists weight_unit text not null default 'kg',

  -- Computed baseline (Mifflin-St Jeor). Stored rather than derived on every
  -- render so the dashboard can show it without re-deriving from raw inputs.
  add column if not exists bmr numeric,
  add column if not exists tdee numeric;

alter table public.profiles drop constraint if exists profiles_height_unit_check;
alter table public.profiles
  add constraint profiles_height_unit_check check (height_unit in ('cm', 'ft'));

alter table public.profiles drop constraint if exists profiles_weight_unit_check;
alter table public.profiles
  add constraint profiles_weight_unit_check check (weight_unit in ('kg', 'lb'));
