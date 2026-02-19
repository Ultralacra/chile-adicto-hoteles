"use client";

import { Header } from "@/components/header.home-v2";
import { HeroSlider } from "@/components/hero-slider";
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
import {
  BottomHomeBanner,
  PromoStackBanners,
} from "@/components/home-promo-banners.home-v2";

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
          const cats = new Set<string>([
            ...(h.categories || []).map((c: any) => String(c).toUpperCase()),
          ]);
          const esCat = h.es?.category
            ? String(h.es.category).toUpperCase()
            : null;
          const enCat = h.en?.category
            ? String(h.en.category).toUpperCase()
            : null;
          // Excluir posts específicos por slug
          if (String(h.slug) === "w-santiago") return false;

          // Categorías que NO deben aparecer en el feed "todos"
          // (restaurantes/cafes/agenda cultural/monumentos nacionales)
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="site-inner py-4">
        <div className="hidden lg:block">
          <CategoryNav activeCategory="todos" />
        </div>

        <div className="py-2">
          {/* Layout: 3 columnas (laterales más anchas, centro más angosta) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.7fr_1.15fr] gap-0 lg:gap-4 items-start">
            {/* Columna 1: Slider */}
            <div className="w-full">
              <div className="w-full md:h-[520px] lg:h-[437px] overflow-visible">
                {/*
                <HeroSlider
                  sliderKeyDesktop="home-desktop"
                  sliderKeyMobile="home-mobile"
                  objectPosition="left"
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
                  dotBottom={24}
                />
                */}
                <HeroSlider
                  desktopImages={[
                    "/sliderHome/ICONOS.png",
                    "/sliderHome/ARQ.png",
                    "/sliderHome/BARRIOS.png",
                    "/sliderHome/MERCADOS.png",
                    "/sliderHome/MIRADORES.png",
                    "/sliderHome/CULTURA.png",
                    "/sliderHome/PALACIOS.png",
                    "/sliderHome/PARQUES.png",
                    "/sliderHome/FUERA DE STGO.png",
                  ]}
                  sliderKeyMobile="home-mobile"
                  objectPosition="left"
                  slideHrefs={[
                    "/iconos",
                    "/arquitectura",
                    "/barrios",
                    "/mercados",
                    "/miradores",
                    "/museos",
                    "/palacios",
                    "/parques",
                    "/paseos-fuera-de-santiago",
                  ]}
                  dotBottom={24}
                />
              </div>
            </div>

            {/* Columna 2: Banner de restaurantes (móvil y escritorio) */}
            <div className="w-full mt-6 lg:mt-0">
              <Link
                href="/restaurantes"
                aria-label="Ir a restaurantes"
                className="block w-full"
              >
                <div className="w-full h-[260px] md:h-[520px] lg:h-[437px] bg-black overflow-hidden flex items-center justify-center">
                  <img
                    src="/bannerHome/restaurantes movil.png"
                    alt="Restaurantes"
                    className="max-w-full max-h-full object-contain p-3 md:hidden"
                    loading="lazy"
                  />
                  <img
                    src="/bannerHome/65 RESTAURANTES.svg"
                    alt="Restaurantes"
                    className="hidden md:block max-w-full max-h-full object-contain p-3 md:p-4 lg:p-5"
                    loading="lazy"
                  />
                </div>
              </Link>
            </div>

            {/* Columna 3: 2 banners apilados */}
            <div className="w-full mt-[18px] lg:mt-0">
              <PromoStackBanners />
            </div>
          </div>

          {/* Banner adicional debajo del slider (se mantiene además de los 2 laterales) */}
          <div className="w-full mt-[18px] md:mt-6">
            <BottomHomeBanner />
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
                      imageVariant="default"
                      publishStartAt={hotel.publishStartAt}
                      publishEndAt={hotel.publishEndAt}
                      publicationEndsAt={hotel.publicationEndsAt}
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
