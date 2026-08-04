-- Agenda Cultural autoadministrable.
-- Migración aditiva e idempotente: conserva las columnas y filas existentes.
-- Ejecutar manualmente en Supabase SQL Editor antes de desplegar la aplicación.

begin;

-- 1. Los banners existentes pasan a representar períodos editoriales.
alter table public.agenda_banners
  add column if not exists status text not null default 'draft',
  add column if not exists title_es text,
  add column if not exists title_en text,
  add column if not exists desktop_image_url_es text,
  add column if not exists desktop_image_url_en text,
  add column if not exists mobile_image_url_es text,
  add column if not exists mobile_image_url_en text,
  add column if not exists alt_es text,
  add column if not exists alt_en text,
  add column if not exists href_es text,
  add column if not exists href_en text;

alter table public.agenda_banners
  drop constraint if exists agenda_banners_status_check;

alter table public.agenda_banners
  add constraint agenda_banners_status_check
  check (status in ('draft', 'published'));

alter table public.agenda_banners
  drop constraint if exists agenda_banners_period_dates_check;

alter table public.agenda_banners
  add constraint agenda_banners_period_dates_check
  check (period_start <= period_end);

-- Conserva los assets anteriores como fallback ES.
update public.agenda_banners
set
  desktop_image_url_es = coalesce(desktop_image_url_es, desktop_image_url),
  mobile_image_url_es = coalesce(mobile_image_url_es, mobile_image_url),
  title_es = coalesce(title_es, label),
  alt_es = coalesce(alt_es, label),
  href_es = coalesce(href_es, '/agenda-cultural'),
  href_en = coalesce(href_en, '/agenda-cultural'),
  status = case when active then 'published' else 'draft' end
where desktop_image_url_es is null
   or mobile_image_url_es is null
   or title_es is null
   or alt_es is null
   or href_es is null
   or href_en is null;

create index if not exists agenda_banners_publication_window_idx
  on public.agenda_banners (site, status, active, period_start, period_end, sort_order);

-- 2. Las asignaciones se vinculan de forma segura al post, conservando el slug legado.
alter table public.agenda_assignments
  add column if not exists post_id uuid;

update public.agenda_assignments assignment
set post_id = post.id
from public.posts post
where assignment.post_id is null
  and assignment.post_slug = post.slug;

alter table public.agenda_assignments
  drop constraint if exists agenda_assignments_post_id_fkey;

alter table public.agenda_assignments
  add constraint agenda_assignments_post_id_fkey
  foreign key (post_id) references public.posts(id) on delete cascade;

alter table public.agenda_assignments
  drop constraint if exists agenda_assignments_dates_check;

alter table public.agenda_assignments
  add constraint agenda_assignments_dates_check
  check (start_date is null or end_date is null or start_date <= end_date);

create index if not exists agenda_assignments_visibility_idx
  on public.agenda_assignments (site, active, start_date, end_date, sort_order);

create index if not exists agenda_assignments_post_id_idx
  on public.agenda_assignments (post_id);

-- 3. Los destacados viven en slots independientes para conservar historial y programación futura.
create table if not exists public.agenda_featured_slots (
  id bigint generated always as identity primary key,
  site text not null,
  post_id uuid references public.posts(id) on delete cascade,
  post_slug text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  start_date date,
  end_date date,
  desktop_image_url_es text,
  desktop_image_url_en text,
  mobile_image_url_es text,
  mobile_image_url_en text,
  alt_es text,
  alt_en text,
  href_es text,
  href_en text,
  sort_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint agenda_featured_slots_dates_check check (
    start_date is null or end_date is null or start_date <= end_date
  )
);

create index if not exists agenda_featured_slots_visibility_idx
  on public.agenda_featured_slots (site, status, start_date, end_date, sort_order);

create index if not exists agenda_featured_slots_post_id_idx
  on public.agenda_featured_slots (post_id);

-- 4. Semilla inicial: replica la configuración que vivía en
-- lib/agenda-banner-ranges.ts y app/categoria/[slug]/page.tsx.
-- Después de esta migración, el endpoint usa estas filas y no reglas de código.
with seed_banners(period_start, period_end, desktop_image_url, mobile_image_url, alt, sort_order) as (
  values
    ('2026-02-23'::date, '2026-03-08'::date, '/bannersagenda/BANNER DESKTOP AGENDA 2 AL 8.png', '/bannersagenda/BANNER MOVIL AGENDA 2 AL 8.png', 'Agenda Cultural del 2 al 8 de marzo', 10),
    ('2026-03-09', '2026-03-15', '/bannersagenda/BANNER DESKTOP AGENDA 9 AL 15.png', '/bannersagenda/BANNER MOVIL AGENDA 9 AL 15.png', 'Agenda Cultural del 9 al 15 de marzo', 20),
    ('2026-03-16', '2026-03-22', '/bannersagenda/BANNER DESKTOP AGENDA 16 AL 22.png', '/bannersagenda/BANNER MOVIL AGENDA 16 AL 22.png', 'Agenda Cultural del 16 al 22 de marzo', 30),
    ('2026-03-23', '2026-03-29', '/bannersagenda/BANNER DESKTOP AGENDA 23 AL 29.png', '/bannersagenda/BANNER MOVIL AGENDA 23 AL 29.png', 'Agenda Cultural del 23 al 29 de marzo', 40),
    ('2026-03-30', '2026-04-05', '/bannersagenda/BANNER DESKTOP AGENDA 30 AL 5 DE ABRIL.png', '/bannersagenda/BANNER MOVIL AGENDA 30 AL 5 DE ABRIL.png', 'Agenda Cultural del 30 de marzo al 5 de abril', 50),
    ('2026-04-06', '2026-04-12', '/bannersagenda/BANNER DESKTOP AGENDA 6 AL 12 DE ABRIL.png', '/bannersagenda/BANNER MOVIL AGENDA 6 AL 12 DE ABRIL.png', 'Agenda Cultural del 6 al 12 de abril', 60),
    ('2026-04-13', '2026-04-19', '/bannersagenda/BANNER DESKTOP AGENDA 13 AL 19 DE ABRIL.png', '/bannersagenda/BANNER MOVIL AGENDA 13 AL 19 DE ABRIL.png', 'Agenda Cultural del 13 al 19 de abril', 70),
    ('2026-04-20', '2026-04-26', '/bannersagenda/BANNER DESKTOP AGENDA 20 AL 26 DE ABRIL.png', '/bannersagenda/BANNER MOVIL AGENDA 20 AL 26 DE ABRIL.png', 'Agenda Cultural del 20 al 26 de abril', 80),
    ('2026-04-27', '2026-05-03', '/bannersagenda/BANNER DESKTOP AGENDA 27 AL 3  DE MAYO.png', '/bannersagenda/BANNER MOVIL AGENDA 27 AL 3  DE MAYO.png', 'Agenda Cultural del 27 de abril al 3 de mayo', 90),
    ('2026-05-04', '2026-05-10', '/bannersagenda/DESKTOP AGENDA 4 AL 10 DE MAYO.png', '/bannersagenda/MOVIL AGENDA 4 AL 10 DE MAYO.png', 'Agenda Cultural del 4 al 10 de mayo', 100),
    ('2026-05-11', '2026-05-17', '/bannersagenda/DESKTOP AGENDA 11 AL 17 DE MAYO.png', '/bannersagenda/MOVIL AGENDA 11 AL 17 DE MAYO.png', 'Agenda Cultural del 11 al 17 de mayo', 110),
    ('2026-05-18', '2026-05-24', '/bannersagenda/DESKTOP AGENDA 18 AL 24 DE MAYO.png', '/bannersagenda/MOVIL AGENDA 18 AL 24 DE MAYO.png', 'Agenda Cultural del 18 al 24 de mayo', 120),
    ('2026-05-25', '2026-05-31', '/bannersagenda/DESKTOP AGENDA 25 AL 31 DE MAYO.png', '/bannersagenda/MOVIL AGENDA 25 AL 31 DE MAYO.png', 'Agenda Cultural del 25 al 31 de mayo', 130),
    ('2026-06-01', '2026-06-07', '/bannersagenda/DESKTOP AGENDA 1 AL 7 DE JUNIO.png', '/bannersagenda/MOVIL AGENDA 1 AL 7 DE JUNIO.png', 'Agenda Cultural del 1 al 7 de junio', 140),
    ('2026-06-08', '2026-06-14', '/bannersagenda/DESKTOP AGENDA 8 AL 14 DE JUNIO.png', '/bannersagenda/MOVIL AGENDA 8 AL 14 DE JUNIO.png', 'Agenda Cultural del 8 al 14 de junio', 150),
    ('2026-06-15', '2026-06-21', '/bannersagenda/JUNIO/DESKTOP - 15 AL 21 DE JUNIO.png', '/bannersagenda/JUNIO/MOVIL -15 AL 21 DE JUNIO.png', 'Agenda Cultural del 15 al 21 de junio', 160),
    ('2026-06-22', '2026-06-28', '/bannersagenda/JUNIO/DESKTOP - 22 AL 28 DE JUNIO.png', '/bannersagenda/JUNIO/MOVIL - 22 AL 28 DE JUNIO.png', 'Agenda Cultural del 22 al 28 de junio', 170),
    ('2026-06-29', '2026-07-05', '/bannersagenda/JUNIO/DESKTOP - 29 DE JUNIO AL 05 DE JULIO.png', '/bannersagenda/JUNIO/MOVIL - 29 DE JUNIO AL 05 DE JULIO.png', 'Agenda Cultural del 29 de junio al 5 de julio', 180),
    ('2026-07-06', '2026-07-12', '/bannersagenda/JULIO/DESKTOP - 6 AL 12 DE JULIO.png', '/bannersagenda/JULIO/MOVIL - 6 AL 12 DE JULIO.png', 'Agenda Cultural del 6 al 12 de julio', 190),
    ('2026-07-13', '2026-07-19', '/bannersagenda/JULIO/DESKTOP - 13 AL 19 DE JULIO.png', '/bannersagenda/JULIO/MOVIL - 13 AL 19 DE JULIO.png', 'Agenda Cultural del 13 al 19 de julio', 200),
    ('2026-07-20', '2026-07-26', '/bannersagenda/JULIO/DESKTOP - 20 AL 26 DE JULIO.png', '/bannersagenda/JULIO/MOVIL - 20 AL 26 DE JULIO.png', 'Agenda Cultural del 20 al 26 de julio', 210),
    ('2026-07-27', '2026-08-02', '/bannersagenda/JULIO/DESKTOP - 27 DE JULIO AL 2 DE AGOSTO.png', '/bannersagenda/JULIO/MOVIL - 27 DE JULIO AL 2 DE AGOSTO.png', 'Agenda Cultural del 27 de julio al 2 de agosto', 220),
    ('2026-08-03', '2026-08-09', '/bannersagenda/AGOSTO/DESKTOP - 3 AL 9 DE AGOSTO.webp', '/bannersagenda/AGOSTO/MOVIL - 3 AL 9 DE AGOSTO.webp', 'Agenda Cultural del 3 al 9 de agosto', 230),
    ('2026-08-10', '2026-08-16', '/bannersagenda/AGOSTO/DESKTOP - 10 AL 16 DE AGOSTO.webp', '/bannersagenda/AGOSTO/MOVIL - 10 AL 16 DE AGOSTO.webp', 'Agenda Cultural del 10 al 16 de agosto', 240),
    ('2026-08-17', '2026-08-23', '/bannersagenda/AGOSTO/DESKTOP - 17 AL 23 DE AGOSTO.webp', '/bannersagenda/AGOSTO/MOVIL - 17 AL 23 DE AGOSTO.webp', 'Agenda Cultural del 17 al 23 de agosto', 250),
    ('2026-08-24', '2026-08-30', '/bannersagenda/AGOSTO/DESKTOP - 24 AL 30 DE AGOSTO.webp', '/bannersagenda/AGOSTO/MOVIL - 24 AL 30 DE AGOSTO.webp', 'Agenda Cultural del 24 al 30 de agosto', 260),
    ('2026-08-31', '2026-09-06', '/bannersagenda/AGOSTO/DESKTOP - 31 DE AGOSTO AL 6  DE SEPTIEMBRE.webp', '/bannersagenda/AGOSTO/MOVIL - 31 DE AGOSTO AL 6 DE SEPTIEMBRE.webp', 'Agenda Cultural del 31 de agosto al 6 de septiembre', 270),
    ('2026-09-07', '2026-09-13', '/bannersagenda/SEPTIEMBRE/DESKTOP - 7 AL 13 DE SEPTIEMBRE.webp', '/bannersagenda/SEPTIEMBRE/MOVIL - 7 AL 13 DE SEPTIEMBRE.webp', 'Agenda Cultural del 7 al 13 de septiembre', 280),
    ('2026-09-14', '2026-09-20', '/bannersagenda/SEPTIEMBRE/DESKTOP - 14 AL 20 DE SEPTIEMBRE.webp', '/bannersagenda/SEPTIEMBRE/MOVIL - 14 AL 20 DE SEPTIEMBRE.webp', 'Agenda Cultural del 14 al 20 de septiembre', 290),
    ('2026-09-21', '2026-09-27', '/bannersagenda/SEPTIEMBRE/DESKTOP - 21 AL 27 DE SEPTIEMBRE.webp', '/bannersagenda/SEPTIEMBRE/MOVIL - 21 AL 27 DE SEPTIEMBRE.webp', 'Agenda Cultural del 21 al 27 de septiembre', 300),
    ('2026-09-28', '2026-10-04', '/bannersagenda/SEPTIEMBRE/DESKTOP - 28 DE SEPTIEMBRE AL 4 DE OCTUBRE.webp', '/bannersagenda/SEPTIEMBRE/MOVIL - 28 DE SEPTIEMBRE AL 4 DE OCTUBRE.webp', 'Agenda Cultural del 28 de septiembre al 4 de octubre', 310)
), seed_sites(site) as (
  select 'santiagoadicto'::text
  union
  select 'chileadicto'::text
)
insert into public.agenda_banners (
  site, label, period_start, period_end, desktop_image_url, mobile_image_url,
  desktop_image_url_es, mobile_image_url_es, alt_es, href_es, href_en,
  sort_order, active, status
)
select
  seed_sites.site, seed_banners.alt, seed_banners.period_start, seed_banners.period_end,
  seed_banners.desktop_image_url, seed_banners.mobile_image_url,
  seed_banners.desktop_image_url, seed_banners.mobile_image_url,
  seed_banners.alt, '/agenda-cultural', '/agenda-cultural',
  seed_banners.sort_order, true, 'published'
from seed_banners
cross join seed_sites
where not exists (
  select 1 from public.agenda_banners existing
  where existing.site = seed_sites.site
    and existing.period_start = seed_banners.period_start
    and existing.period_end = seed_banners.period_end
);

-- Posts simples: la vista estática los ubicaba según publish_start_at (o publish_end_at).
insert into public.agenda_assignments (
  site, post_id, post_slug, start_date, end_date, sort_order, active
)
select distinct
  post.site,
  post.id,
  post.slug,
  coalesce(post.publish_start_at, post.publish_end_at)::date,
  coalesce(post.publish_start_at, post.publish_end_at)::date,
  0,
  true
from public.posts post
where coalesce(post.publish_start_at, post.publish_end_at) is not null
  and (
    exists (
      select 1
      from public.post_translations translation
      where translation.post_id = post.id
        and lower(coalesce(translation.category, '')) in ('agenda cultural', 'agenda-cultural')
    )
    or exists (
      select 1
      from public.post_category_map category_map
      join public.categories category on category.id = category_map.category_id
      where category_map.post_id = post.id
        and lower(category.slug) = 'agenda-cultural'
    )
  )
  and not exists (
    select 1 from public.agenda_assignments existing
    where existing.site = post.site
      and existing.post_slug = post.slug
      and existing.start_date is not distinct from coalesce(post.publish_start_at, post.publish_end_at)::date
      and existing.end_date is not distinct from coalesce(post.publish_start_at, post.publish_end_at)::date
  );

-- Eventos que la configuración estática repetía durante más de un período.
with seed_assignments(post_slug, start_date, end_date) as (
  values
    ('ciclo-especial-mes-de-la-danza-en-matucana-100', '2026-04-01'::date, '2026-04-30'::date),
    ('artes-visuales-enter-to-the-exit-de-fabiola-morcillo', '2026-04-01'::date, '2026-04-30'::date),
    ('artes-visuales-arte-radrigan-la-pintura-consumada', '2026-05-08'::date, '2026-06-04'::date),
    ('artes-visuales-naturalia-de-gonzalo-pedraza', '2026-05-08'::date, '2026-05-17'::date),
    ('teatro-musical-amores-de-cantina-de-juan-radrigan', '2026-05-07'::date, '2026-05-17'::date),
    ('teatro-musical-pretty-woman-el-musical', '2026-05-06'::date, '2026-06-14'::date),
    ('cine-estreno-de-masters-of-the-universe', '2026-06-01'::date, '2026-06-30'::date),
    ('cine-estreno-de-backrooms-sin-salida', '2026-06-01'::date, '2026-06-30'::date),
    ('teatro-ciclo-repertorio-de-lafamiliateatro-en-matucana-100', '2026-06-01'::date, '2026-06-28'::date),
    ('tendencias-y-entretenimiento-almas-perdidas-vr-inmersivo', '2026-06-01'::date, '2026-07-18'::date),
    ('teatro-velocirraptors-en-centro-cultural-gam', '2026-06-01'::date, '2026-07-12'::date),
    ('teatro-musical-shrek-el-musical-en-centro-cultural-ceina', '2026-06-01'::date, '2026-07-05'::date),
    ('teatro-el-dylan-en-centro-cultural-gam', '2026-06-01'::date, '2026-07-05'::date),
    ('danza-de-una-luz-a-otra-del-banch-en-las-condes', '2026-06-01'::date, '2026-07-12'::date),
    ('bernardo-oyarzun-reactiva-el-archivo-de-teleseries-en-instituto-tele-arte', '2026-07-01'::date, '2026-07-31'::date),
    ('teatro-y-territorio-la-obra-maulina-cuervos-de-pantano-llega-con-su-viaje-escenico-a-santiago', '2026-07-06'::date, '2026-07-20'::date),
    ('teatro-y-memoria-la-compania-la-pieza-oscura-estrena-la-version-teatral-de-la-dimension-desconocida', '2026-07-06'::date, '2026-07-27'::date),
    ('artes-visuales-y-nuevos-medios-el-cclm-celebra-20-anos-con-la-muestra-interactiva-vivir-el-archivo', '2026-07-13'::date, '2026-11-02'::date),
    ('teatro-y-objetos-marionetas-de-tamano-real-dan-vida-a-reloj-viejo-de-pared', '2026-07-21'::date, '2026-08-03'::date),
    ('grandes-espectaculos-e-ilusionismo-jean-paul-olhaberry-lidera-el-debut-presencial-del-festival-pata-de-cabra', '2026-07-06'::date, '2026-07-19'::date),
    ('artes-visuales-y-entorno-urbano-pedro-lomboy-tombo-expande-el-lenguaje-del-graffiti-en-galeria-cima', '2026-07-06'::date, '2026-08-02'::date),
    ('tendencias-y-urbanismo-las-condes-y-street-machine-presentan-invierno-magico-la-gran-cumbre-de-entretenimiento-familiar', '2026-07-06'::date, '2026-08-09'::date),
    ('danza-contemporanea-gam-estrena-majamama-una-radiografia-al-brillo-y-la-resistencia-colonial-latina', '2026-07-21'::date, '2026-07-27'::date),
    ('artes-visuales-y-patrimonio-natalia-montoya-transforma-la-galeria-gabriela-mistral-en-un-territorio-andino-con-radiacion-ocre', '2026-07-20'::date, '2026-08-03'::date),
    ('artes-escenicas-sofia-rodriguez-estrena-automata-comedia-negra-de-ciencia-ficcion-sobre-la-obsolescencia-humana', '2026-07-23'::date, '2026-08-02'::date),
    ('raul-riquelme-estrena-la-comedia-acida-cerdo', '2026-07-27'::date, '2026-08-09'::date),
    ('cine-y-ciencia-ficcion-ridley-scott-estrena-el-thriller-postapocaliptico-la-guerra-de-los-ultimos-en-salas-del-pais', '2026-09-03'::date, '2026-09-06'::date),
    ('periodismo-de-investigacion-memoria-y-sonoridad-podium-podcast-y-gam-estrenan-la-serie-documental-prenderse-fuego-las-voces-de-pedro-lemebel', '2026-09-03'::date, '2026-09-06'::date),
    ('artes-escenicas-y-vanguardia-teatro-viajeinmovil-reinterpreta-a-shakespeare-y-euripides-con-marionetas-y-teatro-de-objetos', '2026-09-03'::date, '2026-09-06'::date),
    ('la-oreja-de-van-gogh-el-reencuentro-mas-esperado-llega-a-chile-con-amaia-montero', '2026-09-03'::date, '2027-03-28'::date),
    ('musica-conciertos-e-hits-historicos-illya-kuryaki-the-valderramas-confirma-sideshow-de-regreso-en-gran-arena-monticello', '2026-09-03'::date, '2026-11-13'::date),
    ('musica-grandes-estadios-y-rock-clasico-def-leppard-agendan-show-en-el-movistar-arena-con-su-gira-live-2026', '2026-09-03'::date, '2026-11-08'::date),
    ('bienestar-deporte-y-comunidad-corporacion-yo-mujer-abre-inscripciones-para-la-17-corrida-por-la-vida-en-el-parque-bicentenario', '2026-09-03'::date, '2026-10-25'::date),
    ('festivales-y-cultura-bavara-oktoberfest-munich-malloco-desvela-su-lineup-con-los-vasquez-candelabro-y-zillertal-orchester', '2026-09-03'::date, '2026-10-11'::date),
    ('artes-visuales-y-patrimonio-natalia-montoya-transforma-la-galeria-gabriela-mistral-en-un-territorio-andino-con-radiacion-ocre', '2026-08-03'::date, '2026-08-30'::date),
    ('musica-y-teatro-fisico-carlos-casella-y-alejandra-radano-estrenan-el-concierto-teatral-tester-en-el-ceina', '2026-09-28'::date, '2026-10-04'::date),
    ('lotus-y-juanes-presentan-la-edicion-inaugural-del-festival-bamba-en-el-parque-o-higgins', '2026-09-27'::date, '2026-10-31'::date),
    ('iron-maiden-celebra-50-anos-con-dos-fechas-consecutivas-en-el-estadio-nacional', '2026-09-27'::date, '2026-10-31'::date)
)
insert into public.agenda_assignments (
  site, post_id, post_slug, start_date, end_date, sort_order, active
)
select
  post.site, post.id, seed_assignments.post_slug,
  seed_assignments.start_date, seed_assignments.end_date, -10, true
from seed_assignments
join public.posts post on post.slug = seed_assignments.post_slug
where not exists (
  select 1 from public.agenda_assignments existing
  where existing.site is not distinct from post.site
    and existing.post_slug = seed_assignments.post_slug
    and existing.start_date = seed_assignments.start_date
    and existing.end_date = seed_assignments.end_date
);

-- Copia el destacado existente solo cuando todavía no exista un slot equivalente.
insert into public.agenda_featured_slots (
  site,
  post_id,
  post_slug,
  status,
  start_date,
  end_date,
  desktop_image_url_es,
  mobile_image_url_es,
  alt_es,
  href_es
)
select
  settings.site,
  post.id,
  settings.featured_post_slug,
  'published',
  settings.featured_start_date,
  settings.featured_end_date,
  settings.featured_desktop_banner,
  settings.featured_mobile_banner,
  'Evento destacado',
  '/' || settings.featured_post_slug
from public.agenda_settings settings
left join public.posts post on post.slug = settings.featured_post_slug
where nullif(trim(settings.featured_post_slug), '') is not null
  and not exists (
    select 1
    from public.agenda_featured_slots slot
    where slot.site = settings.site
      and slot.post_slug = settings.featured_post_slug
      and slot.start_date is not distinct from settings.featured_start_date
      and slot.end_date is not distinct from settings.featured_end_date
  );

-- 5. Lectura pública, escritura solo desde Service Role mediante las APIs del servidor.
alter table public.agenda_banners enable row level security;
alter table public.agenda_assignments enable row level security;
alter table public.agenda_settings enable row level security;
alter table public.agenda_featured_slots enable row level security;

drop policy if exists public_read_agenda_banners on public.agenda_banners;
drop policy if exists public_read_agenda_assignments on public.agenda_assignments;
drop policy if exists public_read_agenda_settings on public.agenda_settings;
drop policy if exists public_read_agenda_featured_slots on public.agenda_featured_slots;

create policy public_read_agenda_banners
on public.agenda_banners
for select
to anon, authenticated
using (active = true and status = 'published');

create policy public_read_agenda_assignments
on public.agenda_assignments
for select
to anon, authenticated
using (active = true);

create policy public_read_agenda_settings
on public.agenda_settings
for select
to anon, authenticated
using (true);

create policy public_read_agenda_featured_slots
on public.agenda_featured_slots
for select
to anon, authenticated
using (status = 'published');

commit;