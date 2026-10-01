"use client";

import Image from "next/image";
import Link from "next/link";
import { getResizedBannerSrc } from "@/lib/banner-image";

export function AgendaCulturalBanner() {
  return (
    <div className="rounded-[15px] overflow-hidden" aria-label="Agenda Cultural">
      <Link
        href="/agenda-cultural"
        aria-label="Ir a Agenda Cultural"
        className="block"
      >
        <Image
          src={getResizedBannerSrc("/bannersagenda/BANER AGENDA HEADER.webp", {
            width: 1300,
            quality: 72,
          })}
          alt="Agenda Cultural"
          width={652}
          height={120}
          className="h-[120px] w-auto max-w-full"
          priority
          unoptimized
        />
      </Link>
    </div>
  );
}
