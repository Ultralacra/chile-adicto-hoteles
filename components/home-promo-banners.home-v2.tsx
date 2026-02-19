"use client";

import Link from "next/link";
import Image from "next/image";

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
          <Image
            src="/bannerHome/70%20HOTELES.png"
            alt="Hoteles"
            width={5120}
            height={2240}
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 33vw, 435px"
            className="block w-full h-auto md:h-full object-contain md:object-cover"
            style={{ objectPosition: "center", maxWidth: "100%" }}
            priority={false}
          />
        </Link>
      </div>

      <div className="relative overflow-hidden max-w-[435px] mx-auto md:flex-1 md:min-h-0">
        <Link
          href="/cafes"
          className="block w-full h-full"
          aria-label="Ir a cafés"
        >
          <Image
            src="/bannerHome/30 CAFES.svg"
            alt="Cafés"
            width={435}
            height={210}
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 33vw, 435px"
            className="block w-full h-auto md:h-full object-contain md:object-cover"
            style={{ objectPosition: "center", maxWidth: "100%" }}
            loading="lazy"
            unoptimized
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
  return (
    <Link href={href} className="block w-full">
      {mobileSrc ? (
        <Image
          src={mobileSrc}
          alt={alt}
          width={5120}
          height={2240}
          sizes="100vw"
          className="block md:hidden w-full h-auto"
          loading="lazy"
        />
      ) : null}
      <Image
        src={src}
        alt={alt}
        width={1440}
        height={360}
        sizes="100vw"
        className={`${mobileSrc ? "hidden md:block" : "block"} w-full h-auto`}
        loading="lazy"
        unoptimized={String(src).toLowerCase().endsWith(".svg")}
      />
    </Link>
  );
}
