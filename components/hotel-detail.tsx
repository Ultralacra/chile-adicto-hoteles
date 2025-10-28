"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useLanguage } from "@/contexts/language-context";
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { t } = useLanguage();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const allImages = [hotel.featuredImage, ...hotel.galleryImages];
  const canShowControls = (allImages?.length || 0) > 1;

  const [cleanedFullContent, setCleanedFullContent] = useState(
    hotel.fullContent
  );
  const [address, setAddress] = useState("");

  // Embla selection handler
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      if (emblaApi) emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // autoplay (pauses when lightbox is open)
  useEffect(() => {
    if (!emblaApi || isLightboxOpen) return;
    const id = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(id);
  }, [emblaApi, isLightboxOpen]);

  // Mantener TODO el contenido intacto y solo extraer dirección si aparece en algún párrafo
  useEffect(() => {
    const html = hotel.fullContent || "";
    let foundAddress = "";
    html.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, (p) => {
      const text = p
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const hasAddress = /\b(direcci[oó]n|address|ubicaci[oó]n)\b/i.test(
        text.toLowerCase()
      );
      if (hasAddress && !foundAddress) {
        const cleanedAddr = text
          .replace(/^\s*(direcci[oó]n|address|ubicaci[oó]n)\s*[:\-]?\s*/i, "")
          .trim();
        if (cleanedAddr) foundAddress = cleanedAddr;
      }
      return p;
    });
    // No limpiar/filtrar el HTML: respetar todo el contenido tal cual
    setCleanedFullContent(html);
    setAddress(foundAddress);
  }, [hotel.fullContent]);

  return (
    <>
      <div className="mx-auto px-4 pt-6 max-w-[1200px]">
        <div className="hidden lg:block">
          <CategoryNav />
        </div>
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
            {canShowControls && (
              <>
                <button
                  type="button"
                  aria-label="Imagen previa"
                  onClick={() => emblaApi?.scrollPrev()}
                  className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 backdrop-blur-[2px] p-2 md:p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                  type="button"
                  aria-label="Imagen siguiente"
                  onClick={() => emblaApi?.scrollNext()}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 backdrop-blur-[2px] p-2 md:p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </>
            )}
            {/* Embla root */}
            <div ref={emblaRef} className="h-full">
              <div className="flex h-full">
                {allImages.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative min-w-full h-full flex-shrink-0"
                  >
                    <Image
                      src={src || "/placeholder.svg"}
                      alt={`${hotel.name} ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      className="object-cover cursor-pointer"
                      onClick={() => {
                        setLightboxIndex(idx);
                        setIsLightboxOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dots navigation placed below the carousel (active red) */}
          {canShowControls && (
            <div className="flex items-center justify-center gap-2 mt-3 mb-6">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => emblaApi?.scrollTo(idx)}
                  aria-label={`Ir a la imagen ${idx + 1}`}
                  className={`rounded-full transition-all duration-200 focus:outline-none ${
                    idx === selectedIndex
                      ? "bg-[#E40E36] w-3 h-3 ring-2 ring-white"
                      : "bg-gray-300 w-2 h-2"
                  }`}
                />
              ))}
            </div>
          )}
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
              <h1 className="font-neutra text-[20px] leading-[24px] mb-[] text-black">
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
                  {(
                    hotel.instagram_display ||
                    formatInstagramDisplay(hotel.instagram)
                  ).toUpperCase()}
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

            {/* Dirección debe ir al final del bloque de contacto */}
            {address && (
              <div className="mt-3">
                <span className="font-[700] mr-2">
                  {t("DIRECCIÓN", "ADDRESS")}:
                </span>
                <span className="text-black">{address.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Links are shown inline inside the description (cleanedFullContent). No duplicate contact block. */}
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
