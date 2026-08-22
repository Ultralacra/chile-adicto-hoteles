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
          className="block w-full h-full"
          imageClassName="w-full h-full object-contain md:object-cover"
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
};

export function BottomHomeBanner({
  href = "/monumentos-nacionales",
  src = "/bannerHome/BANNER MONUMENTOS.svg",
  mobileSrc,
  alt = "Monumentos Nacionales",
  desktopKey = "home-promo-monumentos",
  mobileKey,
}: BottomHomeBannerProps) {
  return (
    <ManagedBanner
      desktopKey={desktopKey}
      mobileKey={mobileKey}
      href={href}
      src={encodeURI(src)}
      mobileSrc={mobileSrc ? encodeURI(mobileSrc) : undefined}
      alt={alt}
    />
  );
}
