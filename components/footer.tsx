"use client";

import Image from "next/image";
import { MobileFooterContent } from "./mobile-footer-content";
import { useLanguage } from "@/contexts/language-context";

interface FooterProps {
  activeCategory?: string;
}

export function Footer({ activeCategory = "todos" }: FooterProps) {
  const { language } = useLanguage();
  return (
    <footer className="bg-black text-white pt-[60px] pb-[20px] mt-16">
      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* Mobile: show MobileFooterContent as primary footer content */}
        <div className="lg:hidden">
          <MobileFooterContent />
        </div>

        {/* Adjusted grid gaps: reduced gap between logo and menu (gap-8), increased gap between menu and right section (gap-20) */}
        <div className="hidden lg:flex lg:items-start lg:gap-8">
          {/* Left: Logo aligned to bottom */}
          <div className="flex-shrink-0 mt-32">
            <Image
              src="/Santiago-adicto-Guia-blanco1.svg"
              alt="Stgo adicto"
              width={300}
              height={84}
              className="h-20 w-auto"
            />
          </div>

          {/* Center: Navigation aligned to bottom with proper capitalization */}
          <nav className="flex flex-col gap-1 text-sm lg:ml-4">
            <a
              href="/"
              className={`font-neutra-demi text-[15px] leading-[20px] font-[600] transition-colors duration-200 ease-in-out hover:text-[#FF0000] uppercase ${
                activeCategory === "todos" ? "text-[#FF0000]" : "text-white"
              }`}
            >
              TODOS
            </a>
            <a
              href="/categoria/arquitectura"
              className={`font-neutra-demi text-[15px] leading-[20px] font-[600] transition-colors duration-200 ease-in-out hover:text-[#FF0000] uppercase ${
                activeCategory === "arquitectura"
                  ? "text-[#FF0000]"
                  : "text-white"
              }`}
            >
              ARQUITECTURA
            </a>
            <a
              href="/categoria/barrios"
              className={`font-neutra-demi text-[15px] leading-[20px] font-[600] transition-colors duration-200 ease-in-out hover:text-[#FF0000] uppercase ${
                activeCategory === "barrios" ? "text-[#FF0000]" : "text-white"
              }`}
            >
              BARRIOS
            </a>
            <a
              href="/categoria/iconos"
              className={`font-neutra-demi text-[15px] leading-[20px] font-[600] transition-colors duration-200 ease-in-out hover:text-[#FF0000] uppercase ${
                activeCategory === "iconos" ? "text-[#FF0000]" : "text-white"
              }`}
            >
              ICONOS
            </a>
            <a
              href="/categoria/mercados"
              className={`font-neutra-demi text-[15px] leading-[20px] font-[600] transition-colors duration-200 ease-in-out hover:text-[#FF0000] uppercase ${
                activeCategory === "mercados" ? "text-[#FF0000]" : "text-white"
              }`}
            >
              MERCADOS
            </a>
            <a
              href="/categoria/miradores"
              className={`font-neutra-demi text-[15px] leading-[20px] font-[600] transition-colors duration-200 ease-in-out hover:text-[#FF0000] uppercase ${
                activeCategory === "miradores" ? "text-[#FF0000]" : "text-white"
              }`}
            >
              MIRADORES
            </a>
            <a
              href="/categoria/cultura"
              className={`font-neutra-demi text-[15px] leading-[20px] font-[600] transition-colors duration-200 ease-in-out hover:text-[#FF0000] uppercase ${
                activeCategory === "cultura" ? "text-[#FF0000]" : "text-white"
              }`}
            >
              CULTURA
            </a>
            <a
              href="/categoria/palacios"
              className={`font-neutra-demi text-[15px] leading-[20px] font-[600] transition-colors duration-200 ease-in-out hover:text-[#FF0000] uppercase ${
                activeCategory === "palacios" ? "text-[#FF0000]" : "text-white"
              }`}
            >
              PALACIOS
            </a>
            <a
              href="/categoria/parques"
              className={`font-neutra-demi text-[15px] leading-[20px] font-[600] transition-colors duration-200 ease-in-out hover:text-[#FF0000] uppercase ${
                activeCategory === "parques" ? "text-[#FF0000]" : "text-white"
              }`}
            >
              PARQUES
            </a>
            <a
              href="/categoria/fuera-de-stgo"
              className={`font-neutra-demi text-[15px] leading-[20px] font-[600] transition-colors duration-200 ease-in-out hover:text-[#FF0000] uppercase ${
                activeCategory === "fuera-de-stgo"
                  ? "text-[#FF0000]"
                  : "text-white"
              }`}
            >
              FUERA DE STGO
            </a>
          </nav>

          {/* Right: Quote at top, email and logos at bottom in same row */}
          <div className="flex flex-col justify-between min-w-[500px] ml-16 flex-1 min-h-[200px]">
            {/* Quote at the top */}
            <div className="self-start">
              <h2 className="font-neutra-demi text-[18px] leading-[24px] font-[400] text-white">
                "No es que la gente quiera las ciudades porque son bellas;
                <br />
                las ciudades son bellas cuando la gente las quiere."
              </h2>
            </div>

            <div className="flex items-baseline justify-between w-full mt-16 gap-6">
              <a
                href="mailto:pato@closer.cl"
                className="text-sm hover:text-[#FF0000] transition-colors uppercase flex-shrink-0"
              >
                PATO@CLOSER.CL
              </a>
              <a
                href="https://www.instagram.com/guiasantiagoadicto/?hl=es-la"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <Image
                  src="/santiago-adicto-blanco-4-footer.svg"
                  alt="Stgo adicto"
                  width={100}
                  height={40}
                  className="h-10 w-auto"
                />
              </a>
              <a
                href="https://www.instagram.com/chileadictohoteles"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <Image
                  src="/chilehoteles-blancos-footer.svg"
                  alt="Chile adicto"
                  width={100}
                  height={40}
                  className="h-10 w-auto"
                />
              </a>
              <a
                href="https://www.instagram.com/adictoachile/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <Image
                  src="/santiago-adicto-blanco-4-footer.svg"
                  alt="Stgo adicto"
                  width={100}
                  height={40}
                  className="h-10 w-auto"
                />
              </a>
              <a
                href="https://www.marcachile.cl/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <Image
                  src="/wecare-blaco-2-footer.svg"
                  alt="WE CARE"
                  width={89}
                  height={98}
                  className="h-[98px] w-auto borderp-2"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
