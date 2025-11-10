"use client";

import { Header } from "@/components/header";
import { HotelCard } from "@/components/hotel-card";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import { HeroSlider } from "@/components/hero-slider";
import { notFound } from "next/navigation";
// Dejamos de consumir data.json; consultamos al API
import { useLanguage } from "@/contexts/language-context";
import { useEffect, use, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { buildCardExcerpt } from "@/lib/utils";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

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

  const [filteredHotels, setFilteredHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Preferimos filtrar por slug de categoría en el backend
    fetch(`/api/posts?categorySlug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (!cancelled) setFilteredHotels(Array.isArray(rows) ? rows : []);
      })
      .catch(() => !cancelled && setFilteredHotels([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

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

  const searchParams = useSearchParams();
  const comunaParam = searchParams.get("comuna");
  const [selectedComuna, setSelectedComuna] = useState<string | null>(null);

  useEffect(() => {
    if (comunaParam) {
      setSelectedComuna(comunaParam.replace(/-/g, " "));
    } else {
      setSelectedComuna(null);
    }
  }, [comunaParam, slug]);

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
    : enrichedHotels;

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
              <CategoryNav activeCategory={slug} compact />
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
          {loading ? (
            <div className="w-full py-16 grid place-items-center text-gray-500">
              <div className="flex items-center gap-2">
                <Spinner className="size-5" /> Cargando…
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
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
          )}
        </main>

        <Footer activeCategory={slug} />
      </div>
    </Suspense>
  );
}
