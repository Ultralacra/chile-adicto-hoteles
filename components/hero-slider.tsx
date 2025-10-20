"use client";

import { useState, useEffect } from "react";

const desktopImages = [
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

const mobileImages = [
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/QA-1.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/QA-2.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/QA-3.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/QA-4.webp",
  "https://azure-seal-918691.hostingersite.com/wp-content/uploads/2025/09/QA-5.webp",
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
    <div className="relative w-full h-full overflow-hidden">
      {/* Desktop Images - constrained to page inner width (max-w-7xl) */}
      <div className="hidden md:block relative w-full h-full">
        {desktopImages.map((image, index) => (
          <div
            key={`desktop-${index}`}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-full relative h-full">
              <img
                src={image || "/placeholder.svg"}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
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
            <div className="w-full h-full">
              <img
                src={image || "/placeholder.svg"}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                width={1200}
                height={550}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Centered overlay for controls (arrows + dots) aligned to content width */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="w-full relative h-full">
          {/* Left arrow */}
          <button
            onClick={goToPrevious}
            className="pointer-events-auto absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/70 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Previous slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path
                d="M15.5 19.5L8 12l7.5-7.5"
                fill="white"
                stroke="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={goToNext}
            className="pointer-events-auto absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/70 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Next slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path
                d="M8.5 4.5L16 12l-7.5 7.5"
                fill="white"
                stroke="none"
                strokeLinecap="round"
                strokeLinejoin="round"
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
