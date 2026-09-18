-- Additive migration — safe to run against the live database.
-- Adds a time-of-day slot to medications/supplements so they can be
-- organized into a daily schedule (Breakfast / Midday / Night).

alter table public.medications
  add column if not exists time_of_day text not null default 'breakfast';

-- Constrain to the three allowed slots. Re-runnable: drop first so this
-- migration can be applied more than once without erroring.
alter table public.medications drop constraint if exists medications_time_of_day_check;
alter table public.medications
  add constraint medications_time_of_day_check check (time_of_day in ('breakfast', 'midday', 'night'));
