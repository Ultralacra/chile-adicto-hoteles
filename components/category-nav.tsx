"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

interface CategoryNavProps {
  activeCategory?: string;
}

export const categories = [
  { slug: "todos", labelEs: "TODOS", labelEn: "ALL" },
  { slug: "arquitectura", labelEs: "ARQUITECTURA", labelEn: "Architecture" },
  { slug: "barrios", labelEs: "BARRIOS", labelEn: "Neighborhoods" },
  { slug: "iconos", labelEs: "ICONOS", labelEn: "Icons" },
  { slug: "mercados", labelEs: "MERCADOS", labelEn: "Markets" },
  { slug: "miradores", labelEs: "MIRADORES", labelEn: "Viewpoints" },
  { slug: "cultura", labelEs: "CULTURA", labelEn: "Culture" },
  { slug: "palacios", labelEs: "PALACIOS", labelEn: "Palaces" },
  { slug: "parques", labelEs: "PARQUES", labelEn: "Parks" },
  { slug: "fuera-de-stgo", labelEs: "FUERA DE STGO", labelEn: "OUTSIDE STGO" },
];

export function CategoryNav({ activeCategory = "todos" }: CategoryNavProps) {
  const { language } = useLanguage();

  return (
    <nav className="py-4 ">
      <ul className="flex flex-wrap items-center gap-3 text-sm font-medium">
        {categories.map((category, index) => (
          <li key={category.slug} className="flex items-center gap-3">
            <Link
              href={
                category.slug === "todos" ? "/" : `/categoria/${category.slug}`
              }
              className={`font-neutra hover:text-[var(--color-brand-red)] transition-colors tracking-wide text-[16px] leading-[20px] ${
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
