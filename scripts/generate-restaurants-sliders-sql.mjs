import fs from "fs";

const site = "santiagoadicto";
const folder = "/banner nuevos restos";

const items = [
  {
    es: "AMBROSIA-🇪🇸.webp",
    en: "AMBROSIA-🇺🇸.webp",
    href: "/ambrosia-restaurante-bistro-dos-versiones-de-un-gran-concepto",
  },
  {
    es: "BORAGO-🇪🇸.webp",
    en: "BORAGO-🇺🇸.webp",
    href: "/borago-un-viaje-a-la-esencia-de-chile",
  },
  {
    es: "DEBAINES-🇪🇸.webp",
    en: "DEBAINES-🇺🇸.webp",
    href: "/copper-room-y-gran-cafe-hotel-debaines-homenajes-necesarios",
  },
  {
    es: "CORA BISTRO-🇪🇸.webp",
    en: "CORA BISTRO-🇺🇸.webp",
    href: "/cora-bistro-oda-a-la-cocina-chilena",
  },
  {
    es: "FUKASAWA-🇪🇸.webp",
    en: "FUKASAWA-🇺🇸.webp",
    href: "/fukasawa-esencia-japonesa",
  },
  {
    es: "KARAI-🇪🇸.webp",
    en: "KARAI-🇺🇸.webp",
    href: "/karai-el-sello-del-mejor-del-mundo",
  },
  {
    es: "PULPERIA-🇪🇸.webp",
    en: "PULPERIA-🇺🇸.webp",
    href: "/pulperia-santa-elvira-una-joya-de-matta-sur",
  },
  {
    es: "TANAKA-🇪🇸.webp",
    en: "TANAKA-🇺🇸.webp",
    href: "/tanaka-la-fusion-redefinida",
  },
  {
    es: "YUM CHA-🇪🇸.webp",
    en: "YUM CHA-🇺🇸.webp",
    href: "/yum-cha-comer-y-beber-con-te",
  },
  {
    es: "THE LOFT-🇪🇸.webp",
    en: "THE LOFT-🇺🇸.webp",
    href: "/the-loft",
  },
  {
    es: "CARLOTO-🇪🇸.webp",
    en: "CARLOTO-🇺🇸.webp",
    href: "/carloto",
  },
  {
    es: "CHIUSO RISTORANTE-🇪🇸.webp",
    en: "CHIUSO RISTORANTE-🇺🇸.webp",
    href: "/chiuso-ristorante",
  },
  {
    es: "JRONIMO-1.webp",
    en: "JRONIMO-2.webp",
    href: "/jeronimo-cocina-del-mundo",
  },
  {
    es: "PIEGARI-🇪🇸.webp",
    en: "PIEGARI-🇺🇸.webp",
    href: "/piegari-el-preciso-arte-de-la-comida-italiana",
  },
  {
    es: "KATO-1.webp",
    en: "KATO-2.webp",
    href: "/kato-experiencia-asiatica-con-actitud",
  },
  {
    es: "CARRER NOU-1.webp",
    en: "CARRER NOU-2.webp",
    href: "/carrer-nou-la-honesta-esquina-catalana",
  },
  {
    es: "CASA ASA-🇪🇸.webp",
    en: "CASA ASA-🇺🇸.webp",
    href: "/casa-asa-el-arte-de-la-parrilla-y-el-precio-justo",
  },
  {
    es: "FIERO-🇪🇸.webp",
    en: "FIERO-🇺🇸.webp",
    href: "/fiero-revalorizacion-del-producto-y-memoria-gastronomica",
  },
];

function esc(value) {
  return String(value).replace(/'/g, "''");
}

function updateBlock(setKey, lang, fileKey) {
  return items
    .map((item, index) => {
      const imageUrl = `${folder}/${item[fileKey]}`;
      const position = index + 1;
      return `-- ${item[fileKey]}
update public.sliders
set
  image_url = '${esc(imageUrl)}',
  position = ${position},
  active = true,
  lang = '${lang}'
where site = '${site}'
  and set_key = '${setKey}'
  and href = '${esc(item.href)}';

insert into public.sliders (set_key, site, image_url, href, position, active, lang)
select '${setKey}', '${site}', '${esc(imageUrl)}', '${esc(item.href)}', ${position}, true, '${lang}'
where not exists (
  select 1
  from public.sliders
  where site = '${site}'
    and set_key = '${setKey}'
    and href = '${esc(item.href)}'
);`;
    })
    .join("\n\n");
}

const sql = `-- Actualiza (NO borra) sliders de restaurantes ES/EN desktop+móvil
-- Imágenes: /public/banner nuevos restos/
-- Site: santiagoadicto
-- Por cada restaurante: UPDATE si ya existe el href; INSERT solo si falta.
-- La Cabrera no está en la carpeta nueva: se deja como está (no se toca).
-- Ejecutar en Supabase SQL Editor.

begin;

-- ========== restaurants-desktop-es ==========
${updateBlock("restaurants-desktop-es", "es", "es")}

-- ========== restaurants-mobile-es ==========
${updateBlock("restaurants-mobile-es", "es", "es")}

-- ========== restaurants-desktop-en ==========
${updateBlock("restaurants-desktop-en", "en", "en")}

-- ========== restaurants-mobile-en ==========
${updateBlock("restaurants-mobile-en", "en", "en")}

commit;

-- Verificación
select set_key, lang, position, href, image_url
from public.sliders
where site = '${site}'
  and set_key in (
    'restaurants-desktop-es',
    'restaurants-mobile-es',
    'restaurants-desktop-en',
    'restaurants-mobile-en'
  )
order by set_key, position;
`;

const outPath = new URL(
  "../docs/restaurants-sliders-replace.sql",
  import.meta.url,
);
fs.writeFileSync(outPath, sql, "utf8");
console.log(`Wrote ${outPath.pathname}`);
