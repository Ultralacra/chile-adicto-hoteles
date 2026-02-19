import { memo } from "react";
import Image from "next/image";
import Link from "next/link";

interface HotelCardProps {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  imageVariant?: "default" | "tall";
  imagePriority?: boolean;
  publishStartAt?: string | null;
  publishEndAt?: string | null;
  publicationEndsAt?: string | null;
  showPublicationDates?: boolean;
}

function HotelCardComponent({
  slug,
  name,
  subtitle,
  description,
  image,
  imageVariant = "default",
  imagePriority = false,
  publishStartAt,
  publishEndAt,
  publicationEndsAt,
  showPublicationDates = true,
}: HotelCardProps) {
  const imageContainerClass =
    imageVariant === "tall" ? "h-[400px]" : "aspect-[386/264]";

  const looksLikeHtml = /<[^>]+>/.test(description);

  const formatPublicationDate = (value?: string | null): string | null => {
    const raw = String(value || "").trim();
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    const hasTime = /T\d{2}:\d{2}|\d{2}:\d{2}/.test(raw);
    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      ...(hasTime
        ? {
            hour: "2-digit",
            minute: "2-digit",
          }
        : {}),
    }).format(parsed);
  };

  const endValue = publicationEndsAt || publishEndAt || null;
  const startLabel = formatPublicationDate(publishStartAt);
  const endLabel = formatPublicationDate(endValue);
  const shouldShowPublicationDates =
    showPublicationDates && Boolean(startLabel || endLabel);

  return (
    <Link href={`/${slug}`}>
      <article className="group cursor-pointer flex flex-col h-full gap-3">
        {/* Image Container */}
        <div className={`relative ${imageContainerClass} overflow-hidden`}>
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
            priority={imagePriority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="space-y-3 flex-1">
          {/* Heart Icon and Title */}
          <div className="flex items-start gap-[10px]">
            <div className="flex-shrink-0">
              <div
                className="flex items-center justify-center"
                style={{ width: 41, height: 50 }}
              >
                <img
                  src="/favicon.svg"
                  alt="icon"
                  style={{ width: 41, height: 50 }}
                />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="font-neutra text-[15px] font-normal text-black leading-[19px] mb-0 first-line:font-[600]">
                {name}
              </h2>
              <p className="font-neutra text-[15px] font-normal text-black uppercase leading-[19px]">
                {subtitle}
              </p>
              {shouldShowPublicationDates && (
                <div className="mt-1 font-neutra text-[12px] leading-[16px] text-black/70">
                  {startLabel && (
                    <div>
                      <span className="font-semibold">Desde:</span> {startLabel}
                    </div>
                  )}
                  {endLabel && (
                    <div>
                      <span className="font-semibold">Hasta:</span> {endLabel}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {looksLikeHtml ? (
            <div
              className="font-neutra text-[15px] text-black leading-[22px] font-normal line-clamp-5 min-h-[110px]"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="font-neutra text-[15px] text-black leading-[22px] font-normal line-clamp-5 min-h-[110px]">
              {description}
            </p>
          )}
        </div>

        {/* Elegant divider pushed to bottom so all cards align */}
        <div className="mt-auto pt-2 pb-5">
          <div className="mx-auto h-[1px] w-3/4 bg-[#b4b4b8]" />
        </div>
      </article>
    </Link>
  );
}

export const HotelCard = memo(HotelCardComponent);
