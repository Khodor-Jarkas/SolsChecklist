-- Migration: enforce private profiles at the database level.
--
-- Until now `is_private` only hid the collection in the UI: user_auras and
-- user_achievements were readable by anyone (`using (true)`), so a private
-- user's collection could still be fetched straight from the API. Now a row
-- is readable only by its owner, or by anyone when the owner's profile is
-- public.
--
-- `(select auth.uid())` is evaluated once per query instead of once per row.
-- profiles.id is the primary key, so the lookup is an index hit.
--
-- Idempotent. Run in the Supabase SQL editor.

drop policy if exists "user_auras public select"        on public.user_auras;
drop policy if exists "user_auras visible select"       on public.user_auras;
create policy "user_auras visible select"
  on public.user_auras for select
  using (
    user_id = (select auth.uid())
    or not exists (
      select 1 from public.profiles p
      where p.id = user_auras.user_id and p.is_private
    )
  );

drop policy if exists "user_achievements public select" on public.user_achievements;
drop policy if exists "user_achievements visible select" on public.user_achievements;
create policy "user_achievements visible select"
  on public.user_achievements for select
  using (
    user_id = (select auth.uid())
    or not exists (
      select 1 from public.profiles p
      where p.id = user_achievements.user_id and p.is_private
    )
  );
