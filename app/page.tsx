"use client";

import { Header } from "@/components/header";
import { HeroSlider } from "@/components/hero-slider";
import { HotelCard } from "@/components/hotel-card";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import { hotelsData } from "@/lib/hotels-data";
import { useLanguage } from "@/contexts/language-context";

export default function Page() {
  const { language } = useLanguage();

  const hotels = hotelsData.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="hidden lg:block">
          <CategoryNav activeCategory="todos" />
        </div>

        <div className="-mx-4 md:-mx-8 py-2">
          <HeroSlider />
        </div>

        <section className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.slug}
                slug={hotel.slug}
                name={hotel[language].name}
                subtitle={hotel[language].subtitle}
                description={hotel[language].description[0]}
                image={hotel.images[0]}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
