-- Crear tabla public.media (no existe aún) + columna site.
-- Seguro: solo crea objetos nuevos, no borra nada.

begin;

create table if not exists public.media (
  id bigserial primary key,
  url text not null,
  site text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unicidad por URL (el API usa on_conflict=url)
create unique index if not exists media_url_uidx on public.media (url);

create index if not exists media_site_idx on public.media (site);
create index if not exists media_created_at_idx on public.media (created_at desc);

-- Permisos básicos para anon/authenticated (lectura) y service role escribe igual
grant select on public.media to anon, authenticated;
grant all on public.media to service_role;
grant usage, select on sequence public.media_id_seq to service_role;

commit;

-- Verificación:
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'media'
order by ordinal_position;
