"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/language-context";

interface CategoryNavProps {
  activeCategory?: string;
  compact?: boolean; // reduce padding vertical (posts)
}

const fallbackCategories = [
  { slug: "todos", labelEs: "TODOS", labelEn: "ALL" },
  { slug: "arquitectura", labelEs: "ARQ", labelEn: "ARQ" },
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
  { slug: "ninos", labelEs: "NIÑOS", labelEn: "KIDS" },
  { slug: "restaurantes", labelEs: "RESTAURANTES", labelEn: "Restaurants" },
];

type ApiCategoryRow = {
  slug: string;
  label_es: string | null;
  label_en: string | null;
  show_in_menu?: boolean | null;
  menu_order?: number | null;
};

const prettySlugs = new Set([
  "iconos",
  "ninos",
  "arquitectura",
  "barrios",
  "mercados",
  "miradores",
  "museos",
  "palacios",
  "parques",
  "paseos-fuera-de-santiago",
  "restaurantes",
]);

export function CategoryNav({
  activeCategory = "todos",
  compact = false,
}: CategoryNavProps) {
  const { language } = useLanguage();
  const [items, setItems] = useState(fallbackCategories);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/categories?full=1&nav=1", {
          cache: "no-store",
        });
        const json = res.ok ? await res.json() : [];
        const rows: ApiCategoryRow[] = Array.isArray(json) ? json : [];
        const mapped = rows
          .filter((r) => r && r.slug)
          .map((r) => {
            const slug = String(r.slug);
            const fallback = fallbackCategories.find((c) => c.slug === slug);
            return {
              slug,
              labelEs: String(
                r.label_es || fallback?.labelEs || slug.toUpperCase()
              ).toUpperCase(),
              labelEn: String(
                r.label_en || fallback?.labelEn || slug
              ).toUpperCase(),
            };
          });

        // Asegurar orden estable y RESTAURANTES al final como estaba
        const todos = mapped.find((x) => x.slug === "todos");
        const rest = mapped.filter((x) => x.slug !== "todos");
        const restaurants = rest.filter((x) => x.slug === "restaurantes");
        const others = rest.filter((x) => x.slug !== "restaurantes");
        const finalList = [
          todos || fallbackCategories[0],
          ...others,
          ...restaurants,
        ];

        if (!cancelled && finalList.length) setItems(finalList);
      } catch {
        // fallback
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hrefFor = (slug: string) => {
    if (slug === "todos") return "/";
    // Mantener URL bonita si existe rewrite; si no, usar /categoria/<slug>
    return prettySlugs.has(slug) ? `/${slug}` : `/categoria/${slug}`;
  };

  return (
    // Hide desktop category nav on small screens; mobile menu provides navigation
    <nav className={compact ? "py-2" : "py-4"}>
      <ul className="hidden lg:flex flex-nowrap items-center gap-2 text-sm font-medium whitespace-nowrap">
        {items.map((category, index) => (
          <li key={category.slug} className="flex items-center gap-2">
            <Link
              href={hrefFor(category.slug)}
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
            {index < items.length - 1 && <span className="text-black">•</span>}
          </li>
        ))}
      </ul>
    </nav>
  );
}
