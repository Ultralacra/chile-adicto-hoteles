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

  // Placeholder images for restaurants slider/banner — replace with your real URLs
  const restaurantDesktopImages = [
    "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/10/SLIDER-RESTAURANTES.webp",
    "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/10/SLIDER-RESTAURANTES-2.webp",
  ];
  const restaurantMobileImages = [
    "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/10/SLIDER-RESTAURANTES.webp",
    "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/10/SLIDER-RESTAURANTES-2.webp",
  ];

  // Apply comuna filter if selectedComuna is set (match in descriptions or address)
  const finalHotels = selectedComuna
    ? filteredHotels.filter((h) => {
        const haystack = [
          ...(Array.isArray(h.es?.description) ? h.es.description : []),
          ...(Array.isArray(h.en?.description) ? h.en.description : []),
          h.address || "",
        ]
          .join(" ")
          .toUpperCase();
        return haystack.includes(String(selectedComuna).toUpperCase());
      })
    : filteredHotels;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        {isRestaurantsPage ? (
          // Submenú de comunas para restaurantes con primer item "VOLVER"
          <nav className="py-4">
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
          <CategoryNav activeCategory={slug} />
        )}

        {/* Banner + Slider for restaurants - show only when no comuna is selected */}
        {isRestaurantsPage && !selectedComuna && (
          <div className="py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="w-full lg:col-span-2 h-[437px]">
                <HeroSlider
                  desktopImages={restaurantDesktopImages}
                  mobileImages={restaurantMobileImages}
                />
              </div>
              <div className="hidden lg:block w-full h-[437px] relative bg-black">
                <img
                  src="https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/10/Group-84-3.webp"
                  alt="Banner Restaurantes"
                  className="object-scale-down object-center w-full h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contador oculto por solicitud: se elimina el conteo de posts */}

        {/* Hotel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
          {finalHotels.length > 0 ? (
            finalHotels.map((hotel) => (
              <HotelCard
                key={hotel.slug}
                slug={hotel.slug}
                name={hotel[language].name}
                subtitle={hotel[language].subtitle}
                description={buildCardExcerpt(hotel[language].description)}
                image={hotel.images[0]}
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
