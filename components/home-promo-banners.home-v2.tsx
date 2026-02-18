"use client";

import Link from "next/link";

export function PromoStackBanners() {
  return (
    <div className="w-full flex flex-col gap-[18px] md:gap-4 overflow-hidden md:h-[520px] lg:h-[437px]">
      <div className="relative overflow-hidden max-w-[435px] mx-auto md:flex-1 md:min-h-0">
        <Link
          href="https://chileadictohoteles.cl/"
          className="block w-full h-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/bannerHome/70%20HOTELES.png"
            alt="Hoteles"
            className="block w-full h-auto md:h-full object-contain md:object-cover"
            style={{ objectPosition: "center", maxWidth: "100%" }}
          />
        </Link>
      </div>

      <div className="relative overflow-hidden max-w-[435px] mx-auto md:flex-1 md:min-h-0">
        <Link
          href="/cafes"
          className="block w-full h-full"
          aria-label="Ir a cafés"
        >
          <img
            src="/bannerHome/30 CAFES.svg"
            alt="Cafés"
            className="block w-full h-auto md:h-full object-contain md:object-cover"
            style={{ objectPosition: "center", maxWidth: "100%" }}
            loading="lazy"
          />
        </Link>
      </div>
    </div>
  );
}

type BottomHomeBannerProps = {
  href?: string;
  src?: string;
  mobileSrc?: string;
  alt?: string;
};

export function BottomHomeBanner({
  href = "/monumentos-nacionales",
  src = "/bannerHome/BANNER MONUMENTOS.svg",
  mobileSrc = "/bannerHome/monumentos movil.png",
  alt = "Monumentos Nacionales",
}: BottomHomeBannerProps) {
  const desktopSrc = encodeURI(src);
  const mobileSrcSet = mobileSrc ? encodeURI(mobileSrc) : undefined;

  return (
    <Link href={href} className="block w-full">
      <picture>
        {mobileSrcSet ? (
          <source media="(max-width: 767.98px)" srcSet={mobileSrcSet} />
        ) : null}
        <img
          src={desktopSrc}
          alt={alt}
          className="w-full h-auto"
          loading="lazy"
        />
      </picture>
    </Link>
  );
}
