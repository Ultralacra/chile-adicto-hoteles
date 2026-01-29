"use client";

import Link from "next/link";

export function PromoStackBanners() {
  return (
    <div className="w-full h-[260px] md:h-[520px] lg:h-[437px] flex flex-col gap-4 overflow-hidden">
      <div className="flex-1 min-h-0 relative bg-black overflow-hidden">
        <Link
          href="https://chile-adicto-hoteles-front.vercel.app/"
          className="block w-full h-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/70 HOTELES.svg"
            alt="Hoteles"
            className="object-cover object-top w-full h-full"
          />
        </Link>
      </div>

      <div className="flex-1 min-h-0 relative bg-black overflow-hidden">
        <Link
          href="/cafes"
          className="block w-full h-full"
          aria-label="Ir a cafés"
        >
          <img
            src="/40 CAFES.png"
            alt="Cafés"
            className="object-cover object-top w-full h-full"
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
  src = "/BANNER MONUMENTOS.svg",
  alt = "Monumentos Nacionales",
}: BottomHomeBannerProps) {
  return (
    <Link href={href} className="block w-full">
      <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
    </Link>
  );
}
