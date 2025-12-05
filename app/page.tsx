"use client";

import { Header } from "@/components/header";
import { HeroSlider } from "@/components/hero-slider";
import Image from "next/image";
import Link from "next/link";
import { HotelCard } from "@/components/hotel-card";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import { buildCardExcerpt } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/contexts/language-context";

export default function Page() {
  const { language } = useLanguage();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/posts")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        const filtered = list.filter((h) => {
          const cats = new Set<string>([
            ...(h.categories || []).map((c: any) => String(c).toUpperCase()),
          ]);
          const esCat = h.es?.category
            ? String(h.es.category).toUpperCase()
            : null;
          const enCat = h.en?.category
            ? String(h.en.category).toUpperCase()
            : null;
          // Excluir restaurantes y el post w-santiago
          if (String(h.slug) === "w-santiago") return false;
          return !(
            cats.has("RESTAURANTES") ||
            cats.has("RESTAURANTS") ||
            esCat === "RESTAURANTES" ||
            enCat === "RESTAURANTS" ||
            enCat === "RESTAURANTES"
          );
        });
        // Orden aleatorio en Home cada vez que se entra
        const shuffled = (() => {
          const arr = filtered.slice();
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr;
        })();
        setHotels(shuffled);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setHotels([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Banner por idioma (ES/EN): reemplazar las URLs cuando tengas las versiones en ambos idiomas
  const bannerByLang: Record<
    string,
    { href: string; src: string; alt: string }
  > = {
    es: {
      href: "/restaurantes",
      src: "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-28-at-5.15.32-PM.jpeg",
      alt: "Banner Restaurantes (ES)",
    },
    en: {
      href: "/restaurantes",
      src: "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-28-at-5.15.32-PM.jpeg",
      alt: "Restaurants Banner (EN)",
    },
  };
  const currentBanner = bannerByLang[language] || bannerByLang.es;

  // Href global del slider de Home: al hacer clic en cualquier slide, ir a Restaurantes
  const homeSliderHref = "/restaurantes";

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="site-inner py-4">
        <div className="hidden lg:block">
          <CategoryNav activeCategory="todos" />
        </div>

        <div className="py-2">
          {/* Layout: slider ocupa 2 columnas (lg:col-span-2) y banner 1 columna (lg:col-span-1) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6 items-start">
            {/* Slider: ocupa 2 columnas en lg */}
            <div className="w-full lg:col-span-2">
              {/* Volvemos a alturas responsivas como estaba antes */}
              <div className="w-full md:h-[520px] lg:h-[437px] overflow-visible">
                <HeroSlider
                  // Reordenado: iconos primero para alinear con nuevo orden de imágenes
                  slideHrefs={[
                    "/iconos",
                    "/barrios",
                    "/mercados",
                    "/miradores",
                    "/museos",
                    "/palacios",
                    "/parques",
                    "/paseos-fuera-de-santiago",
                    "/arquitectura",
                  ]}
                  // Subimos los puntos en la vista
                  dotBottom={24}
                />
              </div>
            </div>

            {/* Banner: separación simétrica arriba y abajo en mobile (mt-6) */}
            <div className="block w-full h-[437px] relative bg-black mt-6 lg:mt-0">
              <Link href={currentBanner.href} className="block w-full h-full">
                <img
                  src={currentBanner.src}
                  alt={currentBanner.alt}
                  className="object-contain object-center w-full h-full"
                />
              </Link>
            </div>
          </div>

          {/* Cards section below - full width */}
          <section className="mt-6">
            {loading ? (
              <div className="w-full py-16 grid place-items-center text-gray-500">
                <div className="flex items-center gap-2">
                  <Spinner className="size-5" /> Cargando…
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {hotels.map((hotel) => (
                  <div key={hotel.slug} className="col-span-1">
                    <HotelCard
                      slug={hotel.slug}
                      name={
                        hotel[language]?.name ||
                        hotel.en?.name ||
                        hotel.es?.name
                      }
                      subtitle={
                        hotel[language]?.subtitle ||
                        hotel.en?.subtitle ||
                        hotel.es?.subtitle
                      }
                      description={(() => {
                        const paras = Array.isArray(
                          hotel[language]?.description
                        )
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
            )}
          </section>
        </div>
      </main>
      <Footer activeCategory="todos" />
    </div>
  );
}
