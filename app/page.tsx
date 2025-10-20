"use client";

import { Header } from "@/components/header";
import { HeroSlider } from "@/components/hero-slider";
import Image from "next/image";
import { HotelCard } from "@/components/hotel-card";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import arquitectura from "@/lib/arquitectura.json";
import { useLanguage } from "@/contexts/language-context";

export default function Page() {
  const { language } = useLanguage();

  // Mostrar sólo las tarjetas de la categoría Arquitectura (lib/arquitectura.json)
  const hotels = (arquitectura as any[]) || [];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="hidden lg:block">
          <CategoryNav activeCategory="todos" />
        </div>

        <div className="py-2">
          {/* Layout: slider ocupa 2 columnas (lg:col-span-2) y banner 1 columna (lg:col-span-1) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Slider: ocupa 2 columnas en lg */}
            <div className="w-full lg:col-span-2">
              <div className="w-full h-[600px] md:h-[520px] lg:h-[437px] overflow-hidden">
                <HeroSlider />
              </div>
            </div>

            {/* Banner: ocupa 1 columna en lg */}
            <div className="hidden lg:block w-full h-[437px] relative">
              <Image
                src="/Group-83.webp"
                alt="Banner"
                fill
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>

          {/* Cards section below - full width */}
          <section className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel.slug} className="col-span-1">
                  <HotelCard
                    slug={hotel.slug}
                    name={
                      hotel[language]?.name || hotel.en?.name || hotel.es?.name
                    }
                    subtitle={
                      hotel[language]?.subtitle ||
                      hotel.en?.subtitle ||
                      hotel.es?.subtitle
                    }
                    description={
                      Array.isArray(hotel[language]?.description)
                        ? hotel[language].description[0]
                        : Array.isArray(hotel.en?.description)
                        ? hotel.en.description[0]
                        : ""
                    }
                    image={hotel.images?.[0]}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
