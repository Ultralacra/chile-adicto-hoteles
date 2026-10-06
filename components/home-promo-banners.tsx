"use client";

import Link from "next/link";
import { ManagedBanner } from "@/components/managed-banner";

export function PromoStackBanners() {
  return (
    <div className="w-full flex flex-col gap-4 overflow-hidden h-[435px] md:h-[520px] lg:h-[437px]">
      <div
        className="flex-1 min-h-0 relative overflow-hidden max-w-[435px] mx-auto"
        style={{ height: 210 }}
      >
        <ManagedBanner
          desktopKey="home-promo-toyota"
          href="/categoria/iconos"
          src="/iconos/BANNER RUTA TOYOTA.webp"
          alt="La Ruta Toyota"
          hideFallbackWhileLoading
          className="block w-full h-full"
          imageClassName="w-full h-full object-contain md:object-cover"
          optimizeWidth={960}
          optimizeQuality={70}
          sizes="(max-width: 768px) 100vw, 435px"
          width={960}
          height={422}
        />
      </div>

      <div
        className="flex-1 min-h-0 relative overflow-hidden max-w-[435px] mx-auto"
        style={{ height: 210 }}
      >
        <ManagedBanner
          desktopKey="home-promo-cafes"
          href="/cafes"
          src="/bannerHome/30 CAFES.webp"
          alt="Cafés"
          className="block w-full h-full"
          imageClassName="w-full h-full object-contain md:object-cover"
        />
      </div>
    </div>
  );
}

type BottomHomeBannerProps = {
  href?: string;
  src?: string;
  mobileSrc?: string;
  alt?: string;
  desktopKey?: string;
  mobileKey?: string;
  mobileItemIndex?: number;
  hideFallbackWhileLoading?: boolean;
};

function encodeUrl(url: string): string {
  // Only encode raw special chars (esp. spaces) without re-encoding existing %XX sequences
  const parts = url.split(/(%[0-9A-Fa-f]{2})/g);
  return parts
    .map((part, i) =>
      i % 2 === 1
        ? part
        : part.replace(/[^A-Za-z0-9\-._~:/?#@!$&'()*+,;=]/g, (c) =>
            "%" + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"),
          ),
    )
    .join("");
}

export function BottomHomeBanner({
  href = "/monumentos-nacionales",
  src = "/bannerHome/BANNER MONUMENTOS.svg",
  mobileSrc = "/bannerHome/monumentos movil.png",
  alt = "Monumentos Nacionales",
  desktopKey = "home-promo-monumentos",
  mobileKey,
  mobileItemIndex,
  hideFallbackWhileLoading = false,
}: BottomHomeBannerProps) {
  return (
    <ManagedBanner
      desktopKey={desktopKey}
      mobileKey={mobileKey}
      mobileItemIndex={mobileItemIndex}
      href={href}
      src={encodeUrl(src)}
      mobileSrc={encodeUrl(mobileSrc)}
      alt={alt}
      hideFallbackWhileLoading={hideFallbackWhileLoading}
    />
  );
}
