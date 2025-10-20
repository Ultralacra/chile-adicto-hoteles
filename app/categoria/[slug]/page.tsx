"use client";

import { Header } from "@/components/header";
import { HotelCard } from "@/components/hotel-card";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import { notFound } from "next/navigation";
import arquitecturaData from "@/lib/arquitectura.json";
import { useLanguage } from "@/contexts/language-context";
import { useEffect, use } from "react";

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
  "cultura",
  "palacios",
  "parques",
  "fuera-de-stgo",
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
    cultura: "CULTURA",
    palacios: "PALACIOS",
    parques: "PARQUES",
    "fuera-de-stgo": "FUERA DE STGO",
  };

  const categoryName = categoryMap[slug] || slug.toUpperCase();

  // Candidates: include possible English/Spanish variants for some categories
  const categoryCandidatesMap: { [key: string]: string[] } = {
    arquitectura: ["ARQUITECTURA", "ARCHITECTURE"],
    "isla-de-pascua": ["ISLA DE PASCUA", "EASTER ISLAND"],
    // add other special cases if needed
  };

  const candidates = categoryCandidatesMap[slug] || [categoryName];

  // Use arquitectura.json as main source; compare normalized uppercase values
  let filteredHotels = (arquitecturaData as unknown as any[]).filter((h) => {
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <CategoryNav activeCategory={slug} />

        {/* Hotel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.slug}
                slug={hotel.slug}
                name={hotel[language].name}
                subtitle={hotel[language].subtitle}
                description={hotel[language].description[0]}
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

      <Footer />
    </div>
  );
}
