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

              <Link href="/" aria-label={t("Ir al inicio", "Go to home")} className="absolute left-1/2 -translate-x-1/2">
                <Image
                  src="/Santiago-adicto-Guia%202.svg"
                  alt={t("Chile Adicto 50 Best", "Santiago Adicto 50 Best")}
                  width={260}
                  height={90}
                  className="h-20 w-auto"
                  priority
                />
              </Link>

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
            <div className="flex items-center">
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
            </div>

            {/* Desktop: Right side */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <LanguageSwitcher />
                </div>
                <RealTimeSearch className="w-full min-w-[280px] max-w-[400px]" />
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/guiasantiagoadicto/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Santiago Adicto Guia - Instagram"
                >
                  <Image
                    src="/Santiago-adicto-Guia-nuevo.svg"
                    alt="Santiago Adicto"
                    width={70}
                    height={50}
                    className="h-10 w-auto"
                  />
                </a>

                <a
                  href="https://www.instagram.com/chileadictohoteles/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chile Adicto Hoteles - Instagram"
                >
                  <Image
                    src="/Chile-adicto-Hotels-nuevo.svg"
                    alt="Chile Adicto Hoteles"
                    width={70}
                    height={50}
                    className="h-10 w-auto"
                  />
                </a>

                <a
                  href="https://www.instagram.com/adictoachile/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chile Adicto - Instagram"
                >
                  <Image
                    src="/Chile-Adicto-logo-nuevo.svg"
                    alt="Chile Adicto"
                    width={70}
                    height={50}
                    className="h-10 w-auto"
                  />
                </a>
              </div>
              <a
                href="https://www.marcachile.cl/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="We Care - Marca Chile"
              >
                <Image
                  src="/wecare-nuevo-rojo.svg"
                  alt="We Care"
                  width={100}
                  height={100}
                  className="h-24 w-auto"
                />
              </a>
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
