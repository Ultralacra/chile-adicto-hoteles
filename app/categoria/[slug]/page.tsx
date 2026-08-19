"use client";

import Image from "next/image";
import { Header } from "@/components/header";
import { HotelCard } from "@/components/hotel-card";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import { HeroSlider } from "@/components/hero-slider";
import { notFound } from "next/navigation";
// Dejamos de consumir data.json; consultamos al API
import { useLanguage } from "@/contexts/language-context";
import { useEffect, use, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { buildCardExcerpt } from "@/lib/utils";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useSiteApi } from "@/hooks/use-site-api";
import { cachedFetch } from "@/lib/api-cache";
import { isHiddenFrontPost } from "@/lib/post-visibility";
import { hasPostPublicationEnded } from "@/lib/post-publication";
import { BottomHomeBanner } from "@/components/home-promo-banners";
import { HotelDetail } from "@/components/hotel-detail";
import { normalizeImageUrl } from "@/lib/utils";
import type { AgendaFeaturedSlot, AgendaPeriod } from "@/lib/agenda-cultural";

// Antes se validaba contra una lista fija, pero ahora el menú y las categorías
// se administran desde la BD. No hacemos 404 por slug desconocido.

type ResolvedParams = { slug: string };

const topRestaurantsSlugs = [
  "borago-un-viaje-a-la-esencia-de-chile",
  "casa-las-cujas-deleite-marino",
  "yum-cha-comer-y-beber-con-te",
  "demo-magnolia-honestidad-refrescante",
  "karai-el-sello-del-mejor-del-mundo",
  "pulperia-santa-elvira-una-joya-de-matta-sur",
  "demencia-un-espectaculo-gastronomico",
  "fukasawa-esencia-japonesa",
];

type ApiCommuneRow = {
  slug: string;
  label: string | null;
  show_in_menu?: boolean | null;
  menu_order?: number | null;
};

export default function CategoryPage({ params }: { params: any }) {
  const resolvedParams = use(params as any) as ResolvedParams;
  const { slug } = resolvedParams;
  const isAgendaCultural = slug === "agenda-cultural";
  const { language, t } = useLanguage();
  const { cachedFetchWithSite } = useSiteApi();
  const router = useRouter();

  // El scroll to top se maneja automáticamente por el sistema de navegación
  // useScrollRestoration en el layout gestiona el scroll inteligente

  const categoryMap: { [key: string]: string } = {
    norte: "NORTE",
    centro: "CENTRO",
    sur: "SUR",
    "isla-de-pascua": "ISLA DE PASCUA",
    santiago: "SANTIAGO",
    "exploraciones-tnf": "EXPLORACIONES TNF",
    // new category name mappings
    ninos: "NIÑOS",
    arquitectura: "ARQ",
    barrios: "BARRIOS",
    iconos: "ICONOS",
    mercados: "MERCADOS",
    miradores: "MIRADORES",
    // Mostrar CULTURA aunque el slug sea museos
    museos: "CULTURA",
    restaurantes: "RESTAURANTES",
    palacios: "PALACIOS",
    parques: "PARQUES",
    // Mostrar FUERA DE STGO aunque el slug sea paseos-fuera-de-santiago
    "paseos-fuera-de-santiago": "FUERA DE STGO",
    tiendas: "TIENDAS",
    "sorpresas-urbanas": "TIENDAS",
  };

  const categoryName = categoryMap[slug] || slug.toUpperCase();

  // Candidates: include possible English/Spanish variants for some categories
  const categoryCandidatesMap: { [key: string]: string[] } = {
    ninos: ["NIÑOS", "NINOS", "KIDS", "CHILDREN"],
    arquitectura: ["ARQ", "ARQUITECTURA", "ARCHITECTURE"],
    "isla-de-pascua": ["ISLA DE PASCUA", "EASTER ISLAND"],
    museos: ["MUSEOS", "CULTURA", "MUSEUMS", "CULTURE"],
    restaurantes: ["RESTAURANTES", "RESTAURANTS"],
    "paseos-fuera-de-santiago": [
      "PASEOS FUERA DE SANTIAGO",
      "FUERA DE STGO",
      "OUTSIDE STGO",
      "OUTSIDE SANTIAGO",
    ],
    // add other special cases if needed
  };

  const candidates = categoryCandidatesMap[slug] || [categoryName];

  const [filteredHotels, setFilteredHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [agendaConfig, setAgendaConfig] = useState<{
    periods: AgendaPeriod[];
    featured: AgendaFeaturedSlot | null;
  }>({ periods: [], featured: null });
  const [agendaLoading, setAgendaLoading] = useState(isAgendaCultural);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Preferimos filtrar por slug de categoría en el backend
    cachedFetchWithSite(
      `/api/posts?categorySlug=${encodeURIComponent(slug === "bares" ? "restaurantes" : slug)}&includeExpired=1&sort=alpha&lang=${language}`,
    )
      .then((rows) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        const visiblePosts = list.filter((p) => !isHiddenFrontPost(p));
        if (slug === "toprestoranes") {
          const postsBySlug = new Map(
            visiblePosts.map((post) => [String(post?.slug || ""), post]),
          );
          const featuredPosts = topRestaurantsSlugs
            .map((postSlug) => postsBySlug.get(postSlug))
            .filter(Boolean);
          const featuredSlugs = new Set(
            featuredPosts.map((post) => String(post?.slug || "")),
          );
          setFilteredHotels(
            featuredPosts.concat(
              visiblePosts.filter(
                (post) => !featuredSlugs.has(String(post?.slug || "")),
              ),
            ),
          );
          return;
        }
        setFilteredHotels(visiblePosts);
      })
      .catch(() => !cancelled && setFilteredHotels([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug, language, cachedFetchWithSite]);

  useEffect(() => {
    if (!isAgendaCultural) {
      setAgendaConfig({ periods: [], featured: null });
      setAgendaLoading(false);
      return;
    }

    let cancelled = false;
    setAgendaLoading(true);
    cachedFetchWithSite(`/api/agenda-cultural?lang=${language}`)
      .then((data: any) => {
        if (cancelled) return;
        setAgendaConfig({
          periods: Array.isArray(data?.periods) ? data.periods : [],
          featured: data?.featured || null,
        });
      })
      .catch(() => {
        if (!cancelled) setAgendaConfig({ periods: [], featured: null });
      })
      .finally(() => {
        if (!cancelled) setAgendaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAgendaCultural, language, cachedFetchWithSite]);

  const isRestaurantsPage = slug === "restaurantes";
  const isBarsPage = slug === "bares";
  const isRestaurantOrBarsPage = isRestaurantsPage || isBarsPage;

  // Comunas dinámicas para restaurantes (derivadas de direcciones/locations y overrides)
  const possibleCommunes = [
    "Santiago",
    "Providencia",
    "Las Condes",
    "Vitacura",
    "Lo Barnechea",
    "La Reina",
    "Ñuñoa",
    "Recoleta",
    "Independencia",
    "San Miguel",
    "Estación Central",
    "Maipú",
    "La Florida",
    "Puente Alto",
    "Alto Jahuel",
  ];
  const [communes, setCommunes] = useState<string[]>([]);
  const [dbCommunes, setDbCommunes] = useState<ApiCommuneRow[]>([]);
  const [dbPostCommuneMap, setDbPostCommuneMap] = useState<
    Record<string, string[]>
  >({});

  const searchParams = useSearchParams();
  const comunaParam = searchParams.get("comuna");
  const tipoParam = searchParams.get("tipo");
  const [selectedComuna, setSelectedComuna] = useState<string | null>(null);

  const communeLabelFromRow = (r: ApiCommuneRow) => {
    const label = String(r?.label || "").trim();
    if (label) return label;
    return String(r?.slug || "")
      .replace(/-/g, " ")
      .trim();
  };

  useEffect(() => {
    if (!comunaParam) {
      setSelectedComuna(null);
      return;
    }

    const param = String(comunaParam || "")
      .trim()
      .toLowerCase();
    const match = dbCommunes.find(
      (c) =>
        String(c.slug || "")
          .trim()
          .toLowerCase() === param,
    );
    if (match) {
      setSelectedComuna(communeLabelFromRow(match));
      return;
    }
    setSelectedComuna(comunaParam.replace(/-/g, " "));
  }, [comunaParam, slug, dbCommunes]);

  // Cargar comunas desde BD para el submenú (fallback a heurística si no existe tabla)
  useEffect(() => {
    if (!isRestaurantOrBarsPage) {
      setDbCommunes([]);
      return;
    }
    let cancelled = false;
    cachedFetchWithSite("/api/communes?nav=1")
      .then((data) => {
        if (cancelled) return;
        const list: ApiCommuneRow[] = Array.isArray(data) ? data : [];
        setDbCommunes(list.filter((x) => x && x.slug));
      })
      .catch(() => !cancelled && setDbCommunes([]));
    return () => {
      cancelled = true;
    };
  }, [isRestaurantOrBarsPage, cachedFetchWithSite]);

  // Reusar comunas ya embebidas en /api/posts para evitar una lectura extra a /api/communes/map.
  useEffect(() => {
    if (!isRestaurantOrBarsPage) {
      setDbPostCommuneMap({});
      return;
    }

    if (!Array.isArray(filteredHotels) || filteredHotels.length === 0) {
      setDbPostCommuneMap({});
      return;
    }

    const communeLookup = new Map<string, string>();
    for (const commune of dbCommunes) {
      const slugValue = String(commune?.slug || "").trim();
      if (!slugValue) continue;
      communeLookup.set(normalizeComuna(slugValue), slugValue);
      communeLookup.set(
        normalizeComuna(communeLabelFromRow(commune)),
        slugValue,
      );
    }

    const nextMap: Record<string, string[]> = {};
    for (const hotel of filteredHotels as any[]) {
      const postSlug = String(hotel?.slug || "").trim();
      if (!postSlug) continue;

      const matched = Array.isArray(hotel?.communes)
        ? hotel.communes
            .map((value: unknown) =>
              communeLookup.get(normalizeComuna(String(value || ""))),
            )
            .filter((value: string | undefined): value is string =>
              Boolean(value),
            )
        : [];

      if (matched.length > 0) {
        nextMap[postSlug] = Array.from(new Set(matched));
      }
    }

    setDbPostCommuneMap(nextMap);
  }, [isRestaurantOrBarsPage, filteredHotels, dbCommunes]);

  // Overrides de comuna por slug (prioridad sobre búsqueda por texto)
  // Permite uno o múltiples match de comuna por slug.
  const comunaOverrides: Record<string, string | string[]> = {
    "ceiba-rooftop-bar-sabores-amazonicos": "Lo Barnechea",
    "ceiba-roof-top-renace-en-lo-barnechea": ["Lo Barnechea", "Santiago"],
    "casaluz-una-brillante-luz-en-barrio-italia": "Providencia",
    "anima-el-reino-de-lo-esencial": "Providencia",
    // Mirai debe aparecer en Las Condes y Santiago
    "mirai-food-lab": ["Las Condes", "Santiago"],
  };

  // Comunas adicionales por slug (ADITIVO):
  // Se usa para “aparece también en…” sin perder coincidencias por texto.
  const comunaAdditions: Record<string, string | string[]> = {
    "bloody-mary-kitchen-bar-el-tomate-como-hilo-conductor-pero-no-el-limite":
      "Vitacura",
  };

  const normalizeComuna = (s: string) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

  const isHiddenRestaurantCommuneLabel = (label: string) =>
    normalizeComuna(label) === "INDEPENDENCIA";
  // Derivar lista de comunas encontradas entre los restaurantes cargados
  useEffect(() => {
    if (!isRestaurantOrBarsPage) {
      setCommunes([]);
      return;
    }

    // Si hay comunas en BD, usamos esas para el submenú (respeta show_in_menu)
    if (dbCommunes.length > 0) {
      const labels = dbCommunes
        .filter((c) => c && c.slug && c.show_in_menu !== false)
        .map((c) => communeLabelFromRow(c))
        .filter((x) => x && !isHiddenRestaurantCommuneLabel(String(x)));
      if (labels.length > 0) {
        setCommunes(labels);
        return;
      }
    }

    const found = new Set<string>();
    const tryAdd = (raw: string) => {
      const haystack = normalizeComuna(raw);
      for (const pc of possibleCommunes) {
        if (haystack.includes(normalizeComuna(pc))) {
          found.add(pc);
        }
      }
    };
    for (const h of filteredHotels as any[]) {
      const slug = String(h.slug || "");
      const override = comunaOverrides[slug];
      if (override) {
        const arr = Array.isArray(override) ? override : [override];
        arr.forEach((c) => found.add(c));
      }
      const addition = comunaAdditions[slug];
      if (addition) {
        const arr = Array.isArray(addition) ? addition : [addition];
        arr.forEach((c) => found.add(c));
      }
      if (h.address) tryAdd(h.address);
      if (Array.isArray(h.locations)) {
        for (const loc of h.locations) {
          if (loc?.address) tryAdd(loc.address);
          if (loc?.label) tryAdd(loc.label);
        }
      }
      if (Array.isArray(h.es?.description)) {
        tryAdd((h.es.description as string[]).join("\n"));
      }
      if (Array.isArray(h.en?.description)) {
        tryAdd((h.en.description as string[]).join("\n"));
      }
    }
    // Ordenar por el orden de possibleCommunes
    const ordered = possibleCommunes
      .filter((c) => found.has(c))
      .filter((c) => !isHiddenRestaurantCommuneLabel(String(c)));
    // Fallback si no detectamos ninguna: usar set básico conocido
    setCommunes(
      ordered.length > 0
        ? ordered
        : [
            "Vitacura",
            "Las Condes",
            "Santiago",
            "Lo Barnechea",
            "Providencia",
            "Alto Jahuel",
            "La Reina",
          ],
    );
  }, [isRestaurantOrBarsPage, filteredHotels]);

  const selectedComunaSlug = selectedComuna
    ? (() => {
        const norm = normalizeComuna(selectedComuna);
        const match = dbCommunes.find(
          (c) => normalizeComuna(communeLabelFromRow(c)) === norm,
        );
        if (match) return String(match.slug || "").trim();
        return String(selectedComuna).trim().toLowerCase().replace(/\s+/g, "-");
      })()
    : null;

  // Whitelist explícita para la comuna de Santiago: solo estos slugs deben aparecer
  const santiagoAllowedSlugs = new Set<string>([
    "casa-lastarria-nobleza-arquitectonica",
    "copper-room-y-gran-cafe-hotel-debaines-homenajes-necesarios",
    "demo-magnolia-honestidad-refrescante",
    "flama-la-pizza-que-desafia-lo-clasico",
    "jose-ramon-277-oda-a-lo-mas-sabroso-de-chile",
    "liguria-lastarria-la-filosofia-cicali",
    "the-singular",
    "pulperia-santa-elvira-una-joya-de-matta-sur",
    "ocean-pacifics-destino-gastronomico-patrimonial",
    "mirai-food-lab",
    "bocanariz-la-vitrina-del-vino-chileno",
    "blue-jar-nunca-decepciona",
    "make-make",
    "ceiba-roof-top-renace-en-lo-barnechea",
  ]);

  // Cargar imágenes del slider de restaurantes desde /public/imagenes-slider/manifest.json
  // Soporta dos formatos de manifest:
  // 1) Array simple de strings ["img1.webp", "img2.webp", ...]
  // 2) Objeto por idioma { es: string[], en: string[] }
  const [restaurantSliderImages, setRestaurantSliderImages] = useState<
    string[]
  >([]);
  const [restaurantSlideHrefs, setRestaurantSlideHrefs] = useState<string[]>(
    [],
  );
  const [restaurantDesktopLoadedFromDb, setRestaurantDesktopLoadedFromDb] =
    useState(false);
  // Imágenes móviles específicas (EN primera, ES segunda) para restaurantes
  const [restaurantMobileImages, setRestaurantMobileImages] = useState<
    string[]
  >([]);
  const [restaurantMobileHrefs, setRestaurantMobileHrefs] = useState<string[]>(
    [],
  );
  const [restaurantMobileLoadedFromDb, setRestaurantMobileLoadedFromDb] =
    useState(false);
  useEffect(() => {
    if (!isRestaurantsPage) return;
    let cancelled = false;
    const desktopKey =
      language === "en" ? "restaurants-desktop-en" : "restaurants-desktop-es";

    // 1) Intentar BD primero (si existe)
    cachedFetchWithSite(`/api/sliders/${encodeURIComponent(desktopKey)}`)
      .then((db: any) => {
        if (cancelled) return;
        const items = Array.isArray(db?.items) ? db.items : [];
        const activeItems = items.filter((it: any) => it?.active !== false);
        const imagesFromDb = activeItems
          .map((it: any) => String(it?.image_url || "").trim())
          .filter(Boolean);
        const hrefsFromDb = activeItems.map((it: any) =>
          it?.href ? String(it.href) : "",
        );

        if (imagesFromDb.length > 0) {
          setRestaurantSliderImages(imagesFromDb);
          setRestaurantSlideHrefs(hrefsFromDb);
          setRestaurantDesktopLoadedFromDb(true);
          return;
        }

        // 2) Fallback: manifest.json (comportamiento actual)
        setRestaurantDesktopLoadedFromDb(false);
        return fetch("/imagenes-slider/manifest.json")
          .then((r) => (r.ok ? r.json() : []))
          .then((payload) => {
            if (cancelled) return;

            const normalizeList = (list: unknown): string[] => {
              if (!Array.isArray(list)) return [];
              return list
                .map((s) => String(s || "").trim())
                .filter(Boolean)
                .map((s) => (s.startsWith("/") ? s : `/imagenes-slider/${s}`));
            };

            // Normalizador y matching inteligente contra data.json para que el href
            // coincida con el slug real del restaurante.
            const normKey = (str: string) =>
              String(str || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");

            const restaurantIndex = (filteredHotels as any[]).map((h) => {
              const slug = String(h.slug || "");
              const esName = String(h.es?.name || "");
              const enName = String(h.en?.name || "");
              return {
                slug,
                keys: [normKey(slug), normKey(esName), normKey(enName)].filter(
                  Boolean,
                ),
              };
            });

            const buildHrefsFromFilenames = (list: unknown): string[] => {
              if (!Array.isArray(list)) return [];
              return list
                .map((s) => String(s || "").trim())
                .filter(Boolean)
                .map((fname) => {
                  const onlyName = fname.split("/").pop() || fname;
                  const noExt = onlyName.replace(/\.[^.]+$/, "");
                  const base = noExt.replace(/-(1|2)$/i, ""); // AC KITCHEN-1 -> AC KITCHEN
                  const cleanedBase = base.replace(/^(sld|slm|sl)[ _-]+/i, "");
                  const key = normKey(cleanedBase); // ackitchen

                  let matchSlug: string | null = null;
                  for (const row of restaurantIndex) {
                    if (
                      row.keys.some(
                        (k: string) => k.startsWith(key) || key.startsWith(k),
                      )
                    ) {
                      matchSlug = row.slug;
                      break;
                    }
                  }

                  if (!matchSlug) {
                    // Fallback: derivar slug del base por si acaso
                    matchSlug = cleanedBase
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "");
                  }
                  return `/${matchSlug}`;
                });
            };

            // Determinar lista activa según idioma (o fallback)
            let activeList: unknown = [];
            if (Array.isArray(payload)) {
              // Formato antiguo: array simple
              activeList = payload;
            } else if (payload && typeof payload === "object") {
              activeList =
                (payload as any)[language] ||
                (payload as any)["es"] ||
                (payload as any)["en"];
            }

            const images = normalizeList(activeList);
            const derivedHrefs = buildHrefsFromFilenames(activeList);
            setRestaurantSliderImages(images);

            // Orden fijo “prioritario”, pero sin bloquear nuevas imágenes del manifest.
            // Si agregas una imagen nueva al manifest (y su restaurante existe), se
            // añade automáticamente al final sin tocar código.
            const explicitRestaurantSlugs = [
              "ac-kitchen-la-madurez-de-un-chef-en-movimiento",
              "ambrosia-restaurante-bistro-dos-versiones-de-un-gran-concepto",
              "borago-un-viaje-a-la-esencia-de-chile",
              "copper-room-y-gran-cafe-hotel-debaines-homenajes-necesarios",
              "cora-bistro-oda-a-la-cocina-chilena",
              "demencia-un-espectaculo-gastronomico",
              "fukasawa-esencia-japonesa",
              "karai-el-sello-del-mejor-del-mundo",
              "pulperia-santa-elvira-una-joya-de-matta-sur",
              "tanaka-la-fusion-redefinida",
              "yum-cha-comer-y-beber-con-te",
              "casa-las-cujas-deleite-marino",
            ];

            const explicitHrefs = explicitRestaurantSlugs.map(
              (slug) => `/${slug}`,
            );
            const merged: string[] = [];
            for (const h of explicitHrefs) {
              if (h && !merged.includes(h)) merged.push(h);
            }
            for (const h of derivedHrefs) {
              if (h && !merged.includes(h)) merged.push(h);
            }

            setRestaurantSlideHrefs(merged);
          });
      })
      .catch(() => {
        setRestaurantSliderImages([]);
        setRestaurantSlideHrefs([]);
        setRestaurantDesktopLoadedFromDb(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isRestaurantsPage, language, cachedFetchWithSite]);

  // Cargar carpeta específica móvil de restaurantes (sin afectar desktop)
  useEffect(() => {
    if (!isRestaurantsPage) return;
    let cancelled = false;

    const mobileKey =
      language === "en" ? "restaurants-mobile-en" : "restaurants-mobile-es";

    // 1) Intentar BD primero (si existe)
    cachedFetchWithSite(`/api/sliders/${encodeURIComponent(mobileKey)}`)
      .then((db: any) => {
        if (cancelled) return;
        const items = Array.isArray(db?.items) ? db.items : [];
        const activeItems = items.filter((it: any) => it?.active !== false);
        const imagesFromDb = activeItems
          .map((it: any) => String(it?.image_url || "").trim())
          .filter(Boolean);
        const hrefsFromDb = activeItems.map((it: any) =>
          it?.href ? String(it.href) : "",
        );

        if (imagesFromDb.length > 0) {
          setRestaurantMobileImages(imagesFromDb);
          setRestaurantMobileHrefs(hrefsFromDb);
          setRestaurantMobileLoadedFromDb(true);
          return;
        }

        // 2) Fallback: carpeta pública vía API actual
        setRestaurantMobileLoadedFromDb(false);
        return cachedFetchWithSite("/api/restaurant-slider-mobile").then(
          (json: any) => {
            if (cancelled) return;
            const imgs: string[] = Array.isArray(json?.images)
              ? json.images
              : [];
            setRestaurantMobileImages(imgs);
            // Derivar href por filename intentando matchear slug real igual que manifest
            const normKey = (str: string) =>
              String(str || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");
            const restaurantIndex = (filteredHotels as any[]).map((h) => {
              const slug = String(h.slug || "");
              const esName = String(h.es?.name || "");
              const enName = String(h.en?.name || "");
              return {
                slug,
                keys: [normKey(slug), normKey(esName), normKey(enName)].filter(
                  Boolean,
                ),
              };
            });
            const hrefs = imgs.map((full) => {
              const fname = full.split("/").pop() || full;
              const base = fname
                .replace(/\.[^.]+$/, "")
                .replace(/-(1|2)$/i, "");
              const cleanedBase = base.replace(/^(sld|slm|sl)[ _-]+/i, "");
              const key = normKey(cleanedBase);
              let matchSlug: string | null = null;
              for (const row of restaurantIndex) {
                if (
                  row.keys.some(
                    (k: string) => k.startsWith(key) || key.startsWith(k),
                  )
                ) {
                  matchSlug = row.slug;
                  break;
                }
              }
              if (!matchSlug) {
                matchSlug = cleanedBase
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
              }
              return `/${matchSlug}`;
            });
            setRestaurantMobileHrefs(hrefs);
          },
        );
      })
      .catch(() => {
        if (!cancelled) {
          setRestaurantMobileImages([]);
          setRestaurantMobileHrefs([]);
          setRestaurantMobileLoadedFromDb(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isRestaurantsPage, filteredHotels, language, cachedFetchWithSite]);

  // Override de descripciones ES/EN para slugs específicos (p. ej., PRIMA BAR)
  const enrichedHotels = (filteredHotels || []).map((h) => {
    if (String(h.slug) === "prima-bar") {
      const descES = [
        "Creación del reconocido chef chileno Kurt Schmidt, una figura clave en la escena gastronómica local. Schmidt es conocido por su trabajo en el aclamado 99 Restaurante, que se posicionó en la lista 'Latin America's 50 Best Restaurants'. Con Prima Bar, el chef expande su visión, fusionando su experiencia culinaria con una profunda pasión por la música y el diseño.",
        "Inaugurado originalmente en Providencia, Prima Bar se mudó a su ubicación actual en la CV Galería en Vitacura y evolucionó en un 'listening bar'. Este concepto único, pionero en Chile, integra la experiencia auditiva —con una banda sonora curada a base de vinilos— a la comida y la coctelería, invitando a los comensales a un espacio de disfrute sensorial completo.",
        "La propuesta culinaria es un reflejo de la visión de Schmidt: una cocina de autor, fresca y moderna, con un enfoque en la producción artesanal e ingredientes de todo Chile. El menú, diseñado para compartir, se inspira en una versión moderna de las tapas. La carta de cócteles sigue la misma filosofía, con creaciones originales e inspiradas también en la música y algunos de sus referentes.",
        "Prima Bar ha consolidado su reputación a nivel internacional, siendo destacado por el prestigioso ranking de 'The World's 50 Best Discovery', una lista que reconoce bares y restaurantes que ofrecen experiencias culinarias excepcionales alrededor del mundo.",
      ];
      const descEN = [
        "Created by renowned Chilean chef Kurt Schmidt, a key figure in the country’s contemporary gastronomic scene. Schmidt is best known for his work at the acclaimed 99 Restaurant, which earned a place on the Latin America’s 50 Best Restaurants list. With Prima Bar, the chef expands his creative vision, blending his culinary expertise with a deep passion for music and design.",
        "Originally opened in Providencia, Prima Bar later moved to its current location inside CV Galería in Vitacura, evolving into a true listening bar. This unique concept — a pioneer in Chile — merges sound and taste, pairing a curated vinyl soundtrack with fine dining and mixology, offering guests a fully immersive sensory experience.",
        "The culinary proposal reflects Schmidt’s philosophy: author-driven cuisine, fresh and modern, with an emphasis on artisanal production and ingredients sourced from across Chile. The menu, designed for sharing, takes inspiration from a contemporary interpretation of tapas. The cocktail list follows the same creative spirit, featuring original recipes influenced by music and iconic artists.",
        "Prima Bar has achieved international recognition, earning a spot on the prestigious The World’s 50 Best Discovery list — a distinction reserved for venues that deliver outstanding culinary and bar experiences worldwide.",
      ];
      return {
        ...h,
        es: { ...(h.es || {}), description: descES },
        en: { ...(h.en || {}), description: descEN },
      };
    }
    if (
      String(h.slug) === "the-singular" ||
      String(h.slug) === "restaurante-the-singular"
    ) {
      const descES = [
        "Ubicado en el histórico barrio Lastarria, el restaurante del Hotel The Singular aspira a ser un referente de la alta cocina chilena, fusionando tradición y modernidad. Su propuesta es un viaje culinario de norte a sur, resaltando la riqueza de los ingredientes locales con una ejecución técnica inspirada en la gastronomía francesa.",
        "La dirección de la cocina está a cargo del chef Hernán Basso, un profesional formado en Buenos Aires que ha dejado su huella en los fogones de The Singular Patagonia desde 2011. Su cocina es un homenaje a los sabores y productos chilenos, que interpreta con precisión y un toque vanguardista. La visión detrás de The Singular es de la familia Sahli, cuyo legado en la hotelería chilena se remonta al histórico Hotel Crillón. Con este proyecto buscaban crear un espacio que reflejara el lujo, la elegancia y la historia local.",
        "El menú del restaurante ofrece una selección de platos que destacan por su audacia y equilibrio. La calidad de su gastronomía y el impecable servicio le han valido múltiples galardones, incluyendo el reconocimiento en la lista de los 'Mejores Hoteles de Lujo en Chile' por Condé Nast Traveler y los 'World Travel Awards', consolidándolo como un destino culinario de primer nivel.",
        "Para completar la experiencia, el hotel cuenta con un Rooftop Bar considerado una de las mejores terrazas de Santiago. Este espacio ofrece vistas panorámicas del Cerro San Cristóbal y el Parque Forestal. Es el lugar ideal para disfrutar de una carta de coctelería de autor, vinos chilenos y tapas en un ambiente lounge, especialmente al atardecer.",
      ];
      const descEN = [
        "Located in the historic Barrio Lastarria, the restaurant at The Singular Hotel Santiago seeks to be a true benchmark of Chilean haute cuisine, blending tradition and modernity. Its culinary proposal is a journey from north to south, highlighting the richness of local ingredients executed with technical precision and a French-inspired touch.",
        "The kitchen is led by Chef Hernán Basso, a Buenos Aires–trained professional who has made his mark at The Singular Patagonia since 2011. His cuisine pays homage to Chilean flavors and ingredients, interpreted with precision and a touch of innovation. The vision behind The Singular comes from the Sahli family, whose legacy in Chilean hospitality dates back to the historic Hotel Crillón. With this project, they set out to create a space that reflects luxury, elegance, and local heritage.",
        "The menu offers a refined selection of dishes known for their boldness and balance. The quality of the cuisine and impeccable service have earned the restaurant multiple distinctions, including mentions among Chile’s Best Luxury Hotels by Condé Nast Traveler and awards from the World Travel Awards, establishing it as a culinary destination of excellence.",
        "To complete the experience, the hotel features a Rooftop Bar, considered one of Santiago’s best terraces. With panoramic views of Cerro San Cristóbal and Parque Forestal, it’s the ideal spot to enjoy signature cocktails, Chilean wines, and gourmet tapas in an elegant lounge atmosphere—especially at sunset.",
      ];
      return {
        ...h,
        es: { ...(h.es || {}), description: descES },
        en: { ...(h.en || {}), description: descEN },
      };
    }
    return h;
  });

  // Apply comuna filter if selectedComuna is set (match in descriptions or address)
  const finalHotels = selectedComuna
    ? enrichedHotels.filter((h) => {
        const slug = String(h.slug || "");
        // Si la comuna seleccionada es Santiago, aplicar whitelist estricta
        if (normalizeComuna(selectedComuna) === normalizeComuna("Santiago")) {
          return santiagoAllowedSlugs.has(slug);
        }

        // Si tenemos mapeo desde BD, usarlo como señal primaria
        if (selectedComunaSlug) {
          const mapped = dbPostCommuneMap?.[slug] || [];
          if (Array.isArray(mapped) && mapped.includes(selectedComunaSlug)) {
            return true;
          }
        }

        const addition = comunaAdditions[slug];
        if (addition) {
          const targets = Array.isArray(addition) ? addition : [addition];
          if (
            targets.some(
              (v) => normalizeComuna(v) === normalizeComuna(selectedComuna),
            )
          ) {
            return true;
          }
        }

        const override = comunaOverrides[slug];
        if (override) {
          // Si hay override, debe coincidir con alguna de las comunas declaradas
          const targets = Array.isArray(override) ? override : [override];
          return targets.some(
            (v) => normalizeComuna(v) === normalizeComuna(selectedComuna),
          );
        }

        // Construir un texto de búsqueda que incluya:
        // - descripciones ES/EN.
        // - dirección principal
        // - todas las direcciones y labels de las sucursales (locations[])
        const parts: string[] = [];
        if (Array.isArray(h.es?.description)) parts.push(...h.es.description);
        if (Array.isArray(h.en?.description)) parts.push(...h.en.description);
        if (h.address) parts.push(h.address);
        if (Array.isArray(h.locations)) {
          for (const loc of h.locations) {
            if (loc.address) parts.push(loc.address);
            if (loc.label) parts.push(loc.label);
          }
        }

        const haystack = normalizeComuna(parts.join(" "));
        return haystack.includes(normalizeComuna(selectedComuna));
      })
    : enrichedHotels;

  // Ordenar restaurantes alfabéticamente por nombre (según idioma actual)
  const sortKey = (h: any) =>
    String(h?.[language]?.name || h?.en?.name || h?.es?.name || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

  const cleanedList = finalHotels.filter(
    (h: any) => String(h.slug) !== "w-santiago",
  );
  const shouldSortAlphabetically = isRestaurantOrBarsPage || slug === "cafes";

  const finalOrderedHotels = shouldSortAlphabetically
    ? cleanedList
        .slice()
        .sort((a, b) =>
          sortKey(a) < sortKey(b) ? -1 : sortKey(a) > sortKey(b) ? 1 : 0,
        )
    : cleanedList;

  const getPostCategorySlugs = (post: any) => {
    const source = new Set<string>();

    if (Array.isArray(post?.categories)) {
      for (const category of post.categories) {
        const normalized = String(category || "")
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        if (normalized) source.add(normalized);
      }
    }

    const translationCategories = [post?.es?.category, post?.en?.category];
    for (const category of translationCategories) {
      const normalized = String(category || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      if (normalized) source.add(normalized);
    }

    return source;
  };

  const restaurantOnlyHotels = isRestaurantOrBarsPage
    ? finalOrderedHotels.filter((hotel) => {
        const categorySlugs = getPostCategorySlugs(hotel);
        return !categorySlugs.has("bares") && !categorySlugs.has("bars");
      })
    : [];

  const restaurantBarsHotels = isRestaurantOrBarsPage
    ? finalOrderedHotels.filter((hotel) => {
        const categorySlugs = getPostCategorySlugs(hotel);
        return categorySlugs.has("bares") || categorySlugs.has("bars");
      })
    : [];

  const toLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const repeatingAgendaWeeklySlugs = new Set([
    "ciclo-especial-mes-de-la-danza-en-matucana-100",
    "artes-visuales-enter-to-the-exit-de-fabiola-morcillo",
  ]);
  const repeatingSlugDateRanges = [
    {
      slug: "artes-visuales-arte-radrigan-la-pintura-consumada",
      from: "2026-05-08",
      to: "2026-06-04",
    },
    {
      slug: "artes-visuales-naturalia-de-gonzalo-pedraza",
      from: "2026-05-08",
      to: "2026-05-17",
    },
    {
      slug: "teatro-musical-amores-de-cantina-de-juan-radrigan",
      from: "2026-05-07",
      to: "2026-05-17",
    },
    {
      slug: "teatro-musical-pretty-woman-el-musical",
      from: "2026-05-06",
      to: "2026-06-14",
    },
    {
      slug: "cine-estreno-de-masters-of-the-universe",
      from: "2026-06-01",
      to: "2026-06-30",
    },
    {
      slug: "cine-estreno-de-backrooms-sin-salida",
      from: "2026-06-01",
      to: "2026-06-30",
    },
    {
      slug: "teatro-ciclo-repertorio-de-lafamiliateatro-en-matucana-100",
      from: "2026-06-01",
      to: "2026-06-28",
    },
    {
      slug: "tendencias-y-entretenimiento-almas-perdidas-vr-inmersivo",
      from: "2026-06-01",
      to: "2026-07-18",
    },
    {
      slug: "teatro-velocirraptors-en-centro-cultural-gam",
      from: "2026-06-01",
      to: "2026-07-12",
    },
    {
      slug: "teatro-musical-shrek-el-musical-en-centro-cultural-ceina",
      from: "2026-06-01",
      to: "2026-07-05",
    },
    {
      slug: "teatro-el-dylan-en-centro-cultural-gam",
      from: "2026-06-01",
      to: "2026-07-05",
    },
    {
      slug: "danza-de-una-luz-a-otra-del-banch-en-las-condes",
      from: "2026-06-01",
      to: "2026-07-12",
    },
    {
      slug: "bernardo-oyarzun-reactiva-el-archivo-de-teleseries-en-instituto-tele-arte",
      from: "2026-07-01",
      to: "2026-07-31",
    },
    {
      slug: "teatro-y-territorio-la-obra-maulina-cuervos-de-pantano-llega-con-su-viaje-escenico-a-santiago",
      from: "2026-07-06",
      to: "2026-07-20",
    },
    {
      slug: "teatro-y-memoria-la-compania-la-pieza-oscura-estrena-la-version-teatral-de-la-dimension-desconocida",
      from: "2026-07-06",
      to: "2026-07-27",
    },
    {
      slug: "artes-visuales-y-nuevos-medios-el-cclm-celebra-20-anos-con-la-muestra-interactiva-vivir-el-archivo",
      from: "2026-07-13",
      to: "2026-11-02",
    },
    {
      slug: "teatro-y-objetos-marionetas-de-tamano-real-dan-vida-a-reloj-viejo-de-pared",
      from: "2026-07-21",
      to: "2026-08-03",
    },
    {
      slug: "grandes-espectaculos-e-ilusionismo-jean-paul-olhaberry-lidera-el-debut-presencial-del-festival-pata-de-cabra",
      from: "2026-07-06",
      to: "2026-07-19",
    },
    {
      slug: "artes-visuales-y-entorno-urbano-pedro-lomboy-tombo-expande-el-lenguaje-del-graffiti-en-galeria-cima",
      from: "2026-07-06",
      to: "2026-08-02",
    },
    {
      slug: "tendencias-y-urbanismo-las-condes-y-street-machine-presentan-invierno-magico-la-gran-cumbre-de-entretenimiento-familiar",
      from: "2026-07-06",
      to: "2026-08-09",
    },
    {
      slug: "danza-contemporanea-gam-estrena-majamama-una-radiografia-al-brillo-y-la-resistencia-colonial-latina",
      from: "2026-07-21",
      to: "2026-07-27",
    },
    {
      slug: "artes-visuales-y-patrimonio-natalia-montoya-transforma-la-galeria-gabriela-mistral-en-un-territorio-andino-con-radiacion-ocre",
      from: "2026-07-20",
      to: "2026-08-03",
    },
    {
      slug: "artes-escenicas-sofia-rodriguez-estrena-automata-comedia-negra-de-ciencia-ficcion-sobre-la-obsolescencia-humana",
      from: "2026-07-23",
      to: "2026-08-02",
    },
    {
      slug: "raul-riquelme-estrena-la-comedia-acida-cerdo",
      from: "2026-07-27",
      to: "2026-08-09",
    },
    {
      slug: "cine-y-ciencia-ficcion-ridley-scott-estrena-el-thriller-postapocaliptico-la-guerra-de-los-ultimos-en-salas-del-pais",
      from: "2026-09-03",
      to: "2026-09-06",
    },
    {
      slug: "periodismo-de-investigacion-memoria-y-sonoridad-podium-podcast-y-gam-estrenan-la-serie-documental-prenderse-fuego-las-voces-de-pedro-lemebel",
      from: "2026-09-03",
      to: "2026-09-06",
    },
    {
      slug: "artes-escenicas-y-vanguardia-teatro-viajeinmovil-reinterpreta-a-shakespeare-y-euripides-con-marionetas-y-teatro-de-objetos",
      from: "2026-09-03",
      to: "2026-09-06",
    },
    {
      slug: "la-oreja-de-van-gogh-el-reencuentro-mas-esperado-llega-a-chile-con-amaia-montero",
      from: "2026-09-03",
      to: "2027-03-28",
    },
    {
      slug: "musica-conciertos-e-hits-historicos-illya-kuryaki-the-valderramas-confirma-sideshow-de-regreso-en-gran-arena-monticello",
      from: "2026-09-03",
      to: "2026-11-13",
    },
    {
      slug: "musica-grandes-estadios-y-rock-clasico-def-leppard-agendan-show-en-el-movistar-arena-con-su-gira-live-2026",
      from: "2026-09-03",
      to: "2026-11-08",
    },
    {
      slug: "bienestar-deporte-y-comunidad-corporacion-yo-mujer-abre-inscripciones-para-la-17-corrida-por-la-vida-en-el-parque-bicentenario",
      from: "2026-09-03",
      to: "2026-10-25",
    },
    {
      slug: "festivales-y-cultura-bavara-oktoberfest-munich-malloco-desvela-su-lineup-con-los-vasquez-candelabro-y-zillertal-orchester",
      from: "2026-09-03",
      to: "2026-10-11",
    },
    {
      slug: "artes-visuales-y-patrimonio-natalia-montoya-transforma-la-galeria-gabriela-mistral-en-un-territorio-andino-con-radiacion-ocre",
      from: "2026-08-03",
      to: "2026-08-30",
    },
    {
      slug: "musica-y-teatro-fisico-carlos-casella-y-alejandra-radano-estrenan-el-concierto-teatral-tester-en-el-ceina",
      from: "2026-09-28",
      to: "2026-10-04",
    },
    {
      slug: "lotus-y-juanes-presentan-la-edicion-inaugural-del-festival-bamba-en-el-parque-o-higgins",
      from: "2026-09-27",
      to: "2026-10-31",
    },
    {
      slug: "iron-maiden-celebra-50-anos-con-dos-fechas-consecutivas-en-el-estadio-nacional",
      from: "2026-09-27",
      to: "2026-10-31",
    },
  ];

  // Helper: transformar un post del listado al shape que espera HotelDetail
  function buildHotelDetailShape(source: any) {
    if (!source) return null;
    const imgs: string[] = Array.isArray(source.images)
      ? source.images.filter((s: string) => !!s)
      : [];
    const isPortada = (s: string) =>
      /portada/i.test(normalizeImageUrl(s).replace(/\.[^.]+$/, ""));
    let derivedFeatured = String(source.featuredImage || "").trim();
    if (!derivedFeatured) {
      const portada = imgs.find((s) => isPortada(s));
      if (portada) derivedFeatured = portada;
    }
    const featuredKey = normalizeImageUrl(derivedFeatured);
    const seen = new Set<string>();
    const gallery = imgs.filter((img: string) => {
      const key = normalizeImageUrl(img);
      if (!key) return false;
      if (key === featuredKey) return false;
      if (/portada/i.test(key)) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const tr = source[language] || source.es || {};
    const desc = Array.isArray(tr.description) ? tr.description : [];
    return {
      name: tr.name || source.en?.name || source.es?.name || "",
      subtitle: tr.subtitle || source.en?.subtitle || source.es?.subtitle || "",
      excerpt: desc[0] || "",
      fullContent: desc
        .filter(Boolean)
        .map((p: string) => `<p>${p}</p>`)
        .join(""),
      infoHtml: tr.infoHtml || null,
      infoHtmlNew: tr.infoHtmlNew || null,
      website: source.website || "",
      websitePublic: source.websitePublic || source.website_public || "",
      website_display: source.website_display || "",
      instagram: source.instagram || "",
      instagram_display: source.instagram_display || "",
      email: source.email || "",
      phone: source.phone || "",
      address: source.address || "",
      locations: source.locations || [],
      photosCredit: source.photosCredit || "",
      hours: source.hours || "",
      reservationLink: source.reservationLink || "",
      reservationPolicy: source.reservationPolicy || "",
      interestingFact: source.interestingFact || "",
      publishStartAt: source.publishStartAt || null,
      publishEndAt: source.publishEndAt || null,
      publicationEndsAt: source.publicationEndsAt || null,
      featuredImage: derivedFeatured,
      galleryImages: gallery,
      categories: Array.from(
        new Set([
          ...(typeof tr.category === "string" && tr.category.trim()
            ? [tr.category.trim()]
            : []),
          ...(Array.isArray(source.categories)
            ? source.categories.filter((c: any) => typeof c === "string")
            : []),
        ]),
      ),
    };
  }

  // La API decide períodos y apariciones; la página solo resuelve los posts ya cargados.
  const agendaReturnStorageKey = "agenda-cultural:last-clicked-post";
  const agendaSelectedPeriodStorageKey = "agenda-cultural:selected-period";

  const handleAgendaCardClick = (
    postSlug: string,
    period?: AgendaPeriod,
    cardElement?: HTMLElement,
  ) => {
    if (!isAgendaCultural || !postSlug) return;
    sessionStorage.setItem(agendaReturnStorageKey, postSlug);
    if (period?.desktopImageUrl) {
      sessionStorage.setItem(
        agendaSelectedPeriodStorageKey,
        JSON.stringify({
          postSlug,
          periodId: period.id,
          href: period.href,
          desktopImageUrl: period.desktopImageUrl,
          mobileImageUrl: period.mobileImageUrl,
          alt: period.alt,
        }),
      );
    } else {
      sessionStorage.removeItem(agendaSelectedPeriodStorageKey);
    }

    const article = cardElement?.querySelector("article");
    if (article) {
      article.classList.add("agenda-card-leaving");
      window.setTimeout(() => {
        article.classList.remove("agenda-card-leaving");
      }, 260);
    }
  };

  const agendaGrouped = isAgendaCultural
    ? agendaConfig.periods
        .map((period) => ({
          ...period,
          posts: period.postSlugs
            .map((postSlug) =>
              finalOrderedHotels.find((hotel) => hotel.slug === postSlug),
            )
            .filter(
              (hotel): hotel is any =>
                !!hotel && !hasPostPublicationEnded(hotel),
            ),
        }))
        .filter((group) => group.posts.length > 0)
    : [];
  const featuredPost = agendaConfig.featured?.postSlug
    ? finalOrderedHotels.find(
        (hotel) => hotel.slug === agendaConfig.featured?.postSlug,
      )
    : null;

  useEffect(() => {
    if (!isAgendaCultural || loading) return;

    const targetSlug = sessionStorage.getItem(agendaReturnStorageKey);
    if (!targetSlug) return;

    const timer = window.setTimeout(() => {
      const target = document.getElementById(`post-card-${targetSlug}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        const article = target.querySelector("article");
        if (article) {
          article.classList.remove("agenda-card-return");
          void article.clientHeight;
          article.classList.add("agenda-card-return");
          window.setTimeout(() => {
            article.classList.remove("agenda-card-return");
          }, 700);
        }
      }
      sessionStorage.removeItem(agendaReturnStorageKey);
    }, 40);

    return () => window.clearTimeout(timer);
  }, [isAgendaCultural, loading, agendaGrouped.length]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <Header />
          <main className="site-inner py-4">
            <div className="w-full py-16 grid place-items-center text-gray-500">
              Cargando…
            </div>
          </main>
          <Footer activeCategory={slug} />
        </div>
      }
    >
      <div className="min-h-screen bg-white">
        <Header />

        <main className="site-inner py-4">
          {isRestaurantOrBarsPage ? (
            // Submenú de comunas para restaurantes/bares
            <nav className="py-4 hidden lg:block">
              <ul className="hidden lg:flex flex-nowrap items-center gap-2 text-sm font-medium whitespace-nowrap">
                <li className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedComuna(null);
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem("nav:direction", "back");
                      }
                      router.back();
                    }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src="/Group 8.png"
                      alt={t("VOLVER", "BACK")}
                      width={100}
                      height={66}
                      className="h-11 w-auto"
                    />
                  </button>
                  <span className="text-black">•</span>
                </li>
                {communes.map((c, index) => {
                  const match = dbCommunes.find(
                    (row) =>
                      normalizeComuna(communeLabelFromRow(row)) ===
                      normalizeComuna(c),
                  );
                  const slugified = match
                    ? String(match.slug || "").trim()
                    : c.toLowerCase().replace(/\s+/g, "-");
                  const isActive =
                    !!selectedComuna &&
                    normalizeComuna(selectedComuna) === normalizeComuna(c);
                  return (
                    <li key={c} className="flex items-center gap-2">
                      <Link
                        href={`${isBarsPage ? "/categoria/bares" : "/restaurantes"}?comuna=${slugified}`}
                        className={`font-neutra hover:text-[var(--color-brand-red)] transition-colors tracking-wide text-[15px] leading-[20px] ${
                          isActive
                            ? "text-[var(--color-brand-red)]"
                            : "text-black"
                        }`}
                        onClick={() => setSelectedComuna(c)}
                      >
                        {c.toUpperCase()}
                      </Link>
                      {index < communes.length - 1 && (
                        <span className="text-black">•</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : (
            <div className="hidden lg:block">
              <CategoryNav activeCategory={slug} compact />
            </div>
          )}

          {slug === "toprestoranes" && (
            <div className="w-full mt-2">
              <BottomHomeBanner
                href="/categoria/toprestoranes"
                src="/bannerRestaurantes/BANER DESKTOP 50 BEST.webp"
                mobileSrc="/bannerRestaurantes/BANNER MOVIL 50 BEST.webp"
                alt="Top Restaurantes"
              />
            </div>
          )}

          {/* En Monumentos Nacionales, Cafés, ICONOS, Parques y La Ruta Toyota: banner largo bajo el menú, luego posts */}
          {(slug === "monumentos-nacionales" ||
            slug === "cafes" ||
            slug === "iconos" ||
            slug === "parques" ||
            slug === "la-ruta-toyota") && (
            <div className="w-full mt-2">
              <BottomHomeBanner
                href={
                  slug === "cafes"
                    ? "/cafes"
                    : slug === "monumentos-nacionales"
                      ? "/monumentos-nacionales"
                      : "/categoria/la-ruta-toyota"
                }
                src={
                  slug === "cafes"
                    ? "/bannerHome/BANNER DESKTOP 50 CAFES.webp"
                    : slug === "monumentos-nacionales"
                      ? "/bannerHome/BANNER MONUMENTOS.svg"
                      : slug === "iconos"
                        ? "/bannerstoyota/BANNER LA RUTA TOYOTA ICONOS.png"
                        : "/bannerstoyota/BANNER LA RUTA TOYOTA.webp"
                }
                mobileSrc={
                  slug === "cafes"
                    ? "/bannerHome/30 CAFES.webp"
                    : slug === "monumentos-nacionales"
                      ? undefined
                      : slug === "iconos"
                        ? "/bannerstoyota/BANNER LA RUTA TOYOTA ICONOS.png"
                        : "/bannerstoyota/BANNER LA RUTA TOYOTA.webp"
                }
                alt={
                  slug === "cafes"
                    ? "Cafés"
                    : slug === "monumentos-nacionales"
                      ? "Monumentos Nacionales"
                      : slug === "iconos"
                        ? "Iconos"
                        : "La Ruta Toyota"
                }
              />
            </div>
          )}

          {/* Slider de restaurantes: solo en página principal (sin filtro tipo) */}
          {isRestaurantsPage && !tipoParam && (
            <div className="py-2">
              <div className="w-full overflow-hidden mb-0">
                <HeroSlider
                  desktopImages={restaurantSliderImages}
                  mobileImages={
                    // Si vienen desde BD (key ya es -es/-en), NO filtrar por sufijo.
                    restaurantMobileLoadedFromDb
                      ? restaurantMobileImages
                      : restaurantMobileImages.length > 0
                        ? language === "es"
                          ? restaurantMobileImages.filter((img) =>
                              /-1\./i.test(img),
                            )
                          : restaurantMobileImages.filter((img) =>
                              /-2\./i.test(img),
                            )
                        : restaurantDesktopLoadedFromDb
                          ? restaurantSliderImages
                          : language === "es"
                            ? restaurantSliderImages.filter((img) =>
                                /-1\./i.test(img),
                              )
                            : restaurantSliderImages.filter((img) =>
                                /-2\./i.test(img),
                              )
                  }
                  slideHrefsMobile={
                    restaurantMobileLoadedFromDb
                      ? restaurantMobileHrefs
                      : restaurantMobileHrefs.length > 0
                        ? language === "es"
                          ? restaurantMobileHrefs.filter((_, i) =>
                              /-1\./i.test(restaurantMobileImages[i] || ""),
                            )
                          : restaurantMobileHrefs.filter((_, i) =>
                              /-2\./i.test(restaurantMobileImages[i] || ""),
                            )
                        : undefined
                  }
                  // Ver imagen completa sin recortar y mantener el ancho del contenedor
                  autoplay={false}
                  showArrows
                  autoHeight
                  // keep default desktop height (closer to other sliders)
                  desktopHeight={437}
                  mobileHeight={550}
                  slideHrefs={restaurantSlideHrefs}
                  dotInactiveClass="bg-gray-300 w-2 h-2"
                  dotActiveClass="bg-[#E40E36] w-3 h-3"
                  // mismo espacio para los puntos que en Home
                  dotBottom={16}
                />
              </div>
            </div>
          )}

          {/* Contador oculto por solicitud: se elimina el conteo de posts */}

          {/* Hotel Grid */}
          {loading ? (
            <div className="w-full py-16 grid place-items-center text-gray-500">
              <div className="flex items-center gap-2">
                <Spinner className="size-5" /> Cargando…
              </div>
            </div>
          ) : isAgendaCultural &&
            (agendaGrouped.length > 0 || agendaConfig.featured) ? (
            /* Agenda Cultural: post destacado fijo arriba + banner de cada semana y sus posts */
            <div className="mt-4 space-y-8">
              {agendaConfig.featured && (
                <section key="featured-post">
                  {agendaConfig.featured.desktopImageUrl && (
                    <div className="w-full mb-4">
                      <BottomHomeBanner
                        href={agendaConfig.featured.href}
                        src={agendaConfig.featured.desktopImageUrl}
                        mobileSrc={
                          agendaConfig.featured.mobileImageUrl || undefined
                        }
                        alt={agendaConfig.featured.alt}
                      />
                    </div>
                  )}
                  {featuredPost && (
                    <HotelDetail
                      slug={featuredPost.slug}
                      hotel={buildHotelDetailShape(featuredPost) as any}
                      hideBanners
                      noContainer
                    />
                  )}
                </section>
              )}
              {agendaGrouped.map((group, groupIdx) => (
                <section key={group.id}>
                  {group.desktopImageUrl && (
                    <div className="w-full mb-4">
                      <BottomHomeBanner
                        href={group.href}
                        src={group.desktopImageUrl}
                        mobileSrc={group.mobileImageUrl || undefined}
                        alt={group.alt}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {group.posts.map((hotel) => (
                      <HotelCard
                        key={hotel.slug}
                        slug={hotel.slug}
                        name={hotel[language]?.name || hotel.es?.name}
                        subtitle={
                          hotel[language]?.subtitle || hotel.es?.subtitle
                        }
                        description={buildCardExcerpt(
                          hotel[language]?.description ||
                            hotel.es?.description ||
                            [],
                        )}
                        image={hotel.featuredImage || hotel.images?.[0] || ""}
                        imageVariant="tall"
                        publishStartAt={hotel.publishStartAt}
                        publishEndAt={hotel.publishEndAt}
                        publicationEndsAt={hotel.publicationEndsAt}
                        showPublicationDates={false}
                        onCardClick={(postSlug, cardElement) =>
                          handleAgendaCardClick(postSlug, group, cardElement)
                        }
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : isRestaurantOrBarsPage ? (
            <div className="mt-4 space-y-5">
              {/* Banners de restaurantes y bares */}
              {isRestaurantsPage && !tipoParam && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className="grid grid-rows-2 gap-5 md:col-span-2">
                    <Link
                      href="/categoria/restaurantes?tipo=restaurantes"
                      className="block h-full overflow-hidden bg-black"
                      aria-label="Ir a 50 restaurantes de Santiago"
                    >
                      <img
                        src="/bannerRestaurantes/BANER%20MOVIL%2050%20RESTORANES.png"
                        alt="50 restaurantes de Santiago"
                        className="h-full w-full object-contain md:hidden"
                        loading="lazy"
                      />
                      <img
                        src="/bannerRestaurantes/BANER%20DESKTOP%2050%20RESTORANES.png"
                        alt="50 restaurantes de Santiago"
                        className="hidden h-full w-full object-contain md:block"
                        loading="lazy"
                      />
                    </Link>
                    <Link
                      href="/categoria/bares"
                      className="block h-full overflow-hidden bg-black"
                      aria-label="Ir a 50 bares de Santiago"
                    >
                      <img
                        src="/bannerRestaurantes/BANER%20MOVIL%2050%20BARES.png"
                        alt="50 bares de Santiago"
                        className="h-full w-full object-contain md:hidden"
                        loading="lazy"
                      />
                      <img
                        src="/bannerRestaurantes/BANER%20DESKTOP%2050%20BARES.png"
                        alt="50 bares de Santiago"
                        className="hidden h-full w-full object-contain md:block"
                        loading="lazy"
                      />
                    </Link>
                  </div>
                  <Link
                    href="/categoria/toprestoranes"
                    aria-label="Ir a Top Restaurantes"
                    className="block aspect-square w-full cursor-pointer overflow-hidden bg-black md:h-full"
                  >
                    <img
                      src="/bannerRestaurantes/LAtin%20amerdicans.png"
                      alt="Top Restaurantes"
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </Link>
                </div>
              )}
              {isRestaurantsPage && tipoParam === "restaurantes" && (
                <div className="space-y-4">
                  <BottomHomeBanner
                    href="/categoria/restaurantes?tipo=restaurantes"
                    src="/bannerRestaurantes/BANER DESKTOP 50 RESTORANES.png"
                    mobileSrc="/bannerRestaurantes/BANER MOVIL 50 RESTORANES.png"
                    alt="50 restaurantes de Santiago"
                  />
                </div>
              )}
              {(isBarsPage || tipoParam === "bares") && (
                <div className="space-y-4">
                  <BottomHomeBanner
                    href="/categoria/bares"
                    src="/bannerRestaurantes/BANER DESKTOP 50 BARES.png"
                    mobileSrc="/bannerRestaurantes/BANER MOVIL 50 BARES.png"
                    alt="50 bares de Santiago"
                  />
                </div>
              )}

              {/* Posts de restaurantes: en principal y ?tipo=restaurantes */}
              {isRestaurantsPage &&
                (!tipoParam || tipoParam === "restaurantes") &&
                restaurantOnlyHotels.length > 0 && (
                  <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {restaurantOnlyHotels.map((hotel) => (
                        <HotelCard
                          key={hotel.slug}
                          slug={hotel.slug}
                          name={hotel[language].name}
                          subtitle={hotel[language].subtitle}
                          description={buildCardExcerpt(
                            hotel[language].description,
                          )}
                          image={hotel.featuredImage || hotel.images?.[0] || ""}
                          publishStartAt={hotel.publishStartAt}
                          publishEndAt={hotel.publishEndAt}
                          publicationEndsAt={hotel.publicationEndsAt}
                          showPublicationDates={false}
                        />
                      ))}
                    </div>
                  </section>
                )}

              {/* Posts de bares: en /bares, ?tipo=bares, o página principal */}
              {(isBarsPage ||
                tipoParam === "bares" ||
                (isRestaurantsPage && !tipoParam)) &&
                restaurantBarsHotels.length > 0 && (
                  <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {restaurantBarsHotels.map((hotel) => (
                        <HotelCard
                          key={hotel.slug}
                          slug={hotel.slug}
                          name={hotel[language].name}
                          subtitle={hotel[language].subtitle}
                          description={buildCardExcerpt(
                            hotel[language].description,
                          )}
                          image={hotel.featuredImage || hotel.images?.[0] || ""}
                          publishStartAt={hotel.publishStartAt}
                          publishEndAt={hotel.publishEndAt}
                          publicationEndsAt={hotel.publicationEndsAt}
                          showPublicationDates={false}
                        />
                      ))}
                    </div>
                  </section>
                )}

              {finalOrderedHotels.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <p>
                    {t(
                      "No hay hoteles disponibles en esta categoría.",
                      "No hotels available in this category.",
                    )}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                {finalOrderedHotels.length > 0 ? (
                  <>
                    {finalOrderedHotels.map((hotel) => (
                      <HotelCard
                        key={hotel.slug}
                        slug={hotel.slug}
                        name={hotel[language].name}
                        subtitle={hotel[language].subtitle}
                        description={buildCardExcerpt(
                          hotel[language].description,
                        )}
                        image={hotel.featuredImage || hotel.images?.[0] || ""}
                        imageVariant={
                          slug === "monumentos-nacionales" || slug === "cafes"
                            ? "tall"
                            : "default"
                        }
                        publishStartAt={hotel.publishStartAt}
                        publishEndAt={hotel.publishEndAt}
                        publicationEndsAt={hotel.publicationEndsAt}
                        showPublicationDates={false}
                        onCardClick={
                          isAgendaCultural ? handleAgendaCardClick : undefined
                        }
                      />
                    ))}
                    {slug === "la-ruta-toyota" && (
                      <>
                        <HotelCard
                          slug="/categoria/la-ruta-toyota"
                          name="Toyota RAV4"
                          subtitle=""
                          description="Toyota RAV4 es un SUV amplio, cómodo y versátil, que se ha convertido en uno de los referentes de su categoría. Ofrece una posición de manejo elevada, buen espacio para pasajeros y equipaje, y versiones híbridas que permiten un consumo más eficiente sin perder respuesta en ruta. Es un modelo que funciona bien en el día a día, pero que también responde cuando la idea es salir de la ciudad, combinando seguridad, tecnología y una conducción confiable."
                          image="/fotosautos/RAV4 OFFROAD-44.webp"
                          showPublicationDates={false}
                          clickable={false}
                        />
                        <HotelCard
                          slug="/categoria/la-ruta-toyota"
                          name="Toyota bZ4X"
                          subtitle=""
                          description="Toyota bZ4X es el primer SUV 100% eléctrico de la marca en Chile. Es silencioso, estable y cómodo para moverse en la ciudad, con buen espacio interior y autonomía suficiente para la rutina. Mantiene el enfoque de Toyota en seguridad y confiabilidad, pero en formato completamente eléctrico."
                          image="/fotosautos/BZ4X.webp"
                          showPublicationDates={false}
                          clickable={false}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <p>
                      {t(
                        "No hay hoteles disponibles en esta categoría.",
                        "No hotels available in this category.",
                      )}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        <Footer activeCategory={slug} />
      </div>
    </Suspense>
  );
}
