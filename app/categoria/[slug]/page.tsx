"use client";

import { Header } from "@/components/header";
import { HotelCard } from "@/components/hotel-card";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import { notFound } from "next/navigation";
import { getHotelsByCategory } from "@/lib/hotels-data";
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
];

type ResolvedParams = { slug: string };

export default function CategoryPage({
  params,
}: {
  params: Promise<ResolvedParams> | ResolvedParams;
}) {
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
  };

  const categoryName = categoryMap[slug] || slug.toUpperCase();
  const filteredHotels = getHotelsByCategory(categoryName);

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
