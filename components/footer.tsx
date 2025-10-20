import Image from "next/image";
import { MobileFooterContent } from "./mobile-footer-content";

export function Footer() {
  return (
    <footer className="bg-black text-white py-12 mt-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="hidden lg:flex flex-col lg:flex-row items-start lg:items-stretch justify-between gap-8">
          <div className="flex-shrink-0">
            <Image
              src="/logo-best-espanol-blanco-footer.svg"
              alt="Chile adicto 50 BEST"
              width={300}
              height={84}
              className="h-20 w-auto"
            />
          </div>

          <nav className="flex flex-col gap-1 text-sm">
            <a
              href="#"
              className="font-neutra-demi text-[14px] leading-[19px] font-[600] text-[var(--color-brand-red)] transition-colors duration-200 ease-in-out"
            >
              TODOS
            </a>
            <a
              href="#"
              className="font-neutra-demi text-[14px] leading-[19px] font-[600] transition-colors duration-200 ease-in-out hover:text-[var(--color-brand-red)]"
            >
              NORTE
            </a>
            <a
              href="#"
              className="font-neutra-demi text-[14px] leading-[19px] font-[600] transition-colors duration-200 ease-in-out hover:text-[var(--color-brand-red)]"
            >
              CENTRO
            </a>
            <a
              href="#"
              className="font-neutra-demi text-[14px] leading-[19px] font-[600] transition-colors duration-200 ease-in-out hover:text-[var(--color-brand-red)]"
            >
              SUR
            </a>
            <a
              href="#"
              className="font-neutra-demi text-[14px] leading-[19px] font-[600] transition-colors duration-200 ease-in-out hover:text-[var(--color-brand-red)]"
            >
              ISLA DE PASCUA
            </a>
            <a
              href="#"
              className="font-neutra-demi text-[14px] leading-[19px] font-[600] transition-colors duration-200 ease-in-out hover:text-[var(--color-brand-red)]"
            >
              SANTIAGO
            </a>
            <a
              href="#"
              className="font-neutra-demi text-[14px] leading-[19px] font-[600] transition-colors duration-200 ease-in-out hover:text-[var(--color-brand-red)]"
            >
              GUÍA IMPRESA
            </a>
            <a
              href="#"
              className="font-neutra-demi text-[14px] leading-[19px] font-[600] transition-colors duration-200 ease-in-out hover:text-[var(--color-brand-red)]"
            >
              PRENSA
            </a>
            <a
              href="#"
              className="font-neutra-demi text-[14px] leading-[19px] font-[600] transition-colors duration-200 ease-in-out hover:text-[var(--color-brand-red)]"
            >
              NOSOTROS
            </a>
            <a
              href="#"
              className="font-neutra-demi text-[14px] leading-[19px] font-[600] transition-colors duration-200 ease-in-out hover:text-[var(--color-brand-red)]"
            >
              EXPLORACIONES TNF
            </a>
          </nav>

          <div className="flex-1 flex flex-col h-full">
            {/* Mobile footer content (shared) */}
            <div className="lg:hidden mt-8">
              <MobileFooterContent />
            </div>
            <div className="mb-4">
              <h3 className="font-neutra-demi text-[22px] leading-[22px] font-[400] text-white">
                LOS MEJORES HOTELES DE CHILE.
              </h3>
            </div>

            <div className="flex-1 flex items-center justify-center gap-10 flex-wrap">
              <div className="text-sm mr-4 whitespace-nowrap">
                PATO@CLOSER.CL
              </div>
              <Image
                src="/chilehoteles-blancos-footer.svg"
                alt="Chile Hoteles"
                width={120}
                height={48}
                className="h-12 w-auto"
              />
              <Image
                src="/chile-blanco-1-footer.svg"
                alt="Chile"
                width={80}
                height={48}
                className="h-12 w-auto"
              />
              <Image
                src="/santiago-adicto-blanco-4-footer.svg"
                alt="Stgo adicto"
                width={120}
                height={48}
                className="h-12 w-auto"
              />
              <Image
                src="/wecare-blaco-2-footer.svg"
                alt="WE CARE"
                width={96}
                height={96}
                className="h-24 w-auto border border-white p-1"
              />
              {/* email moved to the left column on large screens */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
