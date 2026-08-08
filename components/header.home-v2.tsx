"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { LanguageSwitcher } from "./language-switcher";
import { RealTimeSearch } from "./real-time-search";
import { useLanguage } from "@/contexts/language-context";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <header className="">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="site-inner py-4 font-neutra text-[16px] leading-[20px] text-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Image
                  src="/wecare.svg"
                  alt="We Care"
                  width={72}
                  height={72}
                  className="h-14 w-auto"
                />
              </div>

              <div className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center">
                <Link href="/" aria-label={t("Ir al inicio", "Go to home")}>
                  <Image
                    src="/Santiago-adicto-Guia%202.svg"
                    alt={t("Chile Adicto 50 Best", "Santiago Adicto 50 Best")}
                    width={260}
                    height={90}
                    className="h-20 w-auto"
                    priority
                  />
                </Link>
                <p className="text-[12px] leading-none text-black">
                  Página en desarrollo
                </p>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="text-black p-2"
                  aria-label="Open menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* Mobile: Search below logo */}
          <div className="px-4 pb-4">
            <RealTimeSearch className="w-full" />
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block site-inner py-6 font-neutra text-[16px] leading-[20px] text-black">
          <div className="flex items-center justify-between">
            {/* Desktop: Logo on left */}
            <div className="flex flex-col items-start">
              <Link href="/" aria-label={t("Ir al inicio", "Go to home")}>
                <Image
                  src="/Santiago-adicto-Guia%202.svg"
                  alt={t("Santiago Adicto", "Santiago Adicto")}
                  width={360}
                  height={110}
                  className="h-24 w-auto"
                  priority
                />
              </Link>
              <p className="text-[12px] leading-none text-black">
                Página en desarrollo
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <LanguageSwitcher />
                </div>
                <RealTimeSearch className="w-full min-w-[280px] max-w-[400px]" />
              </div>
              <Link href="/agenda-cultural" aria-label="Ir a Agenda Cultural">
                <Image
                  src="/bannersagenda/BANER AGENDA HEADER.png"
                  alt="Agenda Cultural"
                  width={460}
                  height={120}
                  className="h-[120px] w-auto"
                  priority
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
