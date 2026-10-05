-- Actualiza SOLO los sliders móviles de restaurantes con las imágenes nuevas.
-- Carpeta: public/slider restos movil
-- NO modifica restaurants-desktop-es ni restaurants-desktop-en.
-- Se cargan para ambos sitios.
-- Ejecutar completo en Supabase SQL Editor.

begin;

delete from public.sliders
where site in ('santiagoadicto', 'chileadicto')
  and set_key in ('restaurants-mobile-es', 'restaurants-mobile-en');

with sites(site) as (
  values ('santiagoadicto'), ('chileadicto')
),
slides(image_url, href, position) as (
  values
    ('/slider restos movil/AMBROSIA-🇪🇸.webp', '/ambrosia-restaurante-bistro-dos-versiones-de-un-gran-concepto', 1),
    ('/slider restos movil/BORAGO-🇪🇸.webp', '/borago-un-viaje-a-la-esencia-de-chile', 2),
    ('/slider restos movil/CARLOTO-🇪🇸.webp', '/carloto', 3),
    ('/slider restos movil/CASA ASA-🇪🇸.webp', '/casa-asa-el-arte-de-la-parrilla-y-el-precio-justo', 4),
    ('/slider restos movil/CHIUSO RISTORANTE-🇪🇸.webp', '/chiuso-ristorante', 5),
    ('/slider restos movil/CORA BISTRO-🇪🇸.webp', '/cora-bistro-oda-a-la-cocina-chilena', 6),
    ('/slider restos movil/DEBAINES-🇪🇸.webp', '/copper-room-y-gran-cafe-hotel-debaines-homenajes-necesarios', 7),
    ('/slider restos movil/FIERO-🇪🇸.webp', '/fiero-revalorizacion-del-producto-y-memoria-gastronomica', 8),
    ('/slider restos movil/FUKASAWA-🇪🇸.webp', '/fukasawa-esencia-japonesa', 9),
    ('/slider restos movil/JRONIMO-1.webp', '/jeronimo-cocina-del-mundo', 10),
    ('/slider restos movil/KARAI-🇪🇸.webp', '/karai-el-sello-del-mejor-del-mundo', 11),
    ('/slider restos movil/KATO-1.webp', '/kato-experiencia-asiatica-con-actitud', 12),
    ('/slider restos movil/PIEGARI-🇪🇸.webp', '/piegari-el-preciso-arte-de-la-comida-italiana', 13),
    ('/slider restos movil/PULPERIA-🇪🇸.webp', '/pulperia-santa-elvira-una-joya-de-matta-sur', 14),
    ('/slider restos movil/TANAKA-🇪🇸.webp', '/tanaka-la-fusion-redefinida', 15),
    ('/slider restos movil/THE LOFT-🇪🇸.webp', '/the-loft', 16),
    ('/slider restos movil/YUM CHA-🇪🇸.webp', '/yum-cha-comer-y-beber-con-te', 17),
    ('/slider restos movil/CARRER NOU-1.webp', '/carrer-nou-la-honesta-esquina-catalana', 18)
)
insert into public.sliders (set_key, site, image_url, href, position, active, lang)
select 'restaurants-mobile-es', sites.site, slides.image_url, slides.href, slides.position, true, 'es'
from sites cross join slides;

with sites(site) as (
  values ('santiagoadicto'), ('chileadicto')
),
slides(image_url, href, position) as (
  values
    ('/slider restos movil/AMBROSIA-🇺🇸.webp', '/ambrosia-restaurante-bistro-dos-versiones-de-un-gran-concepto', 1),
    ('/slider restos movil/BORAGO-🇺🇸.webp', '/borago-un-viaje-a-la-esencia-de-chile', 2),
    ('/slider restos movil/CARLOTO-🇺🇸.webp', '/carloto', 3),
    ('/slider restos movil/CASA ASA-🇺🇸.webp', '/casa-asa-el-arte-de-la-parrilla-y-el-precio-justo', 4),
    ('/slider restos movil/CHIUSO RISTORANTE-🇺🇸.webp', '/chiuso-ristorante', 5),
    ('/slider restos movil/CORA BISTRO-🇺🇸.webp', '/cora-bistro-oda-a-la-cocina-chilena', 6),
    ('/slider restos movil/DEBAINES-🇺🇸.webp', '/copper-room-y-gran-cafe-hotel-debaines-homenajes-necesarios', 7),
    ('/slider restos movil/FIERO-🇺🇸.webp', '/fiero-revalorizacion-del-producto-y-memoria-gastronomica', 8),
    ('/slider restos movil/FUKASAWA-🇺🇸.webp', '/fukasawa-esencia-japonesa', 9),
    ('/slider restos movil/JRONIMO-2.webp', '/jeronimo-cocina-del-mundo', 10),
    ('/slider restos movil/KARAI-🇺🇸.webp', '/karai-el-sello-del-mejor-del-mundo', 11),
    ('/slider restos movil/KATO-2.webp', '/kato-experiencia-asiatica-con-actitud', 12),
    ('/slider restos movil/PIEGARI-🇺🇸.webp', '/piegari-el-preciso-arte-de-la-comida-italiana', 13),
    ('/slider restos movil/PULPERIA-🇺🇸.webp', '/pulperia-santa-elvira-una-joya-de-matta-sur', 14),
    ('/slider restos movil/TANAKA-🇺🇸.webp', '/tanaka-la-fusion-redefinida', 15),
    ('/slider restos movil/THE LOFT-🇺🇸.webp', '/the-loft', 16),
    ('/slider restos movil/YUM CHA-🇺🇸.webp', '/yum-cha-comer-y-beber-con-te', 17),
    ('/slider restos movil/CARRER NOU-2.webp', '/carrer-nou-la-honesta-esquina-catalana', 18)
)
insert into public.sliders (set_key, site, image_url, href, position, active, lang)
select 'restaurants-mobile-en', sites.site, slides.image_url, slides.href, slides.position, true, 'en'
from sites cross join slides;

commit;

select site, set_key, lang, count(*) as slides,
       min(position) as primera_posicion,
       max(position) as ultima_posicion
from public.sliders
where site in ('santiagoadicto', 'chileadicto')
  and set_key in ('restaurants-mobile-es', 'restaurants-mobile-en')
group by site, set_key, lang
order by site, set_key;
