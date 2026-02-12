"use client";

import { Header } from "@/components/header";
import { HeroSlider } from "@/components/hero-slider";
import Image from "next/image";
import Link from "next/link";
import { HotelCard } from "@/components/hotel-card";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import { buildCardExcerpt } from "@/lib/utils";
import { isHiddenFrontPost } from "@/lib/post-visibility";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/contexts/language-context";
import { useSiteApi } from "@/hooks/use-site-api";

export default function Page() {
  const { language } = useLanguage();
  const { fetchWithSite } = useSiteApi();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchWithSite("/api/posts")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        const filtered = list.filter((h) => {
          if (isHiddenFrontPost(h)) return false;

          // Excluir posts específicos por slug
          if (String(h.slug) === "w-santiago") return false;

          const cats = new Set<string>([
            ...(h.categories || []).map((c: any) => String(c).toUpperCase()),
          ]);
          const esCat = h.es?.category
            ? String(h.es.category).toUpperCase()
            : null;
          const enCat = h.en?.category
            ? String(h.en.category).toUpperCase()
            : null;

          // Categorías que NO deben aparecer en el feed "todos"
          const excluded = new Set<string>([
            "RESTAURANTES",
            "RESTAURANTS",
            "CAFES",
            "CAFÉ",
            "CAFÉS",
            "AGENDA CULTURAL",
            "MONUMENTOS NACIONALES",
          ]);

          const hasExcludedCat = [...cats].some((c) => excluded.has(c));
          const transExcluded =
            (esCat && excluded.has(esCat)) || (enCat && excluded.has(enCat));

          return !(hasExcludedCat || transExcluded);
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
  }, [fetchWithSite]);

  // Banner por idioma (ES/EN): reemplazar las URLs cuando tengas las versiones en ambos idiomas
  const bannerByLang: Record<
    string,
    { href: string; src: string; alt: string }
  > = {
    es: {
      href: "/restaurantes",
      src: "/bannerHome/65 RESTAURANTES.svg",
      alt: "Banner Restaurantes (ES)",
    },
    en: {
      href: "/restaurantes",
      src: "/bannerHome/65 RESTAURANTES.svg",
      alt: "Restaurants Banner (EN)",
    },
  };
  const currentBanner = bannerByLang[language] || bannerByLang.es;

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
                  sliderKeyDesktop="home-desktop"
                  sliderKeyMobile="home-mobile"
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
                  preferApiHrefs
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
                          hotel[language]?.description,
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
