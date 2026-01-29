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
          <div className="w-full h-full grid place-items-center bg-black text-white font-neutra tracking-wide">
            CAFÉS (PRONTO)
          </div>
        </Link>
      </div>
    </div>
  );
}

export function BottomHomeBanner() {
  return (
    <Link href="/monumentos-nacionales" className="block w-full">
      <img
        src="/BANNER MONUMENTOS.svg"
        alt="Monumentos Nacionales"
        className="w-full h-auto"
        loading="lazy"
      />
    </Link>
  );
}
