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
          href="https://chile-adicto-hoteles-front.vercel.app/"
          className="block w-full h-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/bannerHome/70 HOTELES.svg"
            alt="Hoteles"
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
            src="/bannerHome/30 CAFES.svg"
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
  alt?: string;
};

export function BottomHomeBanner({
  href = "/monumentos-nacionales",
  src = "/bannerHome/BANNER MONUMENTOS.svg",
  alt = "Monumentos Nacionales",
}: BottomHomeBannerProps) {
  return (
    <Link href={href} className="block w-full">
      <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
    </Link>
  );
}
