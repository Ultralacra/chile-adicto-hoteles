"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import { Breadcrumb } from "@/components/breadcrumb";
import { CategoryNav } from "@/components/category-nav";

interface HotelDetailProps {
  hotel: {
    name: string;
    subtitle: string;
    excerpt: string;
    fullContent: string;
    website?: string;
    instagram?: string;
    featuredImage: string;
    galleryImages: string[];
    categories: string[];
  };
}

export function HotelDetail({ hotel }: HotelDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { t } = useLanguage();

  const allImages = [hotel.featuredImage, ...hotel.galleryImages];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length
    );
  };

  // Auto-advance carousel every 5 seconds; pause when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) return;
    const id = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 5000);

    return () => clearInterval(id);
  }, [allImages.length, isLightboxOpen]);

  return (
    <>
      <div className="container mx-auto px-4 pt-6 max-w-7xl">
        <div className="hidden lg:block">
          <CategoryNav />
        </div>
        <Breadcrumb hotelName={hotel.name} category={hotel.categories[0]} />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Main Image Carousel */}
        <div className="mx-auto mb-4 w-full max-w-[1200px]">
          <div className="relative overflow-hidden" style={{ height: 600 }}>
            <Image
              src={allImages[currentImageIndex] || "/placeholder.svg"}
              alt={hotel.name}
              fill
              className="object-cover"
              priority
            />

            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Thumbnail Gallery - Show all images (no red focus ring). Click opens lightbox */}
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="grid grid-cols-6 gap-2 mb-12">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentImageIndex(index);
                  setLightboxIndex(index);
                  setIsLightboxOpen(true);
                }}
                className={`relative aspect-[4/3] overflow-hidden focus:outline-none`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${hotel.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover hover:opacity-80 transition-opacity"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        {isLightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div
              className="relative w-full max-w-6xl h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[lightboxIndex] || "/placeholder.svg"}
                alt={`Imagen ${lightboxIndex + 1}`}
                fill
                className="object-contain"
              />

              {/* Close button */}
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 text-white bg-black/40 p-2 rounded-full"
                aria-label="Cerrar imagen"
              >
                ✕
              </button>

              {/* Prev/Next */}
              <button
                onClick={() =>
                  setLightboxIndex(
                    (i) => (i - 1 + allImages.length) % allImages.length
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full"
                aria-label="Imagen previa"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() =>
                  setLightboxIndex((i) => (i + 1) % allImages.length)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Keyboard handlers for lightbox navigation */}
        {isLightboxOpen && (
          <KeyboardNavigation
            onClose={() => setIsLightboxOpen(false)}
            onPrev={() =>
              setLightboxIndex(
                (i) => (i - 1 + allImages.length) % allImages.length
              )
            }
            onNext={() => setLightboxIndex((i) => (i + 1) % allImages.length)}
          />
        )}

        {/* Hotel Information */}
        <div className="max-w-4xl mx-auto">
          {/* Heart Icon and Title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <Image
                src="/favicon.svg"
                alt="Chile Adicto"
                width={40}
                height={50}
              />
            </div>
            <div className="text-left">
              {
                // Normalizamos <br> a saltos de línea y separamos en líneas para garantizar
                // que cada línea reciba el mismo tamaño. Esto maneja entradas con <br> o \n.
              }
              <h1 className="font-neutra text-[20px] leading-[24px] mb-2 text-black">
                {hotel.name &&
                  hotel.name
                    .replace(/<br\s*\/?>/gi, "\n")
                    .split("\n")
                    .map((line, i) => (
                      <span
                        key={i}
                        className={`block font-neutra text-[20px] leading-[24px] text-black ${
                          i === 0 ? "font-[700]" : "font-[400]"
                        }`}
                        dangerouslySetInnerHTML={{ __html: line }}
                      />
                    ))}
              </h1>
              <h2
                className="font-neutra text-[15px] leading-[22px] font-[400] text-black uppercase"
                dangerouslySetInnerHTML={{ __html: hotel.subtitle }}
              />
            </div>
          </div>

          <div
            className="prose prose-lg max-w-none mb-8 font-neutra text-black leading-relaxed [&>h3]:text-[15px] [&>h3]:font-[700] [&>h3]:mt-8 [&>h3]:mb-4 [&>h3]:leading-[22px] [&>h3]:lowercase [&>h3]:first-letter:uppercase [&>p]:mb-4 [&>p]:text-[15px] [&>p]:leading-[22px] [&>p]:font-[400] [&_a]:text-[var(--color-brand-red)] [&_a]:no-underline hover:[&_a]:underline [&_.divider]:text-gray-300 [&_.divider]:text-center [&_.divider]:my-8"
            dangerouslySetInnerHTML={{ __html: hotel.fullContent }}
          />

          {/* Website / Instagram links - show below content, separated */}
          {(hotel.website || hotel.instagram) && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="border-t border-dashed border-gray-300 my-6" />
              <div className="flex flex-col gap-2">
                {hotel.website && (
                  <a
                    href={
                      hotel.website.startsWith("http")
                        ? hotel.website
                        : `https://${hotel.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-brand-red)] uppercase text-sm font-[600] no-underline"
                  >
                    {hotel.website}
                  </a>
                )}

                {hotel.instagram && (
                  <a
                    href={
                      hotel.instagram.startsWith("http")
                        ? hotel.instagram
                        : `https://instagram.com/${hotel.instagram.replace(
                            /^@/,
                            ""
                          )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-brand-red)] text-sm no-underline"
                  >
                    {hotel.instagram.startsWith("@")
                      ? hotel.instagram
                      : `@${hotel.instagram.replace(/^https?:\/\//, "")}`}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-12">
            <button className="relative group hover:opacity-80 transition-opacity">
              <Image
                src="/boton-reserva.svg"
                alt={t("RESERVA", "BOOK")}
                width={99}
                height={120}
                className="w-auto h-[120px]"
              />
            </button>
            <button className="relative group hover:opacity-80 transition-opacity">
              <Image
                src="/boton-comente.svg"
                alt={t("COMENTE", "COMMENT")}
                width={99}
                height={120}
                className="w-auto h-[120px]"
              />
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

function KeyboardNavigation({
  onClose,
  onPrev,
  onNext,
}: {
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return null;
}
