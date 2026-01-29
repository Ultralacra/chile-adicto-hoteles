"use client";

import Image from "next/image";

export function AgendaCulturalBanner() {
  return (
    <div
      className="rounded-[15px] overflow-hidden"
      aria-label="Agenda Cultural"
    >
      <Image
        src="/AGENDA CULTURAL HEADER.svg"
        alt="Agenda Cultural"
        width={708}
        height={136}
        className="h-[136px] w-[708px]"
        priority
      />
    </div>
  );
}
