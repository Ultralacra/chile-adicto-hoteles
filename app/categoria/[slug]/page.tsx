"use client";

import { Header } from "@/components/header";
import { HotelCard } from "@/components/hotel-card";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import { HeroSlider } from "@/components/hero-slider";
import { notFound } from "next/navigation";
import data from "@/lib/data.json";
import { useLanguage } from "@/contexts/language-context";
import { useEffect, use, useState } from "react";
import { buildCardExcerpt } from "@/lib/utils";
import Link from "next/link";

const validCategories = [
  "norte",
  "centro",
  "sur",
  "isla-de-pascua",
  "santiago",
  "guia-impresa",
  "prensa",
  "nosotros",
  "exploraciones-tnf",
  // new categories added
  "arquitectura",
  "barrios",
  "iconos",
  "mercados",
  "miradores",
  "museos",
  "restaurantes",
  "palacios",
  "parques",
  "paseos-fuera-de-santiago",
];

type ResolvedParams = { slug: string };

export default function CategoryPage({ params }: { params: any }) {
  const resolvedParams = use(params as any) as ResolvedParams;
  const { slug } = resolvedParams;
  const { language, t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!validCategories.includes(slug)) {
    notFound();
  }

  const categoryMap: { [key: string]: string } = {
    norte: "NORTE",
    centro: "CENTRO",
    sur: "SUR",
    "isla-de-pascua": "ISLA DE PASCUA",
    santiago: "SANTIAGO",
    "exploraciones-tnf": "EXPLORACIONES TNF",
    // new category name mappings
    arquitectura: "ARQUITECTURA",
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
  };

  const categoryName = categoryMap[slug] || slug.toUpperCase();

  // Candidates: include possible English/Spanish variants for some categories
  const categoryCandidatesMap: { [key: string]: string[] } = {
    arquitectura: ["ARQUITECTURA", "ARCHITECTURE"],
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

  // Use data.json as main source; compare normalized uppercase values
  let filteredHotels = (data as unknown as any[]).filter((h) => {
    const entryCats = (h.categories || []).map((c: any) =>
      String(c).toUpperCase()
    );
    const enCat = h.en?.category ? String(h.en.category).toUpperCase() : null;
    const esCat = h.es?.category ? String(h.es.category).toUpperCase() : null;

    return candidates.some((cand) => {
      const C = String(cand).toUpperCase();
      return entryCats.includes(C) || enCat === C || esCat === C;
    });
  });

  const isRestaurantsPage = slug === "restaurantes";

  // Communes submenu for restaurantes category
  const communes = [
    "Vitacura",
    "Las Condes",
    "Santiago",
    "Lo Barnechea",
    "Providencia",
    "Alto Jahuel",
    "La Reina",
  ];

  const [selectedComuna, setSelectedComuna] = useState<string | null>(null);

  useEffect(() => {
    // read comuna from query string, e.g. ?comuna=las-condes
    try {
      const params = new URLSearchParams(window.location.search);
      const c = params.get("comuna");
      if (c) {
        // de-slugify: replace - with space and normalize
        const decoded = c.replace(/-/g, " ");
        setSelectedComuna(decoded);
      } else {
        setSelectedComuna(null);
      }
    } catch (e) {
      setSelectedComuna(null);
    }
  }, [slug]);

  // Cargar imágenes del slider de restaurantes desde /public/imagenes-slider/manifest.json
  // Soporta dos formatos de manifest:
  // 1) Array simple de strings ["img1.webp", "img2.webp", ...]
  // 2) Objeto por idioma { es: string[], en: string[] }
  const [restaurantSliderImages, setRestaurantSliderImages] = useState<
    string[]
  >([]);
  const [restaurantSlideHrefs, setRestaurantSlideHrefs] = useState<string[]>(
    []
  );
  useEffect(() => {
    if (!isRestaurantsPage) return;
    let cancelled = false;
    fetch("/imagenes-slider/manifest.json")
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
              Boolean
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
              const key = normKey(base); // ackitchen

              let matchSlug: string | null = null;
              for (const row of restaurantIndex) {
                if (
                  row.keys.some(
                    (k: string) => k.startsWith(key) || key.startsWith(k)
                  )
                ) {
                  matchSlug = row.slug;
                  break;
                }
              }

              if (!matchSlug) {
                // Fallback: derivar slug del base por si acaso
                matchSlug = base
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
              }
              return `/lugar/${matchSlug}`;
            });
        };

        if (Array.isArray(payload)) {
          // Formato antiguo: array simple
          setRestaurantSliderImages(normalizeList(payload));
          setRestaurantSlideHrefs(buildHrefsFromFilenames(payload));
          return;
        }

        if (payload && typeof payload === "object") {
          const byLang =
            (payload as any)[language] ||
            (payload as any)["es"] ||
            (payload as any)["en"];
          setRestaurantSliderImages(normalizeList(byLang));
          setRestaurantSlideHrefs(buildHrefsFromFilenames(byLang));
          return;
        }

        setRestaurantSliderImages([]);
        setRestaurantSlideHrefs([]);
      })
      .catch(() => {
        setRestaurantSliderImages([]);
        setRestaurantSlideHrefs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isRestaurantsPage, language]);

  // Apply comuna filter if selectedComuna is set (match in descriptions or address)
  const finalHotels = selectedComuna
    ? filteredHotels.filter((h) => {
        // Construir un texto de búsqueda que incluya:
        // - descripciones ES/EN
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

        const haystack = parts.join(" ").toUpperCase();
        return haystack.includes(String(selectedComuna).toUpperCase());
      })
    : filteredHotels;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="site-inner py-4">
        {isRestaurantsPage ? (
          // Submenú de comunas para restaurantes con primer item "VOLVER"
          <nav className="py-4 hidden lg:block">
            <ul className="hidden lg:flex flex-nowrap items-center gap-2 text-sm font-medium whitespace-nowrap">
              {/* VOLVER - limpia filtro y vuelve al listado de restaurantes */}
              <li className="flex items-center gap-2">
                <Link
                  href="/categoria/restaurantes"
                  className={`font-neutra hover:text-[var(--color-brand-red)] transition-colors tracking-wide text-[15px] leading-[20px] ${
                    !selectedComuna
                      ? "text-[var(--color-brand-red)]"
                      : "text-black"
                  }`}
                  onClick={() => setSelectedComuna(null)}
                >
                  {t("VOLVER", "BACK")}
                </Link>
                <span className="text-black">•</span>
              </li>
              {communes.map((c, index) => {
                const slugified = c.toLowerCase().replace(/\s+/g, "-");
                const isActive =
                  selectedComuna &&
                  selectedComuna.toLowerCase() === c.toLowerCase();
                return (
                  <li key={c} className="flex items-center gap-2">
                    <Link
                      href={`/categoria/restaurantes?comuna=${slugified}`}
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
            <CategoryNav activeCategory={slug} />
          </div>
        )}

        {/* Slider de restaurantes a ancho completo, sin banner, solo cuando no hay comuna seleccionada */}
        {isRestaurantsPage && !selectedComuna && (
          <div className="py-2">
            <div className="w-full overflow-hidden mb-0">
              <HeroSlider
                desktopImages={restaurantSliderImages}
                mobileImages={restaurantSliderImages}
                // Ver imagen completa sin recortar y mantener el ancho del contenedor
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {finalHotels.length > 0 ? (
            finalHotels.map((hotel) => (
              <HotelCard
                key={hotel.slug}
                slug={hotel.slug}
                name={hotel[language].name}
                subtitle={hotel[language].subtitle}
                description={buildCardExcerpt(hotel[language].description)}
                image={hotel.featuredImage || hotel.images?.[0] || ""}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p>
                {t(
                  "No hay hoteles disponibles en esta categoría.",
                  "No hotels available in this category."
                )}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer activeCategory={slug} />
    </div>
  );
}
