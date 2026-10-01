"use client";

import { ManagedBanner } from "@/components/managed-banner";

function StackSlot({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden max-w-[435px] mx-auto md:flex-1 md:min-h-0">
      {children}
    </div>
  );
}

const stackImageClassName =
  "block w-full h-auto md:h-full object-contain md:object-cover";

/** Columna media: mismo alto que antes; imagen completa y resto en negro. */
export function RestaurantsStackBanners() {
  return (
    <div className="w-full flex flex-col gap-[18px] md:gap-4 overflow-hidden md:h-[520px] lg:h-[437px]">
      <div className="relative w-full md:flex-1 md:min-h-0 bg-black overflow-hidden flex items-center justify-center">
        <ManagedBanner
          desktopKey="home-promo-restaurantes"
          href="/restaurantes"
          src="/bannerHome/70 RESTAURANTES.webp"
          alt="Restaurantes"
          priority
          className="block w-full h-full flex items-center justify-center"
          imageClassName="max-w-full max-h-full w-auto h-auto object-contain"
          optimizeWidth={720}
          optimizeQuality={70}
          sizes="(max-width: 768px) 100vw, 320px"
          width={720}
          height={570}
        />
      </div>

      <div className="relative w-full md:flex-1 md:min-h-0 overflow-hidden">
        <ManagedBanner
          desktopKey="home-promo-hoteles"
          href="https://www.chileadictohoteles.cl/"
          openInNewTab
          src="/bannerHome/BANNER HOTELES.webp"
          alt="Chile Adicto Hoteles"
          priority
          className="block w-full h-full"
          imageClassName={stackImageClassName}
          optimizeWidth={720}
          optimizeQuality={70}
          sizes="(max-width: 768px) 100vw, 320px"
          width={720}
          height={570}
        />
      </div>
    </div>
  );
}

export function PromoStackBanners() {
  return (
    <div className="w-full flex flex-col gap-[18px] md:gap-4 overflow-hidden md:h-[520px] lg:h-[437px]">
      <StackSlot>
        <ManagedBanner
          desktopKey="home-promo-toyota"
          href="/iconos"
          src="/iconos/BANNER RUTA TOYOTA.webp"
          alt="La Ruta Toyota"
          priority
          className="block w-full h-full"
          imageClassName={stackImageClassName}
          optimizeWidth={960}
          optimizeQuality={70}
          sizes="(max-width: 768px) 100vw, 435px"
          width={960}
          height={422}
        />
      </StackSlot>

      <StackSlot>
        <ManagedBanner
          desktopKey="home-promo-cafes"
          href="/cafes"
          src="/bannerHome/30 CAFES.webp"
          alt="Cafés"
          priority
          className="block w-full h-full"
          imageClassName={stackImageClassName}
          optimizeWidth={960}
          optimizeQuality={70}
          sizes="(max-width: 768px) 100vw, 435px"
          width={960}
          height={422}
        />
      </StackSlot>
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
        optimizeWidth={1400}
        optimizeQuality={72}
        sizes="100vw"
      />
    </>
  );
}
