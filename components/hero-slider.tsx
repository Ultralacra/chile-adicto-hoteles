"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

const desktopImagesDefault = [
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/AQI-scaled.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/BARRIOS-scaled.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/ICONOS-scaled.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/slider-100-scaled.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/MERCADOS-scaled.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/MIRADORES-scaled.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/CULTURA-scaled.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/slider-100-scaled.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/PALACIOS-scaled.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/PARQUES-scaled.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/FUERA-DE-SGO-scaled.webp",
];

const mobileImagesDefault = [
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/QA-1.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/QA-2.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/QA-3.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/QA-4.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/QA-5.webp",
];

type HeroSliderProps = {
  desktopImages?: string[];
  mobileImages?: string[];
  objectFit?: "cover" | "contain"; // cover por defecto; contain para no recortar
  desktopHeight?: number; // alto del slide desktop en px (por defecto 437)
  mobileHeight?: number; // alto del slide mobile en px (por defecto 550)
  dotActiveClass?: string; // clase tailwind para punto activo
  dotInactiveClass?: string; // clase tailwind para punto inactivo
};

export function HeroSlider({
  desktopImages,
  mobileImages,
  objectFit = "cover",
  desktopHeight = 437,
  mobileHeight = 550,
  dotActiveClass = "bg-[#E40E36] w-3 h-3",
  dotInactiveClass = "bg-white w-2 h-2",
}: HeroSliderProps) {
  const desktop =
    desktopImages && desktopImages.length
      ? desktopImages
      : desktopImagesDefault;
  const mobile =
    mobileImages && mobileImages.length ? mobileImages : mobileImagesDefault;

  // Embla for desktop and mobile instances
  const [emblaDesktopRef, emblaDesktopApi] = useEmblaCarousel({ loop: true });
  const [emblaMobileRef, emblaMobileApi] = useEmblaCarousel({ loop: true });

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Autoplay
  useEffect(() => {
    const api = emblaDesktopApi || emblaMobileApi;
    if (!api) return;
    const play = () => {
      if (api) api.scrollNext();
    };
    const id = setInterval(play, 5000);
    return () => clearInterval(id);
  }, [emblaDesktopApi, emblaMobileApi]);

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

  return (
    <div className="relative w-full overflow-hidden">
      {/* Desktop Embla */}
      <div className="hidden md:block">
        <div className="embla" ref={emblaDesktopRef as any}>
          <div className="embla__container flex">
            {desktop.map((image, index) => (
              <div
                key={`d-${index}`}
                className="embla__slide min-w-full"
                style={{ height: `${desktopHeight}px` }}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Slide ${index + 1}`}
                  className={`w-full h-full ${
                    objectFit === "contain" ? "object-contain" : "object-cover"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Embla */}
      <div className="md:hidden">
        <div className="embla" ref={emblaMobileRef as any}>
          <div className="embla__container flex">
            {mobile.map((image, index) => (
              <div
                key={`m-${index}`}
                className="embla__slide min-w-full"
                style={{ height: `${mobileHeight}px` }}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Slide ${index + 1}`}
                  className={`w-full h-full ${
                    objectFit === "contain" ? "object-contain" : "object-cover"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* dots: centered bottom */}
      <div className="absolute left-0 right-0 bottom-4 z-40 flex justify-center pointer-events-auto">
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
