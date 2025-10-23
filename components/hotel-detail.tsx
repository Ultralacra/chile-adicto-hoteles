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
    email?: string;
    phone?: string;
    featuredImage: string;
    galleryImages: string[];
    website_display?: string;
    instagram_display?: string;
    photosCredit?: string;
    categories: string[];
  };
}

export function HotelDetail({ hotel }: HotelDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { t } = useLanguage();

  const allImages = [hotel.featuredImage, ...hotel.galleryImages];

  const [cleanedFullContent, setCleanedFullContent] = useState(
    hotel.fullContent
  );

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

  // Limpiar el contenido: remover párrafos con info de contacto/redes para evitar duplicados
  useEffect(() => {
    const html = hotel.fullContent || "";
    const cleaned = html.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, (p) => {
      const text = p.replace(/<[^>]+>/g, " ").trim().toLowerCase();
      const hasUrl = /https?:\/\//i.test(text) || /www\./i.test(text);
      const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
      const hasPhone = /\b(tel|tel\.|tel:|teléfono|telefono)\b/i.test(text) || /\+?\d[\d\s().-]{6,}/.test(text);
      const hasInstagram = /instagram\.com|\binstagram\b|@/i.test(text);
      const hasPhotos = /\bfotos\b|\bfotografía\b|\bfotografia\b|\bphotos\b|\bphoto\b/i.test(text);
      const hasWebLabel = /\bweb\b/i.test(text);
      if (hasUrl || hasEmail || hasPhone || hasInstagram || hasPhotos || hasWebLabel) {
        return ""; // eliminar párrafo con info de contacto/redes
      }
      return p;
    });
    setCleanedFullContent(cleaned);
  }, [hotel.fullContent]);

  return (
    <>
      <div className="mx-auto px-4 pt-6 max-w-[1200px]">
        <div className="hidden lg:block">
          <CategoryNav />
        </div>
        <Breadcrumb hotelName={hotel.name} category={hotel.categories[0]} />
      </div>

      <main className="mx-auto px-4 py-8 max-w-[1200px]">
        {/* Main Image Carousel */}
        <div className="mx-auto mb-4 w-full max-w-[1200px]">
          {/*
            Responsive height: on small screens make the carousel height relative to
            viewport width (so images are wider than tall). On large screens keep
            a fixed tall height.
          */}
          <div className="relative overflow-hidden h-[40vw] md:h-[35vw] lg:h-[600px]">
            {allImages.map((src, idx) => (
              <Image
                key={idx}
                src={src || "/placeholder.svg"}
                alt={hotel.name}
                fill
                priority={idx === 0}
                className={`object-cover transition-opacity duration-700 ease-in-out ${
                  idx === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            {/* Prev/Next arrows on carousel sides */}
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {/* Dots navigation placed below the carousel */}
          <div className="flex items-center justify-center gap-2 mt-3 mb-6">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                aria-label={`Go to image ${idx + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  idx === currentImageIndex ? "bg-black" : "bg-black/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail gallery removed per spec - we show only dots+autoplay */}

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

  {/* Hotel Information (constrain text content to 1024px) */}
  <div className="max-w-[1024px] mx-auto">
          {/* Heart Icon and Title (match home card spacing) */}
          <div className="flex items-start gap-[10px] mb-3">
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
                    .replace(/<br\s*\/??>/gi, "\n")
                    .split("\n")
                    .map((line, i) => (
                      <span
                        key={i}
                        className={`block font-neutra !text-[20px] !leading-[24px] text-black font-[700]`}
                        dangerouslySetInnerHTML={{ __html: line }}
                      />
                    ))}
              </h1>
              <h2
                className="font-neutra text-[20px] leading-[24px] font-[100] text-black uppercase"
                dangerouslySetInnerHTML={{ __html: hotel.subtitle }}
              />
            </div>
          </div>

          <div
            className="prose prose-lg max-w-none mb-8 font-neutra text-black leading-relaxed [&>h3]:text-[15px] [&>h3]:font-[700] [&>h3]:mt-8 [&>h3]:mb-4 [&>h3]:leading-[22px] [&>h3]:lowercase [&>h3]:first-letter:uppercase [&>p]:mb-4 [&>p]:text-[15px] [&>p]:leading-[22px] [&>p]:font-[400] [&_a]:text-[var(--color-brand-red)] [&_a]:no-underline hover:[&_a]:underline [&_.divider]:text-gray-300 [&_.divider]:text-center [&_.divider]:my-8"
            dangerouslySetInnerHTML={{ __html: cleanedFullContent }}
          />

          {/* Divider entre texto y bloque de redes/contacto */}
          <div className="my-5">
            <div
              className="mx-auto h-[3px] w-full bg-transparent"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, #b4b4b8 0 3px, transparent 3px 6px)",
              }}
            />
          </div>

          {/* Contacto / Redes: solo se muestran aquí (limpiamos duplicados del texto) */}
          <div className="mt-4 mb-8 text-sm font-neutra text-gray-700">
            {hotel.website && (
              <div className="mb-2">
                <span className="font-[700] mr-2">{t("WEB", "WEB")}:</span>
                <a
                  href={hotel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-brand-red)] no-underline"
                >
                  {formatWebsiteDisplay(hotel.website_display || hotel.website)}
                </a>
              </div>
            )}

            {hotel.instagram && (
              <div className="mb-2">
                <span className="font-[700] mr-2">
                  {t("INSTAGRAM", "INSTAGRAM")}:
                </span>
                <a
                  href={hotel.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-brand-red)] no-underline"
                >
                  {(hotel.instagram_display ||
                    formatInstagramDisplay(hotel.instagram)).toUpperCase()}
                </a>
              </div>
            )}

            {hotel.phone && (
              <div className="mb-2">
                <span className="font-[700] mr-2">{t("TEL", "TEL")}:</span>
                <a
                  href={formatTel(hotel.phone)}
                  className="text-[var(--color-brand-red)] no-underline"
                >
                  {formatPhoneDisplay(hotel.phone).toUpperCase()}
                </a>
              </div>
            )}

            {hotel.email && (
              <div className="mb-2">
                <span className="font-[700] mr-2">{t("EMAIL", "EMAIL")}:</span>
                <a
                  href={formatMailto(hotel.email)}
                  className="text-[var(--color-brand-red)] no-underline"
                >
                  {stripMailto(hotel.email).toUpperCase()}
                </a>
              </div>
            )}

            {hotel.photosCredit && (
              <div className="mb-2 text-[13px] text-gray-600">
                <span className="font-[700] mr-2">
                  {t("PHOTOS", "PHOTOS")}:
                </span>
                <span>{hotel.photosCredit.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Links are shown inline inside the description (cleanedFullContent). No duplicate contact block. */}

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

// Helpers for link formatting
function stripProtocol(url: string) {
  return url.replace(/^https?:\/\//i, "");
}

function formatWebsiteDisplay(url: string) {
  if (!url) return url;
  const withProto = url.startsWith("http") ? url : `https://${url}`;
  try {
    const u = new URL(withProto);
    return u.host.replace(/^www\./, "").toUpperCase();
  } catch (e) {
    return url;
  }
}

function formatMailto(email: string) {
  if (!email) return "";
  return email.startsWith("mailto:") ? email : `mailto:${email}`;
}

function stripMailto(email: string) {
  return email.replace(/^mailto:/i, "");
}

function formatTel(phone: string) {
  if (!phone) return "";
  if (phone.startsWith("tel:")) return phone;
  // Remove spaces and non-digits except +
  const cleaned = phone.replace(/[^+\d]/g, "");
  return `tel:${cleaned}`;
}

function formatPhoneDisplay(phone: string) {
  // Show user-friendly phone (keep + and numbers)
  return phone.replace(/^tel:/i, "");
}

function formatInstagramDisplay(inst: string) {
  if (!inst) return inst;
  // if it's a full url, extract handle
  try {
    if (/^https?:\/\//i.test(inst)) {
      const u = new URL(inst);
      const p = u.pathname.replace(/^\//, "");
      return p ? `@${p}` : u.host;
    }
  } catch (e) {}
  if (inst.startsWith("@")) return inst;
  return `@${inst
    .replace(/^https?:\/\//i, "")
    .split("/")
    .pop()}`;
}
