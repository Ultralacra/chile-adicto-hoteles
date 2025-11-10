"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";

// Orden alineado con el menú del Home (sin "Todos"):
// arquitectura, barrios, iconos, mercados, miradores, museos (CULTURA),
// palacios, parques, paseos-fuera-de-santiago (FUERA DE STGO), restaurantes
const desktopImagesDefault = [
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/AQI-scaled.webp", // Arquitectura
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/BARRIOS-scaled.webp", // Barrios
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/ICONOS-scaled.webp", // Iconos
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
  objectFit?: "cover" | "contain"; // cover por defecto; contain para no recortar
  objectPosition?: "center" | "top" | "bottom"; // alineación vertical/horizontal del objeto
  desktopHeight?: number; // alto del slide desktop en px (por defecto 437)
  mobileHeight?: number; // (se ignora en móvil para evitar blancos, mantenido por compat)
  dotActiveClass?: string; // clase tailwind para punto activo
  dotInactiveClass?: string; // clase tailwind para punto inactivo
  dotBottom?: number; // espacio en px desde el fondo para los dots (por defecto 16)
  slideHref?: string; // si se define, cada slide será un enlace a esta ruta
  slideHrefs?: string[]; // hrefs por slide; tiene prioridad sobre slideHref
  autoHeight?: boolean; // si true, la altura se adapta a la imagen (w-full h-auto)
};

export function HeroSlider({
  desktopImages,
  mobileImages,
  objectFit = "cover",
  objectPosition = "center",
  desktopHeight = 437,
  mobileHeight = 550, // no se usa ya en móvil para eliminar el blanco
  dotActiveClass = "bg-[#E40E36] w-3 h-3",
  dotInactiveClass = "bg-white w-2 h-2",
  dotBottom = 16,
  slideHref,
  slideHrefs,
  autoHeight = false,
}: HeroSliderProps) {
  // Estado para imágenes obtenidas desde API (si existen en /public/slider-*)
  const [desktopFromApi, setDesktopFromApi] = useState<string[] | null>(null);
  const [mobileFromApi, setMobileFromApi] = useState<string[] | null>(null);

  // Elegir fuentes en orden de prioridad: props -> API -> defaults
  const desktop =
    (desktopImages && desktopImages.length ? desktopImages : undefined) ??
    (desktopFromApi && desktopFromApi.length ? desktopFromApi : undefined) ??
    desktopImagesDefault;
  const mobile =
    (mobileImages && mobileImages.length ? mobileImages : undefined) ??
    (mobileFromApi && mobileFromApi.length ? mobileFromApi : undefined) ??
    mobileImagesDefault;

  // Embla para desktop y mobile (como estaba antes)
  const [emblaDesktopRef, emblaDesktopApi] = useEmblaCarousel({ loop: true });
  const [emblaMobileRef, emblaMobileApi] = useEmblaCarousel({ loop: true });

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Autoplay (sin cambios)
  useEffect(() => {
    const api = emblaDesktopApi || emblaMobileApi;
    if (!api) return;
    const play = () => api.scrollNext();
    const id = setInterval(play, 5000);
    return () => clearInterval(id);
  }, [emblaDesktopApi, emblaMobileApi]);

  // Cargar imágenes locales desde API si no se pasaron por props
  useEffect(() => {
    let cancelled = false;
    async function loadFromApi() {
      try {
        const needDesktop = !(desktopImages && desktopImages.length);
        const needMobile = !(mobileImages && mobileImages.length);
        if (!needDesktop && !needMobile) return;
        const res = await fetch("/api/slider-images", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as {
          desktop: string[];
          mobile: string[];
        };
        if (cancelled) return;
        if (needDesktop && Array.isArray(json.desktop))
          setDesktopFromApi(json.desktop);
        if (needMobile && Array.isArray(json.mobile))
          setMobileFromApi(json.mobile);
      } catch {
        // Silencioso
      }
    }
    loadFromApi();
    return () => {
      cancelled = true;
    };
  }, [desktopImages, mobileImages]);

  // sync selected index from embla
  const onSelect = useCallback(() => {
    const api = emblaDesktopApi || emblaMobileApi;
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, [emblaDesktopApi, emblaMobileApi]);

  useEffect(() => {
    if (emblaDesktopApi) {
      emblaDesktopApi.on("select", onSelect);
      onSelect();
    }
    if (emblaMobileApi) {
      emblaMobileApi.on("select", onSelect);
      onSelect();
    }
    return () => {
      if (emblaDesktopApi) emblaDesktopApi.off("select", onSelect);
      if (emblaMobileApi) emblaMobileApi.off("select", onSelect);
    };
  }, [emblaDesktopApi, emblaMobileApi, onSelect]);

  const goToSlide = (index: number) => {
    if (emblaDesktopApi) emblaDesktopApi.scrollTo(index);
    if (emblaMobileApi) emblaMobileApi.scrollTo(index);
    setSelectedIndex(index);
  };

  // Clases utilitarias
  const objPosClass =
    objectPosition === "top"
      ? "object-top"
      : objectPosition === "bottom"
      ? "object-bottom"
      : "object-center";

  const objFitDesktop =
    objectFit === "contain" ? "object-contain" : "object-cover";

  return (
    <div className="relative w-full overflow-hidden">
      {/* Desktop Embla — igual que antes, respetando altura fija y espaciado */}
      <div className="hidden md:block">
        <div className="embla" ref={emblaDesktopRef as any}>
          <div className="embla__container flex">
            {desktop.map((image, index) => (
              <div
                key={`d-${index}`}
                className="embla__slide min-w-full"
                style={
                  autoHeight ? undefined : { height: `${desktopHeight}px` }
                }
              >
                {slideHrefs?.[index] || slideHref ? (
                  <Link
                    href={(slideHrefs && slideHrefs[index]) || slideHref || "#"}
                    className={`block w-full ${
                      autoHeight ? "h-auto" : "h-full"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Slide ${index + 1}`}
                      className={
                        autoHeight
                          ? "w-full h-auto"
                          : `w-full h-full ${objFitDesktop} ${objPosClass}`
                      }
                    />
                  </Link>
                ) : (
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Slide ${index + 1}`}
                    className={
                      autoHeight
                        ? "w-full h-auto"
                        : `w-full h-full ${objFitDesktop} ${objPosClass}`
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Embla — mismas imágenes de escritorio, ANCHAS y CONTENIDAS (imagen completa, sin recortes) */}
      <div className="md:hidden">
        <div className="embla" ref={emblaMobileRef as any}>
          <div className="embla__container flex">
            {desktop.map((image, index) => (
              <div key={`m-${index}`} className="embla__slide min-w-full">
                {slideHrefs?.[index] || slideHref ? (
                  <Link
                    href={(slideHrefs && slideHrefs[index]) || slideHref || "#"}
                    className="block w-full"
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Slide ${index + 1}`}
                      className={`block w-full h-auto object-contain ${objPosClass}`}
                    />
                  </Link>
                ) : (
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Slide ${index + 1}`}
                    className={`block w-full h-auto object-contain ${objPosClass}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* dots: centrados abajo */}
      <div
        className="absolute left-0 right-0 z-40 flex justify-center pointer-events-auto"
        style={{ bottom: `${dotBottom}px` }}
      >
        <div className="flex gap-2">
          {desktop.map((_, dotIndex) => (
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
    </div>
  );
}
