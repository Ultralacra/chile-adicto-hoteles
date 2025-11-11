"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LanguageSwitcher } from "./language-switcher";

interface MobileFooterContentProps {
  onNavigate?: () => void; // cerrar menú al navegar
}
export function MobileFooterContent({ onNavigate }: MobileFooterContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Comunas para la categoría restaurantes (mismo set que desktop)
  const communes = [
    "Vitacura",
    "Las Condes",
    "Santiago",
    "Lo Barnechea",
    "Providencia",
    "Alto Jahuel",
    "La Reina",
  ];

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const activeComunaParam = searchParams?.get("comuna") || null;
  const activeComuna = activeComunaParam
    ? activeComunaParam.replace(/-/g, " ").toLowerCase()
    : null;

  // Detectar si estamos navegando la categoría restaurantes
  const isRestaurantsCategory = pathname?.startsWith("/categoria/restaurantes");

  // Reordenar categorías dejando RESTAURANTES al final
  const items = [
    { slug: "todos", label: "TODOS" },
    { slug: "arquitectura", label: "ARQUITECTURA" },
    { slug: "barrios", label: "BARRIOS" },
    { slug: "iconos", label: "ICONOS" },
    { slug: "mercados", label: "MERCADOS" },
    { slug: "miradores", label: "MIRADORES" },
    { slug: "museos", label: "CULTURA" },
    { slug: "palacios", label: "PALACIOS" },
    { slug: "parques", label: "PARQUES" },
    { slug: "paseos-fuera-de-santiago", label: "FUERA DE STGO" },
    // RESTAURANTES al final siempre
    { slug: "restaurantes", label: "RESTAURANTES" },
  ];

  return (
    <div>
      {/* Logo (blanco) */}
      <div className="mb-8 flex justify-center">
        <div className="w-48">
          <Image
            src="/santiago-adicto-blanco-4-footer.svg"
            alt="Chile Adicto"
            width={240}
            height={72}
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Subtitle divider removed - handled on page content */}

      <nav className="mb-8 space-y-8">
        {isRestaurantsCategory ? (
          // Submenú de comunas en formato vertical (una debajo de otra)
          <ul className="space-y-4 text-center">
            <li>
              <Link
                href="/categoria/restaurantes"
                className={`font-neutra-demi text-[15px] leading-[20px] font-[600] transition-colors ${
                  !activeComuna ? "text-[#E40E36]" : "text-white"
                } hover:text-gray-300`}
                onClick={() => onNavigate?.()}
              >
                VOLVER
              </Link>
            </li>
            {communes.map((c) => {
              const isActive = activeComuna === c.toLowerCase();
              return (
                <li key={c}>
                  <Link
                    href={`/categoria/restaurantes?comuna=${slugify(c)}`}
                    className={`font-neutra-demi text-[15px] leading-[20px] font-[600] transition-colors ${
                      isActive ? "text-[#E40E36]" : "text-white"
                    } hover:text-gray-300`}
                    onClick={() => onNavigate?.()}
                  >
                    {c.toUpperCase()}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-4 text-center">
            {items.map((item) => (
              <li key={item.slug}>
                <Link
                  href={item.slug === "todos" ? "/" : `/categoria/${item.slug}`}
                  className="font-neutra-demi text-[15px] leading-[20px] font-[600] text-white hover:text-gray-300 transition-colors"
                  onClick={() => onNavigate?.()}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {/* Language Switcher al final del bloque de navegación */}
        <div className="pt-6 flex justify-center">
          <LanguageSwitcher dark />
        </div>
      </nav>

      {/* Contact: top divider spans site content width */}
      <div className="w-full px-4 mb-12">
        <div className="max-w-7xl mx-auto border-t-[3px] border-white/30 pt-8 text-center">
          <a
            href="mailto:PATO@CLOSER.CL"
            className="text-white text-sm hover:text-gray-300 transition-colors"
          >
            PATO@CLOSER.CL
          </a>
        </div>
      </div>

      {/* Bottom Logos */}
      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
        <div className="flex justify-center">
          <Image
            src="/chilehoteles-blancos-footer.svg"
            alt="Chile Hoteles"
            width={120}
            height={48}
            className="h-12 w-auto"
          />
        </div>
        <div className="flex justify-center">
          <Image
            src="/chile-blanco-1-footer.svg"
            alt="Chile"
            width={80}
            height={48}
            className="h-12 w-auto"
          />
        </div>
        <div className="flex justify-center">
          <Image
            src="/santiago-adicto-blanco-4-footer.svg"
            alt="Stgo adicto"
            width={120}
            height={48}
            className="h-12 w-auto"
          />
        </div>
        <div className="flex justify-center">
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
  );
}
