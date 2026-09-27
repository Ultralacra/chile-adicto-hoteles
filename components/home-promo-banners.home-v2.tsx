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

/** Columna media del home: restaurantes arriba (como antes), hoteles abajo sin marco. */
export function RestaurantsStackBanners() {
  return (
    <div className="w-full flex flex-col gap-[18px] md:gap-4 overflow-hidden md:h-[520px] lg:h-[437px]">
      <div className="relative flex-1 min-h-0 bg-black overflow-hidden flex items-center justify-center p-3 md:p-4 lg:p-5">
        <ManagedBanner
          desktopKey="home-promo-restaurantes"
          href="/restaurantes"
          src="/bannerHome/70 RESTAURANTES.webp"
          mobileSrc="/bannerHome/restaurantes movil.png"
          alt="Restaurantes"
          className="block w-full h-full flex items-center justify-center"
          imageClassName="max-w-full max-h-full object-contain"
        />
      </div>

      <StackSlot>
        <ManagedBanner
          desktopKey="home-promo-hoteles"
          href="https://www.chileadictohoteles.cl/"
          openInNewTab
          src="/bannerHome/BANNER HOTELES.webp"
          alt="Chile Adicto Hoteles"
          className="block w-full h-full"
          imageClassName={stackImageClassName}
        />
      </StackSlot>
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
          hideFallbackWhileLoading
          className="block w-full h-full"
          imageClassName={stackImageClassName}
        />
      </StackSlot>

      <StackSlot>
        <ManagedBanner
          desktopKey="home-promo-cafes"
          href="/cafes"
          src="/bannerHome/30 CAFES.webp"
          alt="Cafés"
          className="block w-full h-full"
          imageClassName={stackImageClassName}
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
      />
    </>
  );
}
