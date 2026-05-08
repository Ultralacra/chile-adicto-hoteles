"use client";

import Link from "next/link";

export function PromoStackBanners() {
  return (
    <div className="w-full flex flex-col gap-4 overflow-hidden h-[435px] md:h-[520px] lg:h-[437px]">
      <div
        className="flex-1 min-h-0 relative overflow-hidden max-w-[435px] mx-auto"
        style={{ height: 210 }}
      >
        <Link
          href="/categoria/la-ruta-toyota"
          className="block w-full h-full"
          aria-label="Ir a La Ruta Toyota"
        >
          <img
            src="/bannerstoyota/BANNER RUTA TOYOTA.webp"
            alt="La Ruta Toyota"
            className="w-full h-full object-contain md:object-cover"
            style={{
              objectPosition: "center",
              width: 435,
              height: 210,
              maxWidth: "100%",
            }}
          />
        </Link>
      </div>

      <div
        className="flex-1 min-h-0 relative overflow-hidden max-w-[435px] mx-auto"
        style={{ height: 210 }}
      >
        <Link
          href="/cafes"
          className="block w-full h-full"
          aria-label="Ir a cafés"
        >
          <img
            src="/bannerHome/30 CAFES.png"
            alt="Cafés"
            className="w-full h-full object-contain md:object-cover"
            style={{
              objectPosition: "center",
              width: 435,
              height: 210,
              maxWidth: "100%",
            }}
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
  mobileSrc,
  alt = "Monumentos Nacionales",
}: BottomHomeBannerProps) {
  const desktopSrc = encodeURI(src);
  const mobileSrcEncoded = mobileSrc ? encodeURI(mobileSrc) : undefined;

  return (
    <Link href={href} className="block w-full">
      {mobileSrcEncoded ? (
        <>
          <img
            src={mobileSrcEncoded}
            alt={alt}
            className="w-full h-auto md:hidden"
            loading="lazy"
          />
          <img
            src={desktopSrc}
            alt={alt}
            className="w-full h-auto hidden md:block"
            loading="lazy"
          />
        </>
      ) : (
        <img
          src={desktopSrc}
          alt={alt}
          className="w-full h-auto"
          loading="lazy"
        />
      )}
    </Link>
  );
}
