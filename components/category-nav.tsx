"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

interface CategoryNavProps {
  activeCategory?: string;
  compact?: boolean; // reduce padding vertical (posts)
}

export const categories = [
  { slug: "todos", labelEs: "TODOS", labelEn: "ALL" },
  { slug: "arquitectura", labelEs: "ARQUITECTURA", labelEn: "Architecture" },
  { slug: "barrios", labelEs: "BARRIOS", labelEn: "Neighborhoods" },
  { slug: "iconos", labelEs: "ICONOS", labelEn: "Icons" },
  { slug: "mercados", labelEs: "MERCADOS", labelEn: "Markets" },
  { slug: "miradores", labelEs: "MIRADORES", labelEn: "Viewpoints" },
  // Display label in ES should be "CULTURA" though slug remains "museos"
  { slug: "museos", labelEs: "CULTURA", labelEn: "Museums" },
  { slug: "palacios", labelEs: "PALACIOS", labelEn: "Palaces" },
  { slug: "parques", labelEs: "PARQUES", labelEn: "Parks" },
  {
    slug: "paseos-fuera-de-santiago",
    // Display label in ES should be "FUERA DE STGO" though slug remains
    labelEs: "FUERA DE STGO",
    labelEn: "TRIPS OUTSIDE SANTIAGO",
  },
  { slug: "restaurantes", labelEs: "RESTAURANTES", labelEn: "Restaurants" },
];

export function CategoryNav({
  activeCategory = "todos",
  compact = false,
}: CategoryNavProps) {
  const { language } = useLanguage();

  return (
    // Hide desktop category nav on small screens; mobile menu provides navigation
    <nav className={compact ? "py-2" : "py-4"}>
      <ul className="hidden lg:flex flex-nowrap items-center gap-2 text-sm font-medium whitespace-nowrap">
        {categories.map((category, index) => (
          <li key={category.slug} className="flex items-center gap-2">
            <Link
              href={category.slug === "todos" ? "/" : `/${category.slug}`}
              className={`font-neutra hover:text-[var(--color-brand-red)] transition-colors tracking-wide text-[15px] leading-[20px] ${
                activeCategory === category.slug
                  ? "text-[var(--color-brand-red)] font-normal"
                  : "text-black font-normal"
              }`}
            >
              {language === "es"
                ? category.labelEs
                : category.labelEn.toUpperCase()}
            </Link>
            {index < categories.length - 1 && (
              <span className="text-black">•</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
