import Image from "next/image";
import { MobileFooterContent } from "./mobile-footer-content";
import { useLanguage } from "@/contexts/language-context";
import { categories as CATEGORIES } from "./category-nav";

interface FooterProps {
  activeCategory?: string;
}

export function Footer({ activeCategory = "todos" }: FooterProps) {
  const { language } = useLanguage();
  return (
    <footer className="bg-black text-white py-12 mt-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Mobile: show MobileFooterContent as primary footer content */}
        <div className="lg:hidden">
          <MobileFooterContent />
        </div>

        {/* Desktop footer remains unchanged */}
        <div className="hidden lg:flex flex-col lg:flex-row items-start lg:items-stretch justify-between gap-8">
          <div className="flex-shrink-0">
            <Image
              src="/Santiago-adicto-Guia-blanco1.svg"
              alt="Chile adicto 50 BEST"
              width={300}
              height={84}
              className="h-20 w-auto"
            />
          </div>

          <nav className="flex flex-col gap-1 text-sm">
            {CATEGORIES.map((c) => (
              <a
                key={c.slug}
                href={c.slug === "todos" ? "/" : `/categoria/${c.slug}`}
                className={`font-neutra-demi text-[14px] leading-[19px] font-[600] transition-colors duration-200 ease-in-out hover:text-[var(--color-brand-red)] ${
                  activeCategory === c.slug
                    ? "text-[var(--color-brand-red)]"
                    : "text-white"
                }`}
              >
                {language === "es" ? c.labelEs : c.labelEn.toUpperCase()}
              </a>
            ))}
          </nav>

          <div className="flex-1 flex flex-col h-full">
            <div className="mb-4">
              <h3 className="font-neutra-demi text-[22px] leading-[22px] font-[400] text-white">
                “No es que la gente quiera las ciudades porque son bellas; las
                ciudades son bellas cuando la gente las quiere.”
              </h3>
            </div>

            <div className="flex-1 flex items-center justify-center gap-10 flex-wrap">
              <div className="text-sm mr-4 whitespace-nowrap">
                PATO@CLOSER.CL
              </div>
              <Image
                src="/santiago-adicto-blanco-4-footer.svg"
                alt="Stgo adicto"
                width={120}
                height={48}
                className="h-12 w-auto"
              />
              <Image
                src="/chilehoteles-blancos-footer.svg"
                alt="Chile Hoteles"
                width={120}
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
