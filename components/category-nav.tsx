"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

interface CategoryNavProps {
  activeCategory?: string;
}

const categories = [
  { slug: "todos", labelEs: "TODOS", labelEn: "ALL" },
  { slug: "norte", labelEs: "NORTE", labelEn: "NORTH" },
  { slug: "centro", labelEs: "CENTRO", labelEn: "CENTER" },
  { slug: "sur", labelEs: "SUR", labelEn: "SOUTH" },
  {
    slug: "isla-de-pascua",
    labelEs: "ISLA DE PASCUA",
    labelEn: "EASTER ISLAND",
  },
  { slug: "santiago", labelEs: "SANTIAGO", labelEn: "SANTIAGO" },
  { slug: "guia-impresa", labelEs: "GUÍA IMPRESA", labelEn: "PRINT GUIDE" },
  { slug: "prensa", labelEs: "PRENSA", labelEn: "PRESS" },
  { slug: "nosotros", labelEs: "NOSOTROS", labelEn: "ABOUT US" },
  {
    slug: "exploraciones-tnf",
    labelEs: "EXPLORACIONES TNF",
    labelEn: "TNF EXPLORATIONS",
  },
];

export function CategoryNav({ activeCategory = "todos" }: CategoryNavProps) {
  const { language } = useLanguage();

  return (
    <nav className="py-4 border-b border-gray-200">
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
              {language === "es" ? category.labelEs : category.labelEn}
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
