"use client";

import { Header } from "@/components/header.home-v2";
import { HeroSlider } from "@/components/hero-slider";
import Link from "next/link";
import Image from "next/image";
import { HotelCard } from "@/components/hotel-card";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import { buildCardExcerpt } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/contexts/language-context";
import { useSiteApi } from "@/hooks/use-site-api";
import {
  BottomHomeBanner,
  PromoStackBanners,
} from "@/components/home-promo-banners.home-v2";

const HOME_PAGE_SIZE = 25;
const HOME_CACHE_TTL_MS = 1000 * 60 * 5;

type HomeCacheEntry = {
  items: any[];
  nextOffset: number;
  hasMore: boolean;
  savedAt: number;
};

const homeFeedCache = new Map<string, HomeCacheEntry>();

export default function Page() {
  const { language } = useLanguage();
  const { fetchWithSite, previewSite } = useSiteApi();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextOffset, setNextOffset] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  const cacheKey = previewSite || "default";

  const updateCache = useCallback(
    (items: any[], offset: number, more: boolean) => {
      homeFeedCache.set(cacheKey, {
        items,
        nextOffset: offset,
        hasMore: more,
        savedAt: Date.now(),
      });
    },
    [cacheKey],
  );

  const loadPage = useCallback(
    async (offset: number, append: boolean) => {
      const res = await fetchWithSite(
        `/api/posts?homeFeed=1&limit=${HOME_PAGE_SIZE}&offset=${offset}`,
        { cache: "no-store" },
      );
      const rows = res.ok ? await res.json() : [];
      const batch = Array.isArray(rows) ? rows : [];
      const more = batch.length === HOME_PAGE_SIZE;
      const newOffset = offset + batch.length;

      setHasMore(more);
      setNextOffset(newOffset);
      setHotels((prev) => {
        const nextItems = append ? [...prev, ...batch] : batch;
        updateCache(nextItems, newOffset, more);
        return nextItems;
      });
    },
    [fetchWithSite, updateCache],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const cached = homeFeedCache.get(cacheKey);
      const isFresh = cached && Date.now() - cached.savedAt < HOME_CACHE_TTL_MS;

      if (isFresh && cached.items.length > 0) {
        if (cancelled) return;
        setHotels(cached.items);
        setNextOffset(cached.nextOffset);
        setHasMore(cached.hasMore);
        setLoading(false);
        return;
      }

      try {
        await loadPage(0, false);
      } catch {
        if (!cancelled) {
          setHotels([]);
          setHasMore(false);
          setNextOffset(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, loadPage]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (loadingMoreRef.current) return;

        loadingMoreRef.current = true;
        setLoadingMore(true);
        loadPage(nextOffset, true)
          .catch(() => undefined)
          .finally(() => {
            loadingMoreRef.current = false;
            setLoadingMore(false);
          });
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadPage, loading, nextOffset]);

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
                  mobileImages={[
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
                  objectPosition="left"
                  mobileStaticFirst
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

            {/* Columna 2: Imagen vertical (placeholder: mismo banner, reemplazar cuando tengas el definitivo) */}
            <div className="w-full mt-6 lg:mt-0">
              <Link
                href="/restaurantes"
                aria-label="Ir a restaurantes"
                className="block w-full"
              >
                <div className="w-full h-[260px] md:h-[520px] lg:h-[437px] bg-black overflow-hidden flex items-center justify-center">
                  <Image
                    src="/bannerHome/restaurantes movil.png"
                    alt="Restaurantes"
                    width={900}
                    height={1400}
                    sizes="100vw"
                    className="max-w-full max-h-full object-contain p-3 md:hidden"
                    loading="lazy"
                  />
                  <Image
                    src="/bannerHome/65 RESTAURANTES.svg"
                    alt="Restaurantes"
                    width={435}
                    height={437}
                    sizes="(max-width: 1279px) 100vw, 435px"
                    className="hidden md:block max-w-full max-h-full object-contain p-3 md:p-4 lg:p-5"
                    loading="lazy"
                    unoptimized
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
                {hotels.map((hotel, index) => (
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
                      imagePriority={index < 3}
                      publishStartAt={hotel.publishStartAt}
                      publishEndAt={hotel.publishEndAt}
                      publicationEndsAt={hotel.publicationEndsAt}
                    />
                  </div>
                ))}
              </div>
            )}

            {!loading ? (
              <>
                <div
                  ref={loadMoreRef}
                  className="h-px w-full"
                  aria-hidden="true"
                />
                {loadingMore ? (
                  <div className="w-full py-8 grid place-items-center text-gray-500">
                    <div className="flex items-center gap-2">
                      <Spinner className="size-4" /> Cargando más posts…
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        </div>
      </main>
      <Footer activeCategory="todos" />
    </div>
  );
}
