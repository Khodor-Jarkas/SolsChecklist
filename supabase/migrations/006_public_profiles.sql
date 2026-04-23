-- Migration: make user progress tables (user_auras / user_achievements /
-- user_items) publicly readable so anyone can view another user's profile
-- at /u/<username>. Owners still exclusively control INSERT/UPDATE/DELETE.
--
-- Idempotent.

drop policy if exists "user_auras self select"        on public.user_auras;
drop policy if exists "user_ach self select"          on public.user_achievements;
drop policy if exists "user_items self select"        on public.user_items;

create policy "user_auras public select"
  on public.user_auras for select using (true);

create policy "user_achievements public select"
  on public.user_achievements for select using (true);

create policy "user_items public select"
  on public.user_items for select using (true);
