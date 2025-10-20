"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface BreadcrumbProps {
  hotelName: string;
  category: string;
}

export function Breadcrumb({ hotelName, category }: BreadcrumbProps) {
  const { t } = useLanguage();

  return (
    <nav className="px-4 py-2" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-xs md:text-sm text-[var(--color-brand-gray)] flex-wrap">
        <li>
          <Link
            href="/"
            className="hover:text-[var(--color-brand-red)] transition-colors"
          >
            {t("Inicio", "Home")}
          </Link>
        </li>
        <li>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
        </li>
        <li>
          <Link
            href={`/?category=${category}`}
            className="hover:text-[var(--color-brand-red)] transition-colors"
          >
            {category}
          </Link>
        </li>
        <li>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
        </li>
        <li
          className="text-[var(--color-brand-black)] font-medium truncate max-w-[200px] md:max-w-none"
          aria-current="page"
        >
          <span dangerouslySetInnerHTML={{ __html: hotelName }} />
        </li>
      </ol>
    </nav>
  );
}
