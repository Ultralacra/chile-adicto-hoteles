-- Actualiza SOLO los sliders móviles de restaurantes.
-- NO modifica restaurants-desktop-es ni restaurants-desktop-en.
-- Site: santiagoadicto
-- Ejecutar completo en Supabase SQL Editor.

begin;

delete from public.sliders
where site = 'santiagoadicto'
  and set_key in ('restaurants-mobile-es', 'restaurants-mobile-en');

-- Español
insert into public.sliders (set_key, site, image_url, href, position, active, lang) values
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/AMBROSIA-🇪🇸.webp', '/ambrosia-restaurante-bistro-dos-versiones-de-un-gran-concepto', 1, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/BORAGO-🇪🇸.webp', '/borago-un-viaje-a-la-esencia-de-chile', 2, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/CARLOTO-🇪🇸.webp', '/carloto', 3, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/CASA ASA-🇪🇸.webp', '/casa-asa-el-arte-de-la-parrilla-y-el-precio-justo', 4, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/CHIUSO RISTORANTE-🇪🇸.webp', '/chiuso-ristorante', 5, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/CORA BISTRO-🇪🇸.webp', '/cora-bistro-oda-a-la-cocina-chilena', 6, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/DEBAINES-🇪🇸.webp', '/copper-room-y-gran-cafe-hotel-debaines-homenajes-necesarios', 7, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/FIERO-🇪🇸.webp', '/fiero-revalorizacion-del-producto-y-memoria-gastronomica', 8, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/FUKASAWA-🇪🇸.webp', '/fukasawa-esencia-japonesa', 9, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/JRONIMO-1.webp', '/jeronimo-cocina-del-mundo', 10, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/KARAI-🇪🇸.webp', '/karai-el-sello-del-mejor-del-mundo', 11, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/KATO-1.webp', '/kato-experiencia-asiatica-con-actitud', 12, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/PIEGARI-🇪🇸.webp', '/piegari-el-preciso-arte-de-la-comida-italiana', 13, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/PULPERIA-🇪🇸.webp', '/pulperia-santa-elvira-una-joya-de-matta-sur', 14, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/TANAKA-🇪🇸.webp', '/tanaka-la-fusion-redefinida', 15, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/CARRER NOU-1.webp', '/carrer-nou-la-honesta-esquina-catalana', 16, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/THE LOFT-🇪🇸.webp', '/the-loft', 17, true, 'es'),
('restaurants-mobile-es', 'santiagoadicto', '/banner nuevos restos/YUM CHA-🇪🇸.webp', '/yum-cha-comer-y-beber-con-te', 18, true, 'es');

-- Inglés
insert into public.sliders (set_key, site, image_url, href, position, active, lang) values
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/AMBROSIA-🇺🇸.webp', '/ambrosia-restaurante-bistro-dos-versiones-de-un-gran-concepto', 1, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/BORAGO-🇺🇸.webp', '/borago-un-viaje-a-la-esencia-de-chile', 2, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/CARLOTO-🇺🇸.webp', '/carloto', 3, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/CASA ASA-🇺🇸.webp', '/casa-asa-el-arte-de-la-parrilla-y-el-precio-justo', 4, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/CHIUSO RISTORANTE-🇺🇸.webp', '/chiuso-ristorante', 5, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/CORA BISTRO-🇺🇸.webp', '/cora-bistro-oda-a-la-cocina-chilena', 6, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/DEBAINES-🇺🇸.webp', '/copper-room-y-gran-cafe-hotel-debaines-homenajes-necesarios', 7, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/FIERO-🇺🇸.webp', '/fiero-revalorizacion-del-producto-y-memoria-gastronomica', 8, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/FUKASAWA-🇺🇸.webp', '/fukasawa-esencia-japonesa', 9, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/JRONIMO-2.webp', '/jeronimo-cocina-del-mundo', 10, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/KARAI-🇺🇸.webp', '/karai-el-sello-del-mejor-del-mundo', 11, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/KATO-2.webp', '/kato-experiencia-asiatica-con-actitud', 12, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/PIEGARI-🇺🇸.webp', '/piegari-el-preciso-arte-de-la-comida-italiana', 13, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/PULPERIA-🇺🇸.webp', '/pulperia-santa-elvira-una-joya-de-matta-sur', 14, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/TANAKA-🇺🇸.webp', '/tanaka-la-fusion-redefinida', 15, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/CARRER NOU-2.webp', '/carrer-nou-la-honesta-esquina-catalana', 16, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/THE LOFT-🇺🇸.webp', '/the-loft', 17, true, 'en'),
('restaurants-mobile-en', 'santiagoadicto', '/banner nuevos restos/YUM CHA-🇺🇸.webp', '/yum-cha-comer-y-beber-con-te', 18, true, 'en');

commit;

-- Verificación: debe mostrar 18 filas por key.
select set_key, lang, count(*) as slides,
       min(position) as primera_posicion,
       max(position) as ultima_posicion
from public.sliders
where site = 'santiagoadicto'
  and set_key in ('restaurants-mobile-es', 'restaurants-mobile-en')
group by set_key, lang
order by set_key;
