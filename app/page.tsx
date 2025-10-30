"use client";

import { Header } from "@/components/header";
import { HeroSlider } from "@/components/hero-slider";
import Image from "next/image";
import Link from "next/link";
import { HotelCard } from "@/components/hotel-card";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import { buildCardExcerpt } from "@/lib/utils";
import data from "@/lib/data.json";
import { useLanguage } from "@/contexts/language-context";

export default function Page() {
  const { language } = useLanguage();
  // Mostrar todos excepto los restaurantes
  const allHotels = (data as any[]) || [];

  const isRestaurant = (h: any) => {
    const cats = (h.categories || []).map((c: string) =>
      String(c).toUpperCase()
    );
    const esCat = h.es?.category ? String(h.es.category).toUpperCase() : null;
    const enCat = h.en?.category ? String(h.en.category).toUpperCase() : null;
    return (
      cats.includes("RESTAURANTES") ||
      cats.includes("RESTAURANTS") ||
      esCat === "RESTAURANTES" ||
      enCat === "RESTAURANTS" ||
      enCat === "RESTAURANTES"
    );
  };

  const hotels = allHotels.filter((h) => !isRestaurant(h));

  // Banner por idioma (ES/EN): reemplazar las URLs cuando tengas las versiones en ambos idiomas
  const bannerByLang: Record<
    string,
    { href: string; src: string; alt: string }
  > = {
    es: {
      href: "/categoria/restaurantes",
      src: "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-28-at-5.15.32-PM.jpeg",
      alt: "Banner Restaurantes (ES)",
    },
    en: {
      href: "/categoria/restaurantes",
      src: "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-28-at-5.15.32-PM.jpeg",
      alt: "Restaurants Banner (EN)",
    },
  };
  const currentBanner = bannerByLang[language] || bannerByLang.es;

  // Hrefs por slide del slider de Home (alineado con el orden por defecto de desktopImagesDefault)
  const homeSlideHrefs = [
    "/categoria/arquitectura", // AQI ~ Arquitectura
    "/categoria/barrios", // BARRIOS
    "/categoria/iconos", // ICONOS
    "/categoria/restaurantes", // slider genérico -> Restaurantes (fallback)
    "/categoria/mercados", // MERCADOS
    "/categoria/miradores", // MIRADORES
    "/categoria/museos", // CULTURA
    "/categoria/restaurantes", // slider genérico -> Restaurantes (fallback)
    "/categoria/palacios", // PALACIOS
    "/categoria/parques", // PARQUES
    "/categoria/paseos-fuera-de-santiago", // FUERA DE SGO
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-4 max-w-[1200px]">
        <div className="hidden lg:block">
          <CategoryNav activeCategory="todos" />
        </div>

        <div className="py-2">
          {/* Layout: slider ocupa 2 columnas (lg:col-span-2) y banner 1 columna (lg:col-span-1) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Slider: ocupa 2 columnas en lg */}
            <div className="w-full lg:col-span-2">
              <div className="w-full h-[600px] md:h-[520px] lg:h-[437px] overflow-hidden">
                <HeroSlider slideHrefs={homeSlideHrefs} />
              </div>
            </div>

            {/* Banner: ocupa 1 columna en lg - imagen escala hacia abajo y fondo negro */}
            <div className="hidden lg:block w-full h-[437px] relative bg-black">
              <Link href={currentBanner.href} className="block w-full h-full">
                <img
                  src={currentBanner.src}
                  alt={currentBanner.alt}
                  className="object-scale-down object-center w-full h-full"
                />
              </Link>
            </div>
          </div>

          {/* Cards section below - full width */}
          <section className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    description={(() => {
                      const paras = Array.isArray(hotel[language]?.description)
                        ? hotel[language].description
                        : Array.isArray(hotel.en?.description)
                        ? hotel.en.description
                        : [];
                      return buildCardExcerpt(paras);
                    })()}
                    image={hotel.featuredImage || hotel.images?.[0] || ""}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer activeCategory="todos" />
    </div>
  );
}
