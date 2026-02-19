"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useSiteApi } from "@/hooks/use-site-api";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Reordenado: ICONOS debe ser el primer slide según solicitud.
// iconos, arquitectura, barrios, mercados, miradores, museos (CULTURA),
// palacios, parques, paseos-fuera-de-santiago, restaurantes
const desktopImagesDefault = [
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/ICONOS-scaled.webp", // Iconos (primero)
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/AQI-scaled.webp", // Arquitectura
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/BARRIOS-scaled.webp", // Barrios
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/MERCADOS-scaled.webp", // Mercados
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/MIRADORES-scaled.webp", // Miradores
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/CULTURA-scaled.webp", // Museos (Cultura)
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/PALACIOS-scaled.webp", // Palacios
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/PARQUES-scaled.webp", // Parques
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/FUERA-DE-SGO-scaled.webp", // Fuera de Stgo
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/slider-100-scaled.webp", // Restaurantes (promo)
];

// Para evitar desajuste de dots entre desktop y mobile, mantenemos la misma
// cantidad y orden de imágenes por defecto en mobile.
const mobileImagesDefault = [...desktopImagesDefault];

type HeroSliderProps = {
  desktopImages?: string[];
  mobileImages?: string[];
  sliderKeyDesktop?: string;
  sliderKeyMobile?: string;
  objectFit?: "cover" | "contain"; // cover por defecto; contain para no recortar
  objectPosition?: "center" | "top" | "bottom" | "left" | "right"; // alineación vertical/horizontal del objeto
  desktopHeight?: number; // alto del slide desktop en px (por defecto 437)
  mobileHeight?: number; // alto del slide mobile en px (por defecto 550)
  dotActiveClass?: string; // clase tailwind para punto activo
  dotInactiveClass?: string; // clase tailwind para punto inactivo
  dotBottom?: number; // espacio en px desde el fondo para los dots (por defecto 16)
  slideHref?: string; // si se define, cada slide será un enlace a esta ruta
  slideHrefs?: string[]; // hrefs por slide; tiene prioridad sobre slideHref
  slideHrefsMobile?: string[]; // hrefs específicos para mobile; si no se provee, cae en slideHrefs
  preferApiHrefs?: boolean; // si true, los hrefs cargados por API tienen prioridad sobre los props
  autoplay?: boolean; // si false, desactiva avance automático
  showArrows?: boolean; // si true, muestra flechas de navegación manual
  mobileStaticFirst?: boolean; // si true, en mobile muestra solo la primera imagen (sin carrusel)
  autoHeight?: boolean; // si true, la altura se adapta a la imagen (w-full h-auto)
  desktopImageClassName?: string; // clases extra para imagen desktop
  mobileImageClassName?: string; // clases extra para imagen mobile
};

export function HeroSlider({
  desktopImages,
  mobileImages,
  sliderKeyDesktop,
  sliderKeyMobile,
  objectFit = "cover",
  objectPosition = "center",
  desktopHeight = 437,
  mobileHeight = 550,
  dotActiveClass = "bg-[#E40E36] w-3 h-3",
  dotInactiveClass = "bg-white w-2 h-2",
  dotBottom = 28,
  slideHref,
  slideHrefs,
  slideHrefsMobile,
  preferApiHrefs = false,
  autoplay = true,
  showArrows = false,
  mobileStaticFirst = false,
  autoHeight = false,
  desktopImageClassName,
  mobileImageClassName,
}: HeroSliderProps) {
  const { fetchWithSite } = useSiteApi();
  // Estado para imágenes obtenidas desde API (si existen en /public/slider-*)
  const [desktopFromApi, setDesktopFromApi] = useState<string[] | null>(null);
  const [mobileFromApi, setMobileFromApi] = useState<string[] | null>(null);
  const [desktopHrefsFromApi, setDesktopHrefsFromApi] = useState<
    string[] | null
  >(null);
  const [mobileHrefsFromApi, setMobileHrefsFromApi] = useState<string[] | null>(
    null,
  );
  const [desktopLoadedFromDb, setDesktopLoadedFromDb] = useState(false);
  const [mobileLoadedFromDb, setMobileLoadedFromDb] = useState(false);

  // Elegir fuentes en orden de prioridad: props -> API -> defaults
  const desktop =
    desktopImages !== undefined
      ? desktopImages
      : ((desktopFromApi && desktopFromApi.length
          ? desktopFromApi
          : undefined) ?? desktopImagesDefault);
  const mobile =
    mobileImages !== undefined
      ? mobileImages
      : ((mobileFromApi && mobileFromApi.length ? mobileFromApi : undefined) ??
        mobileImagesDefault);

  // Embla for desktop and mobile instances
  const [emblaDesktopRef, emblaDesktopApi] = useEmblaCarousel({ loop: true });
  const [emblaMobileRef, emblaMobileApi] = useEmblaCarousel({ loop: true });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // Detectar breakpoint activo (md: 768px)
  useEffect(() => {
    const check = () => {
      if (typeof window === "undefined") return;
      const mq = window.matchMedia("(max-width: 767.98px)");
      setIsMobile(mq.matches);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Autoplay solo sobre el carrusel activo
  useEffect(() => {
    if (!autoplay) return;
    const api = isMobile ? emblaMobileApi : emblaDesktopApi;
    if (!api) return;
    const id = setInterval(() => api.scrollNext(), 5000);
    return () => clearInterval(id);
  }, [autoplay, isMobile, emblaDesktopApi, emblaMobileApi]);

  // Cargar imágenes locales desde API si no se pasaron por props
  useEffect(() => {
    let cancelled = false;
    async function loadFromApi() {
      try {
        // Reset del origen en cada carga (para no dejar flags antiguos)
        setDesktopLoadedFromDb(false);
        setMobileLoadedFromDb(false);

        // Si ya nos pasaron props, no hacemos fetch innecesario
        const needDesktop = desktopImages === undefined;
        const needMobile = mobileImages === undefined;
        if (!needDesktop && !needMobile) return;

        // 1) Preferir sliders desde BD (si se indicó key)
        const loadSet = async (key: string) => {
          const res = await fetchWithSite(
            `/api/sliders/${encodeURIComponent(key)}`,
            {
              cache: "no-store",
            },
          );
          if (!res.ok) return { images: [], hrefs: [] };
          const json = (await res.json()) as {
            key?: string;
            items?: Array<{
              image_url?: string;
              href?: string | null;
              active?: boolean;
            }>;
          };
          const items = Array.isArray(json?.items) ? json.items : [];
          const activeItems = items.filter((it) => it?.active !== false);
          const images = activeItems
            .map((it) => String(it?.image_url || "").trim())
            .filter(Boolean);
          const hrefs = activeItems.map((it) =>
            it?.href ? String(it.href).trim() : "",
          );
          return { images, hrefs };
        };

        const didLoadFromDb = async () => {
          let used = false;
          if (needDesktop && sliderKeyDesktop) {
            const { images, hrefs } = await loadSet(sliderKeyDesktop);
            if (cancelled) return true;
            if (images.length) {
              setDesktopFromApi(images);
              setDesktopHrefsFromApi(hrefs);
              setDesktopLoadedFromDb(true);
              used = true;
            }
          }
          if (needMobile && sliderKeyMobile) {
            const { images, hrefs } = await loadSet(sliderKeyMobile);
            if (cancelled) return true;
            if (images.length) {
              setMobileFromApi(images);
              setMobileHrefsFromApi(hrefs);
              setMobileLoadedFromDb(true);
              used = true;
            }
          }
          return used;
        };

        const usedDb = await didLoadFromDb();
        if (usedDb) return;

        // 2) Fallback legacy: /api/slider-images (carpetas públicas)
        const res = await fetchWithSite("/api/slider-images", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as {
          desktop: string[];
          mobile: string[];
        };
        if (cancelled) return;
        if (needDesktop && Array.isArray(json.desktop)) {
          setDesktopFromApi(json.desktop);
        }
        if (needMobile && Array.isArray(json.mobile)) {
          setMobileFromApi(json.mobile);
        }
      } catch (e) {
        // Silencioso: mantenemos defaults
      }
    }
    loadFromApi();
    return () => {
      cancelled = true;
    };
  }, [
    desktopImages,
    mobileImages,
    sliderKeyDesktop,
    sliderKeyMobile,
    fetchWithSite,
  ]);

  const hrefForIndex = (index: number, mode: "desktop" | "mobile") => {
    const apiHrefs =
      mode === "mobile" ? mobileHrefsFromApi : desktopHrefsFromApi;
    const apiHref = apiHrefs?.[index] ? String(apiHrefs[index]).trim() : "";

    const loadedFromDb =
      mode === "mobile" ? mobileLoadedFromDb : desktopLoadedFromDb;

    const propHref =
      mode === "mobile"
        ? (slideHrefsMobile && slideHrefsMobile[index]) ||
          (slideHrefs && slideHrefs[index]) ||
          slideHref ||
          ""
        : (slideHrefs && slideHrefs[index]) || slideHref || "";

    // Si el set vino de BD, no mezclamos con hrefs estáticos (evita enlaces incorrectos si cambió el orden)
    if (preferApiHrefs) return loadedFromDb ? apiHref : apiHref || propHref;
    return propHref || apiHref;
  };

  // Sincronizar selectedIndex solo con el carrusel visible
  useEffect(() => {
    const api = isMobile ? emblaMobileApi : emblaDesktopApi;
    if (!api) return;
    const onSelectActive = () => setSelectedIndex(api.selectedScrollSnap());
    api.on("select", onSelectActive);
    onSelectActive();
    return () => {
      api.off("select", onSelectActive);
    };
  }, [isMobile, emblaDesktopApi, emblaMobileApi]);

  const goToSlide = (index: number) => {
    const api = isMobile ? emblaMobileApi : emblaDesktopApi;
    api?.scrollTo(index);
    setSelectedIndex(index);
  };

  const goPrev = useCallback(() => {
    const api = isMobile ? emblaMobileApi : emblaDesktopApi;
    api?.scrollPrev();
  }, [isMobile, emblaDesktopApi, emblaMobileApi]);

  const goNext = useCallback(() => {
    const api = isMobile ? emblaMobileApi : emblaDesktopApi;
    api?.scrollNext();
  }, [isMobile, emblaDesktopApi, emblaMobileApi]);

  const activeSlides = (isMobile ?? false) ? mobile : desktop;
  const shouldUseMobileStatic = Boolean(isMobile && mobileStaticFirst);
  const canShowArrows = showArrows && activeSlides.length > 1;

  const imageClassName = (extraClass?: string) => {
    const baseClass = autoHeight
      ? "w-full h-auto"
      : `w-full h-full ${
          objectFit === "contain" ? "object-contain" : "object-cover"
        } ${
          objectPosition === "top"
            ? "object-top"
            : objectPosition === "bottom"
              ? "object-bottom"
              : objectPosition === "left"
                ? "object-left"
                : objectPosition === "right"
                  ? "object-right"
                  : "object-center"
        }`;
    return `${baseClass} ${extraClass || ""}`.trim();
  };

  if (isMobile === null && !autoHeight) {
    const firstDesktop = desktop[0] || "/placeholder.svg";
    const firstMobile = mobile[0] || "/placeholder.svg";
    const desktopHref = hrefForIndex(0, "desktop");
    const mobileHref = hrefForIndex(0, "mobile");

    return (
      <div className="relative w-full overflow-hidden bg-black">
        <div
          className="md:hidden relative bg-black"
          style={{ height: `${mobileHeight}px` }}
        >
          {mobileHref ? (
            <Link href={mobileHref} className="block h-full w-full relative">
              <Image
                src={firstMobile}
                alt="Slide 1"
                fill
                sizes="100vw"
                priority
                loading="eager"
                fetchPriority="high"
                className={imageClassName(mobileImageClassName)}
              />
            </Link>
          ) : (
            <Image
              src={firstMobile}
              alt="Slide 1"
              fill
              sizes="100vw"
              priority
              loading="eager"
              fetchPriority="high"
              className={imageClassName(mobileImageClassName)}
            />
          )}
        </div>

        <div
          className="hidden md:block relative bg-black"
          style={{ height: `${desktopHeight}px` }}
        >
          {desktopHref ? (
            <Link href={desktopHref} className="block h-full w-full relative">
              <Image
                src={firstDesktop}
                alt="Slide 1"
                fill
                sizes="(max-width: 767px) 100vw, 67vw"
                priority
                loading="eager"
                fetchPriority="high"
                className={imageClassName(desktopImageClassName)}
              />
            </Link>
          ) : (
            <Image
              src={firstDesktop}
              alt="Slide 1"
              fill
              sizes="(max-width: 767px) 100vw, 67vw"
              priority
              loading="eager"
              fetchPriority="high"
              className={imageClassName(desktopImageClassName)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-black">
      {isMobile ? (
        <div className="bg-black">
          {shouldUseMobileStatic ? (
            <div
              className="relative"
              style={autoHeight ? undefined : { height: `${mobileHeight}px` }}
            >
              {hrefForIndex(0, "mobile") ? (
                <Link
                  href={hrefForIndex(0, "mobile")}
                  className={`block w-full ${autoHeight ? "h-auto" : "h-full"}`}
                >
                  {autoHeight ? (
                    <Image
                      src={mobile[0] || "/placeholder.svg"}
                      alt="Slide 1"
                      width={900}
                      height={1400}
                      sizes="100vw"
                      priority
                      loading="eager"
                      fetchPriority="high"
                      className={imageClassName(mobileImageClassName)}
                    />
                  ) : (
                    <Image
                      src={mobile[0] || "/placeholder.svg"}
                      alt="Slide 1"
                      fill
                      sizes="100vw"
                      priority
                      loading="eager"
                      fetchPriority="high"
                      className={imageClassName(mobileImageClassName)}
                    />
                  )}
                </Link>
              ) : autoHeight ? (
                <Image
                  src={mobile[0] || "/placeholder.svg"}
                  alt="Slide 1"
                  width={900}
                  height={1400}
                  sizes="100vw"
                  priority
                  loading="eager"
                  fetchPriority="high"
                  className={imageClassName(mobileImageClassName)}
                />
              ) : (
                <Image
                  src={mobile[0] || "/placeholder.svg"}
                  alt="Slide 1"
                  fill
                  sizes="100vw"
                  priority
                  loading="eager"
                  fetchPriority="high"
                  className={imageClassName(mobileImageClassName)}
                />
              )}
            </div>
          ) : (
            <div className="embla bg-black" ref={emblaMobileRef as any}>
              <div className="embla__container flex">
                {mobile.map((image, index) => (
                  <div
                    key={`m-${index}`}
                    className="embla__slide min-w-full relative bg-black"
                    style={
                      autoHeight ? undefined : { height: `${mobileHeight}px` }
                    }
                  >
                    {hrefForIndex(index, "mobile") ? (
                      <Link
                        href={hrefForIndex(index, "mobile")}
                        className={`block w-full ${
                          autoHeight ? "h-auto" : "h-full"
                        }`}
                      >
                        {autoHeight ? (
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Slide ${index + 1}`}
                            width={900}
                            height={1400}
                            sizes="100vw"
                            priority={index === 0}
                            loading={index === 0 ? "eager" : "lazy"}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            className={imageClassName(mobileImageClassName)}
                          />
                        ) : (
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Slide ${index + 1}`}
                            fill
                            sizes="100vw"
                            priority={index === 0}
                            loading={index === 0 ? "eager" : "lazy"}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            className={imageClassName(mobileImageClassName)}
                          />
                        )}
                      </Link>
                    ) : (
                      <>
                        {autoHeight ? (
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Slide ${index + 1}`}
                            width={900}
                            height={1400}
                            sizes="100vw"
                            priority={index === 0}
                            loading={index === 0 ? "eager" : "lazy"}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            className={imageClassName(mobileImageClassName)}
                          />
                        ) : (
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Slide ${index + 1}`}
                            fill
                            sizes="100vw"
                            priority={index === 0}
                            loading={index === 0 ? "eager" : "lazy"}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            className={imageClassName(mobileImageClassName)}
                          />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-black">
          <div className="embla bg-black" ref={emblaDesktopRef as any}>
            <div className="embla__container flex">
              {desktop.map((image, index) => (
                <div
                  key={`d-${index}`}
                  className="embla__slide min-w-full relative bg-black"
                  style={
                    autoHeight ? undefined : { height: `${desktopHeight}px` }
                  }
                >
                  {hrefForIndex(index, "desktop") ? (
                    <Link
                      href={hrefForIndex(index, "desktop")}
                      className={`block w-full ${
                        autoHeight ? "h-auto" : "h-full"
                      }`}
                    >
                      {autoHeight ? (
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Slide ${index + 1}`}
                          width={1600}
                          height={900}
                          sizes="(max-width: 767px) 100vw, 67vw"
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          className={imageClassName(desktopImageClassName)}
                        />
                      ) : (
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Slide ${index + 1}`}
                          fill
                          sizes="(max-width: 767px) 100vw, 67vw"
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          className={imageClassName(desktopImageClassName)}
                        />
                      )}
                    </Link>
                  ) : (
                    <>
                      {autoHeight ? (
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Slide ${index + 1}`}
                          width={1600}
                          height={900}
                          sizes="(max-width: 767px) 100vw, 67vw"
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          className={imageClassName(desktopImageClassName)}
                        />
                      ) : (
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Slide ${index + 1}`}
                          fill
                          sizes="(max-width: 767px) 100vw, 67vw"
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          className={imageClassName(desktopImageClassName)}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!shouldUseMobileStatic && canShowArrows && (
        <>
          <button
            type="button"
            aria-label="Slide previo"
            onClick={goPrev}
            className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-30 text-white bg-black/30 hover:bg-black/50 backdrop-blur-[2px] p-2 md:p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            type="button"
            aria-label="Slide siguiente"
            onClick={goNext}
            className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-30 text-white bg-black/30 hover:bg-black/50 backdrop-blur-[2px] p-2 md:p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* dots: centered bottom */}
      {!shouldUseMobileStatic && (
        <div
          className="absolute left-0 right-0 z-40 flex justify-center pointer-events-auto"
          style={{ bottom: `${dotBottom}px` }}
        >
          <div className="flex gap-2">
            {activeSlides.map((_, dotIndex) => (
              <button
                key={`global-dot-${dotIndex}`}
                onClick={() => goToSlide(dotIndex)}
                className={`rounded-full transition-all focus:outline-none ${
                  dotIndex === selectedIndex ? dotActiveClass : dotInactiveClass
                }`}
                aria-label={`Go to slide ${dotIndex + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
