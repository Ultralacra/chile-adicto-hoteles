"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="">
        <div className="container mx-auto px-4 py-6 max-w-7xl font-neutra text-[16px] leading-[20px] text-black">
          <div className="flex items-center justify-between lg:justify-between">
            <div className="flex items-center lg:hidden">
              <Image
                src="/wecare.svg"
                alt="We Care"
                width={72}
                height={72}
                className="h-14 w-auto"
              />
            </div>

            {/* Mobile: Centered main logo */}
            <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
              <Link href="/" aria-label="Ir al inicio">
                <Image
                  src="/logo-best-espanol.svg"
                  alt="Chile Adicto 50 Best"
                  width={260}
                  height={90}
                  className="h-20 w-auto"
                  priority
                />
              </Link>
            </div>

            <div className="flex items-center lg:hidden">
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

            {/* Desktop: Logo on left */}
            <div className="hidden lg:flex items-center">
              <Link href="/" aria-label="Ir al inicio">
                <Image
                  src="/logo-best-espanol.svg"
                  alt="Chile Adicto 50 Best"
                  width={360}
                  height={110}
                  className="h-24 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Desktop: Right side logos */}
            <div className="hidden lg:flex items-end gap-6">
              <LanguageSwitcher />
              <div className="flex items-center gap-4">
                <Image
                  src="/log-cadh.svg"
                  alt="Chile Adicto"
                  width={70}
                  height={50}
                  className="h-10 w-auto"
                />
                <Image
                  src="/log-cadh.svg"
                  alt="Chile Adicto"
                  width={70}
                  height={50}
                  className="h-10 w-auto"
                />
                <Image
                  src="/santiago-adicto.svg"
                  alt="Santiago Adicto"
                  width={70}
                  height={50}
                  className="h-10 w-auto"
                />
              </div>
              <Image
                src="/wecare.svg"
                alt="We Care"
                width={100}
                height={100}
                className="h-24 w-auto"
              />
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
