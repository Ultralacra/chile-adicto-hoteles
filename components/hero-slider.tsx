"use client";

import { useState, useEffect } from "react";

const desktopImages = [
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/NOI-PUMA-LODGE-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/SURAZO-MATANZAS-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/CASAMOLLE-ELQUI-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/TIERRA-ATACAMA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/12/best.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/10/RADISSON-BLU-ACQUA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/TIERRA-PATAGONIA2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/NUEVO-WYNDHAM-PUERTO-VARAS-PETTRA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/PARK-LAKE-LUXURY-HOTEL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/VIBO-WINE-LODGE-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/CUMBRES-LASTARRIA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/CORRALCO-HOTEL-SPA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/EXPLORE-RAPA-NUI-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/PUYEHUE-WELLNESS-SPA-RESORT-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/LEONERA-HOTEL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/CUMBRES-SAN-PEDRO-DE-ATACAMA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/CASA-ZAPALLAR-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/PUERTA-DEL-SUR-2-1.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/NAYARA-HANGAROA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/OUR-HABITAS-ATACAMA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/NI-NEWEN-HOTEL-LODGE-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/ANTUMALAL-PUCON-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/THE-SINGULAR-PATAGONIA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/REMOTA-PATAGONIA-LODGE-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/CASAMOLLE-LA-PUNTILLA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/NOI-INDIGO-PATAGONIA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/FUTANGUE-HOTEL-SPA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/LUCIANO-K-HOTEL-1.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/ALAIA-PUNTA-DE-LOBOS-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/TAKA-MATANZAS-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/DEBAINES-HOTEL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/RAKAU-LODGE-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/RIO-SERRANO-HOTEL-SPA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/EXPLORACIONES-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/DESERTICA-ATACAMA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/EXPLORA-ATACAMA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/ESTANCIA-CERRO-GUIDO-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/LOBERIAS-DEL-SUR-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/NOI-BLEND-COLCHAGUA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/WYNDHAM-SANTIAGO-PETTRA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/CASA-PANGUIPULLI-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/TAWA-REFUGIO-PUELO-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/EXPLORA-TORRES-DEL-PAINE-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/TERMAS-DE-CHILLAN-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/REFUGIA-CHILOE-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/HOTEL-CAVA-ESTANCIA-RILAN-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/NOI-CASA-ATACAMA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/MARI-MARI-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/PATAGONIA-CAMP-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/SKI-PORTILLO-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/NAYARA-ALTO-ATACAMA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/CASA-REAL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/LAS-MAJADAS-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/AC-HOTEL-SANTIAGO-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/AWA-PUERTO-VARAS-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/AND-BEYOND-VIRA-VIRA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/07/THE-SINGULAR-SANTIAGO-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/BELLAVISTA-PUERTO-VARAS-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/09/matetic-2-2.webp",
];

const mobileImages = [
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/NOI-PUMA-LODGE-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/SURAZO-MATANZAS-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/CASAMOLLE-ELQUI-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/CUMBRES-SAN-PEDRO-DE-ATACAMA-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/12/best-movil.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/TIERRA-PATAGONIA-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/WYNDHAM-PUERTO-VARAS-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/PARK-LAKE-LUXURY-HOTEL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/VIBO-WINE-LODGE-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/CUMBRES-LASTARRIA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/CORRALCO-HOTEL-SPA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/EXPLORE-RAPA-NUI-MOVIL-2-scaled.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/PUYEHUE-WELLNESS-SPA-RESORT-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/LEONERA-HOTEL-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/CUMBRES-SAN-PEDRO-DE-ATACAMA-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/CASA-ZAPALLAR-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/PUERTA-DEL-SUR-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/INTEGRACION-TOTAL-MOVIL-2-scaled.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/OUR-HABITAS-ATACAMA-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/NI-NEWEN-HOTEL-LODGE-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/ANTUMALAL-PUCON-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/THE-SINGULAR-PATAGONIA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/REMOTA-PATAGONIA-LODGE-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/CASAMOLLE-LA-PUNTILLA-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/NOI-INDIGO-PATAGONIA-x2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/FUTANGUE-HOTEL-SPA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/LUCIANO-K-HOTEL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/ALAIA-PUNTA-DE-LOBOS-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/TAKA-MATANZAS-MOVIL2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/DEBAINES-HOTEL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/RAKAU-LODGE-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/RIO-SERRANO-HOTEL-SPA-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/4-INCREIBLES-EXPLORACIONES-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/DESERTICA-ATACAMA-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/EXPLORA-ATACAMA-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/ESTANCIA-CERRO-GUIDO-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/LOBERIAS-DEL-SUR-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/NOI-BLEND-COLCHAGUA-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/WYNDHAM-SANTIAGO-PETTRA-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/CASA-PANGUIPULLI-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/TAWA-REFUGIO-PUELO-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/EXPLORA-TORRES-DEL-PAINE-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/TERMAS-DE-CHILLAN-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/REFUGIA-CHILOE-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/ESTANCIA-RILAN-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/NOI-CASA-ATACAMA-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/NI-NEWEN-HOTEL-LODGE-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/PATAGONIA-CAMP-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/SKI-PORTILLO-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/NAYARA-ALTO-ATACAMA-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/CASA-REAL-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/LAS-MAJADAS-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/AC-HOTEL-SANTIAGO-CENCO-COSTANERA-MOVIL2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/AWA-PUERTO-VARAS-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/AND-BEYOND-VIRA-VIRA-MOVIL-2.webp",
  "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/08/THE-SINGULAR-SANTIAGO-MOVIL-2.webp",
];

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % desktopImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + desktopImages.length) % desktopImages.length
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % desktopImages.length);
  };

  return (
    <div className="relative w-full h-[650px] md:h-[650px] overflow-hidden">
      {/* Desktop Images - constrained to page inner width (max-w-7xl) */}
      <div className="hidden md:block relative w-full h-full">
        {desktopImages.map((image, index) => (
          <div
            key={`desktop-${index}`}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-full px-4 max-w-7xl mx-auto relative">
              <img
                src={image || "/placeholder.svg"}
                alt={`Slide ${index + 1}`}
                className="w-full h-[650px] object-contain rounded-md"
                width={1200}
                height={650}
              />

              {/* Dots rendered inside the active slide so they sit over the image */}
              {index === currentIndex && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-auto">
                  <div className="flex gap-2">
                    {desktopImages.map((_, dotIndex) => (
                      <button
                        key={`dot-${dotIndex}`}
                        onClick={() => goToSlide(dotIndex)}
                        className={`rounded-full transition-all focus:outline-none ${
                          dotIndex === currentIndex
                            ? "bg-red-500 w-3 h-3"
                            : "bg-white w-2 h-2"
                        }`}
                        aria-label={`Go to slide ${dotIndex + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Images - constrained to page inner width (max-w-7xl) */}
      <div className="md:hidden w-full h-full relative">
        {mobileImages.map((image, index) => (
          <div
            key={`mobile-${index}`}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-full px-4 max-w-7xl mx-auto">
              <img
                src={image || "/placeholder.svg"}
                alt={`Slide ${index + 1}`}
                className="w-full h-[550px] object-contain rounded-md"
                width={1200}
                height={550}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Centered overlay for controls (arrows + dots) aligned to content width */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="w-full px-4 max-w-7xl mx-auto relative h-full">
          {/* Left arrow */}
          <button
            onClick={goToPrevious}
            className="pointer-events-auto absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/30 hover:bg-black/40 transition-all"
            aria-label="Previous slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={goToNext}
            className="pointer-events-auto absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/30 hover:bg-black/40 transition-all"
            aria-label="Next slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>

          {/* dots removed per request */}
        </div>
      </div>

      {/* global dots removed - dots are rendered inside the active slide */}
    </div>
  );
}
