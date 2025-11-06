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
    infoHtml?: string; // HTML libre para "Datos útiles"
    website?: string;
    instagram?: string;
    email?: string;
    phone?: string;
    address?: string;
    locations?: Array<{
      label?: string;
      address: string;
      hours?: string;
      website?: string;
      website_display?: string;
      instagram?: string;
      instagram_display?: string;
      reservationLink?: string;
      reservationPolicy?: string;
      interestingFact?: string;
      email?: string;
      phone?: string;
    }>;
    featuredImage: string;
    galleryImages: string[];
    website_display?: string;
    instagram_display?: string;
    photosCredit?: string;
    categories: string[];
    hours?: string;
    reservationLink?: string;
    reservationPolicy?: string;
    interestingFact?: string;
  };
}

export function HotelDetail({ hotel }: HotelDetailProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { t } = useLanguage();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  // Mostrar solo la galería numerada en el carrusel.
  // Si no existen numeradas, NO mostrar carrusel (para nunca incluir PORTADA en galería).
  const allImages =
    hotel.galleryImages && hotel.galleryImages.length > 0
      ? hotel.galleryImages
      : [];
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

  // Limpiar contenido del cuerpo para evitar duplicar datos de contacto que también se muestran abajo
  useEffect(() => {
    const html = hotel.fullContent || "";
    let foundAddress = normalizeAddressText(hotel.address || "");
    // Recolectar dirección si aparece en algún párrafo
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
    // Filtro de párrafos que contienen datos de contacto (web, instagram, email, tel, dirección)
    const contactPatterns = [
      /^\s*(direcci[oó]n|address|ubicaci[oó]n)\s*[:\-]?/i,
      /^\s*(web|website|sitio)\s*:?/i,
      /^\s*(instagram)\s*:?/i,
      /^\s*(tel[eé]fono|tel|phone)\s*:?/i,
      /^\s*(email|mail)\s*:?/i,
    ];
    const norm = (s: string) =>
      (s || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/[\s\u00A0]+/g, " ")
        .replace(/[\.,;:]+$/g, "")
        .trim()
        .toUpperCase();
    const addressSet = new Set<string>();
    if (foundAddress) addressSet.add(norm(foundAddress));
    if (hotel.address) addressSet.add(norm(hotel.address));
    (hotel.locations || []).forEach((l) => {
      if (l?.address) addressSet.add(norm(l.address));
    });
    // Eliminamos cualquier <p> cuyo texto matchee alguno de los patrones
    const processed = html.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, (p) => {
      const text = p
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const isContactLabel = contactPatterns.some((re) => re.test(text));
      const isAddressDuplicate = addressSet.has(norm(text));
      const isContact = isContactLabel || isAddressDuplicate;
      return isContact ? "" : p;
    });
    // Limpieza inline: eliminar URLs/WWW/emails dentro de párrafos editoriales, manteniendo el resto
    const inlineUrlRe = /https?:\/\/[^\s<>"']+/gi;
    const inlineWwwRe = /\bwww\.[^\s<>"']+/gi;
    const inlineEmailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
    const processed2 = processed
      .replace(inlineUrlRe, " ")
      .replace(inlineWwwRe, " ")
      .replace(inlineEmailRe, " ")
      .replace(/\s{2,}/g, " ");
    setCleanedFullContent(processed2);
    setAddress(foundAddress);
  }, [hotel.fullContent, hotel.address]);

  return (
    <>
      {/* Mostrar submenú de comunas para posts de restaurante */}
      <div className="site-inner py-2">
        <div className="hidden lg:block">
          {(() => {
            const cats = hotel?.categories || [];
            const up = (cats || []).map((c) => String(c).toUpperCase());
            const isRestaurant =
              up.includes("RESTAURANTES") || up.includes("RESTAURANTS");
            if (!isRestaurant) return null;

            const communes = [
              "Vitacura",
              "Las Condes",
              "Santiago",
              "Lo Barnechea",
              "Providencia",
              "Alto Jahuel",
              "La Reina",
            ];

            return (
              <nav className="py-4">
                <ul className="hidden lg:flex flex-nowrap items-center gap-2 text-sm font-medium whitespace-nowrap">
                  <li className="flex items-center gap-2">
                    <a
                      href="/categoria/restaurantes"
                      className={`font-neutra hover:text-[var(--color-brand-red)] transition-colors tracking-wide text-[15px] leading-[20px] text-black`}
                    >
                      {t("VOLVER", "BACK")}
                    </a>
                    <span className="text-black">•</span>
                  </li>
                  {communes.map((c, index) => {
                    const slugified = c.toLowerCase().replace(/\s+/g, "-");
                    return (
                      <li key={c} className="flex items-center gap-2">
                        <a
                          href={`/categoria/restaurantes?comuna=${slugified}`}
                          className={`font-neutra hover:text-[var(--color-brand-red)] transition-colors tracking-wide text-[15px] leading-[20px] text-black`}
                        >
                          {c.toUpperCase()}
                        </a>
                        {index < communes.length - 1 && (
                          <span className="text-black">•</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            );
          })()}
        </div>
      </div>

      <main className="site-inner pt-0 pb-8">
        {/* Main Image Carousel */}
        {allImages.length > 0 && (
          <div className="mb-4 w-full">
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
        )}

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

          {/* Contacto / Redes: si infoHtml está presente, se usa como bloque manual; de lo contrario, se usa el bloque estructurado */}
          <div className="mt-4 mb-8 font-neutra text-black text-[15px] leading-[22px]">
            <h3 className="font-neutra text-[15px] leading-[22px] font-[700] uppercase text-black mb-3">
              {t("DATOS ÚTILES", "USEFUL INFORMATION")}
            </h3>
            {hotel.infoHtml ? (
              <div
                className="prose prose-sm md:prose-base max-w-none font-neutra text-black text-[15px] leading-[22px] [&_*]:text-[15px] [&_strong]:font-[700] [&_em]:italic [&_a]:text-[var(--color-brand-red)] [&_a]:no-underline hover:[&_a]:underline"
                dangerouslySetInnerHTML={{ __html: hotel.infoHtml }}
              />
            ) : (
              <>
                {/* 1) Dirección / Sucursales */}
                {hotel.locations && hotel.locations.length > 0 ? (
                  <div className="mb-2">
                    <div className="mr-2 inline-block">
                      {t("DIRECCIÓN", "ADDRESS")}:
                    </div>
                    <div className="mt-1">
                      {hotel.locations.map((loc, idx) => (
                        <div key={idx} className="mb-1">
                          {loc.label ? (
                            <>
                              <span className="mr-2">
                                {String(loc.label).toUpperCase()}:
                              </span>
                              <span className="text-black">
                                {normalizeAddressText(
                                  loc.address
                                ).toUpperCase()}
                              </span>
                              {loc.hours ? (
                                <span className="text-black">{` (${loc.hours})`}</span>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-black">
                              {normalizeAddressText(loc.address).toUpperCase()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  address && (
                    <div className="mb-2">
                      <span className="mr-2">
                        {t("DIRECCIÓN", "ADDRESS")}:
                      </span>
                      <span className="text-black">
                        {address.toUpperCase()}
                      </span>
                    </div>
                  )
                )}

                {/* 2) Sitio web */}
                <div className="mb-2">
                  <span className="mr-2">{t("WEB", "WEB")}:</span>
                  {hotel.website ? (
                    <a
                      href={hotel.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-brand-red)] no-underline"
                    >
                      {formatWebsiteDisplay(
                        hotel.website_display || hotel.website
                      )}
                    </a>
                  ) : (
                    <span className="text-black">
                      {t(
                        "NO POSEE UN SITIO WEB OFICIAL",
                        "NO OFFICIAL WEBSITE"
                      )}
                    </span>
                  )}
                </div>

                {/* 3) Redes Sociales */}
                {hotel.instagram && (
                  <div className="mb-2">
                    <span className="mr-2">
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

                {/* 4) Horario */}
                {hotel.hours && (
                  <div className="mb-2">
                    <span className="mr-2">
                      {t("HORARIO", "HOURS")}:
                    </span>
                    <span className="text-black">{hotel.hours}</span>
                  </div>
                )}

                {/* 5) Reservas */}
                {(hotel.reservationPolicy || hotel.reservationLink) && (
                  <div className="mb-2">
                    <span className="mr-2">
                      {t("RESERVAS", "RESERVATIONS")}:
                    </span>
                    {hotel.reservationLink ? (
                      <a
                        href={hotel.reservationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-brand-red)] no-underline"
                      >
                        {hotel.reservationPolicy || hotel.reservationLink}
                      </a>
                    ) : (
                      <span className="text-black">
                        {hotel.reservationPolicy}
                      </span>
                    )}
                  </div>
                )}

                {/* 6) Dato de interés */}
                {hotel.interestingFact && (
                  <div className="mb-2">
                    <span className="mr-2">
                      {t("DATO DE INTERÉS", "INTERESTING FACT")}:
                    </span>
                    <span className="text-black">{hotel.interestingFact}</span>
                  </div>
                )}

                {/* 6.1) Bloques por sucursal con datos específicos */}
                {hotel.locations && hotel.locations.length > 0 && (
                  <div className="mt-5">
                    {hotel.locations.map((loc, idx) => {
                      const hasExtra = !!(
                        loc.website ||
                        loc.instagram ||
                        loc.hours ||
                        loc.reservationLink ||
                        loc.reservationPolicy ||
                        loc.interestingFact ||
                        loc.email ||
                        loc.phone
                      );
                      if (!hasExtra) return null;
                      return (
                        <div key={idx} className="mb-4">
                          {loc.label && (
                            <div className="font-neutra text-[15px] leading-[22px] font-normal uppercase text-black mb-2">
                              {String(loc.label)}
                            </div>
                          )}
                          {/* Dirección de la sucursal (opcionalmente repetir para claridad) */}
                          {loc.address && (
                            <div className="mb-1">
                              <span className="mr-2">
                                {t("DIRECCIÓN", "ADDRESS")}:
                              </span>
                              <span className="text-black">
                                {normalizeAddressText(
                                  loc.address
                                ).toUpperCase()}
                              </span>
                            </div>
                          )}
                          {/* Sitio web sucursal */}
                          {loc.website && (
                            <div className="mb-1">
                              <span className="mr-2">
                                {t("WEB", "WEB")}:
                              </span>
                              <a
                                href={loc.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--color-brand-red)] no-underline"
                              >
                                {formatWebsiteDisplay(
                                  loc.website_display || loc.website
                                )}
                              </a>
                            </div>
                          )}
                          {/* Instagram sucursal */}
                          {loc.instagram && (
                            <div className="mb-1">
                              <span className="mr-2">
                                {t("INSTAGRAM", "INSTAGRAM")}:
                              </span>
                              <a
                                href={loc.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--color-brand-red)] no-underline"
                              >
                                {(
                                  loc.instagram_display ||
                                  formatInstagramDisplay(loc.instagram)
                                ).toUpperCase()}
                              </a>
                            </div>
                          )}
                          {/* Horario sucursal */}
                          {loc.hours && (
                            <div className="mb-1">
                              <span className="mr-2">
                                {t("HORARIO", "HOURS")}:
                              </span>
                              <span className="text-black">{loc.hours}</span>
                            </div>
                          )}
                          {/* Reservas sucursal */}
                          {(loc.reservationPolicy || loc.reservationLink) && (
                            <div className="mb-1">
                              <span className="mr-2">
                                {t("RESERVAS", "RESERVATIONS")}:
                              </span>
                              {loc.reservationLink ? (
                                <a
                                  href={loc.reservationLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[var(--color-brand-red)] no-underline"
                                >
                                  {loc.reservationPolicy || loc.reservationLink}
                                </a>
                              ) : (
                                <span className="text-black">
                                  {loc.reservationPolicy}
                                </span>
                              )}
                            </div>
                          )}
                          {/* Dato de interés sucursal */}
                          {loc.interestingFact && (
                            <div className="mb-1">
                              <span className="mr-2">
                                {t("DATO DE INTERÉS", "INTERESTING FACT")}:
                              </span>
                              <span className="text-black">
                                {loc.interestingFact}
                              </span>
                            </div>
                          )}
                          {/* Contacto sucursal */}
                          {loc.phone && (
                            <div className="mb-1">
                              <span className="mr-2">
                                {t("TEL", "TEL")}:
                              </span>
                              <a
                                href={formatTel(loc.phone)}
                                className="text-[var(--color-brand-red)] no-underline"
                              >
                                {formatPhoneDisplay(loc.phone).toUpperCase()}
                              </a>
                            </div>
                          )}
                          {loc.email && (
                            <div className="mb-1">
                              <span className="mr-2">
                                {t("EMAIL", "EMAIL")}:
                              </span>
                              <a
                                href={formatMailto(loc.email)}
                                className="text-[var(--color-brand-red)] no-underline"
                              >
                                {stripMailto(loc.email).toUpperCase()}
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Teléfono y email (opcionalmente debajo) */}
                {hotel.phone && (
                  <div className="mb-2">
                    <span className="mr-2">{t("TEL", "TEL")}:</span>
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
                    <span className="mr-2">
                      {t("EMAIL", "EMAIL")}:
                    </span>
                    <a
                      href={formatMailto(hotel.email)}
                      className="text-[var(--color-brand-red)] no-underline"
                    >
                      {stripMailto(hotel.email).toUpperCase()}
                    </a>
                  </div>
                )}

                {/* Crédito de fotos (si aplica) */}
                {hotel.photosCredit && (
                  <div className="mb-2 text-[15px] text-black">
                    <span className="mr-2">
                      {t("FOTOGRAFÍAS", "PHOTOGRAPHS")}:
                    </span>
                    <span>{hotel.photosCredit.toUpperCase()}</span>
                  </div>
                )}
              </>
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

// Helpers for address normalization
function normalizeAddressText(s: string) {
  if (!s) return "";
  const txt = String(s)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // remove leading labels like DIRECCIÓN:, ADDRESS:, UBICACIÓN:
  return txt.replace(
    /^\s*(direcci[oó]n|address|ubicaci[oó]n)\s*[:\-]?\s*/i,
    ""
  );
}
