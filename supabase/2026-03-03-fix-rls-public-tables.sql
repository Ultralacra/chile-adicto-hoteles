-- Fix Supabase Security Advisor: rls_disabled_in_public
-- Tables affected:
--   public.post_useful_info
--   public.communes
--   public.post_communes
--   public.sliders
--
-- Goal:
--   1) Enable RLS in exposed tables.
--   2) Allow only read access for anon/authenticated.
--   3) Keep write operations only through service role (server-side).

begin;

-- 1) Enable RLS
alter table if exists public.post_useful_info enable row level security;
alter table if exists public.communes enable row level security;
alter table if exists public.post_communes enable row level security;
alter table if exists public.sliders enable row level security;

-- 2) Remove old broad policies if they exist
-- post_useful_info
drop policy if exists "public_read_post_useful_info" on public.post_useful_info;
-- communes
drop policy if exists "public_read_communes" on public.communes;
-- post_communes
drop policy if exists "public_read_post_communes" on public.post_communes;
-- sliders
drop policy if exists "public_read_sliders" on public.sliders;

-- 3) Re-create safe read-only policies for public APIs
create policy "public_read_post_useful_info"
on public.post_useful_info
for select
to anon, authenticated
using (true);

create policy "public_read_communes"
on public.communes
for select
to anon, authenticated
using (true);

create policy "public_read_post_communes"
on public.post_communes
for select
to anon, authenticated
using (true);

create policy "public_read_sliders"
on public.sliders
for select
to anon, authenticated
using (true);

commit;
