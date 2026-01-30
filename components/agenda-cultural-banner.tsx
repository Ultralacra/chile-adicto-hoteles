"use client";

import Image from "next/image";
import Link from "next/link";

export function AgendaCulturalBanner() {
  return (
    <div
      className="rounded-[15px] overflow-hidden"
      aria-label="Agenda Cultural"
    >
      <Link
        href="/categoria/agenda-cultural"
        aria-label="Ir a Agenda Cultural"
        className="block"
      >
        <Image
          src="/AGENDA CULTURAL HEADER.svg"
          alt="Agenda Cultural"
          width={708}
          height={136}
          className="h-[100px] w-auto max-w-full"
          priority
        />
      </Link>
    </div>
  );
}
