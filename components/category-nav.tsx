"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useSiteApi } from "@/hooks/use-site-api";

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
  {
    slug: "monumentos-nacionales",
    labelEs: "MONUMENTOS",
    labelEn: "MONUMENTS",
  },
  { slug: "cafes", labelEs: "CAFÉS", labelEn: "CAFÉS" },
  { slug: "restaurantes", labelEs: "RESTOS", labelEn: "REST" },
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
  const { cachedFetchWithSite } = useSiteApi();
  const router = useRouter();
  const [items, setItems] = useState(fallbackCategories);

  const handleBack = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("nav:direction", "back");
    }
    router.back();
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const json = await cachedFetchWithSite("/api/categories?full=1&nav=1");
        const rows: ApiCategoryRow[] = Array.isArray(json) ? json : [];
        const mapped = rows
          .filter((r) => r && r.slug && String(r.slug) !== "la-ruta-toyota")
          .map((r) => {
            const slug = String(r.slug);
            const fallback = fallbackCategories.find((c) => c.slug === slug);

            // Overrides solo en front
            if (slug === "restaurantes") {
              return { slug, labelEs: "RESTOS", labelEn: "REST" };
            }

            return {
              slug,
              labelEs: String(
                r.label_es || fallback?.labelEs || slug.toUpperCase(),
              ).toUpperCase(),
              labelEn: String(
                r.label_en || fallback?.labelEn || slug,
              ).toUpperCase(),
            };
          });

        // Asegurar orden estable:
        // - "todos" primero
        // - "restaurantes" cerca del final
        // - "tienda/tiendas" siempre al final
        const todos = mapped.find((x) => x.slug === "todos");
        const rest = mapped.filter((x) => x.slug !== "todos");
        const restaurants = rest.filter((x) => x.slug === "restaurantes");
        const tienda = rest.filter(
          (x) => x.slug === "tienda" || x.slug === "tiendas",
        );
        const others = rest.filter(
          (x) =>
            x.slug !== "restaurantes" &&
            x.slug !== "tienda" &&
            x.slug !== "tiendas",
        );

        // Forzar agregar PARQUES si no viene del API
        const parquesItem = fallbackCategories.find((c) => c.slug === "parques");
        const hasParques = rest.some((x) => x.slug === "parques");

        let fullOthers = [...others];
        if (!hasParques && parquesItem) {
          fullOthers.push({ slug: parquesItem.slug, labelEs: parquesItem.labelEs, labelEn: parquesItem.labelEn });
        }

        // Ordenar: quitar la ruta toyota y ordenar alfabéticamente
        const finalList = [
          todos || fallbackCategories[0],
          ...fullOthers
            .filter((x) => x.slug !== "la-ruta-toyota")
            .sort((a, b) => {
              const order = ["arquitectura", "barrios", "iconos", "mercados", "miradores", "museos", "palacios", "parques", "paseos-fuera-de-santiago", "ninos", "monumentos-nacionales", "cafes"];
              const idxA = order.indexOf(a.slug);
              const idxB = order.indexOf(b.slug);
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              return a.slug.localeCompare(b.slug);
            }),
          ...restaurants,
          ...tienda,
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
  }, [cachedFetchWithSite]);

  const hrefFor = (slug: string) => {
    if (slug === "todos") return "/";
    if (slug === "tiendas" || slug === "tienda")
      return "/categoria/sorpresas-urbanas";
    // Mantener URL bonita si existe rewrite; si no, usar /categoria/<slug>
    return prettySlugs.has(slug) ? `/${slug}` : `/categoria/${slug}`;
  };

  return (
    // Hide desktop category nav on small screens; mobile menu provides navigation
    <nav className={compact ? "py-2" : "py-4"}>
      <ul className="hidden lg:flex flex-nowrap items-center gap-2 text-sm font-medium whitespace-nowrap">
        {activeCategory !== "todos" && (
          <li className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="hover:opacity-80 transition-opacity"
              aria-label={language === "es" ? "Volver" : "Back"}
              title={language === "es" ? "Volver" : "Back"}
            >
              <Image
                src="/Group 8.png"
                alt={language === "es" ? "Volver" : "Back"}
                width={100}
                height={66}
                className="h-11 w-auto"
              />
            </button>
            <span className="text-black">•</span>
          </li>
        )}
        {items.map((category, index) => (
          <li key={category.slug} className="flex items-center gap-2">
            <Link
              href={hrefFor(category.slug)}
              className={`font-neutra hover:text-[var(--color-brand-red)] transition-colors tracking-wide text-[12px] leading-[16px] ${
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
