"use client";

import { ManagedBanner } from "@/components/managed-banner";

export function PromoStackBanners() {
  return (
    <div className="w-full flex flex-col gap-[18px] md:gap-4 overflow-hidden md:h-[520px] lg:h-[437px]">
      <div className="relative overflow-hidden max-w-[435px] mx-auto md:flex-1 md:min-h-0">
        <ManagedBanner
          desktopKey="home-promo-toyota"
          href="/iconos"
          src="/iconos/BANNER RUTA TOYOTA.webp"
          alt="La Ruta Toyota"
          className="block w-full h-full"
          imageClassName="block w-full h-auto md:h-full object-contain md:object-cover"
        />
      </div>

      <div className="relative overflow-hidden max-w-[435px] mx-auto md:flex-1 md:min-h-0">
        <ManagedBanner
          desktopKey="home-promo-cafes"
          href="/cafes"
          src="/bannerHome/30 CAFES.webp"
          alt="Cafés"
          className="block w-full h-full"
          imageClassName="block w-full h-auto md:h-full object-contain md:object-cover"
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
  mobileSrc = "/bannerHome/monumentos movil.png",
  alt = "Monumentos Nacionales",
  desktopKey = "home-promo-monumentos",
  mobileKey,
}: BottomHomeBannerProps) {
  return (
    <>
      <ManagedBanner
        desktopKey={desktopKey}
        mobileKey={mobileKey}
        href={href}
        src={src}
        mobileSrc={mobileSrc}
        alt={alt}
        className="contents"
        imageClassName="w-full h-auto"
      />
    </>
  );
}
