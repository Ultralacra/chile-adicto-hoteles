"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { PRETTY_CATEGORY_SLUGS } from "@/lib/pretty-category-slugs";

export type DestinationCategory = {
  slug: string;
  label_es?: string | null;
  label_en?: string | null;
};

type DestinationOption = {
  kind: "category" | "post";
  slug: string;
  label: string;
  href: string;
};

type DestinationComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  categories: DestinationCategory[];
  fetchWithSite: (url: string, init?: RequestInit) => Promise<Response>;
  currentSite?: string | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function normalizeSearch(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function categoryToOption(category: DestinationCategory): DestinationOption {
  const slug = String(category.slug || "").trim();
  const label =
    String(category.label_es || "").trim() ||
    String(category.label_en || "").trim() ||
    slug;
  return {
    kind: "category",
    slug,
    label,
    href: PRETTY_CATEGORY_SLUGS.has(slug) ? `/${slug}` : `/categoria/${slug}`,
  };
}

export function DestinationCombobox({
  value,
  onChange,
  categories,
  fetchWithSite,
  currentSite,
  placeholder = "/categoria o /mi-post",
  disabled = false,
  className = "",
}: DestinationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [postOptions, setPostOptions] = useState<DestinationOption[]>([]);
  const blurTimerRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  const categoryOptions = useMemo(() => {
    const q = normalizeSearch(query.trim());
    return (categories || [])
      .map(categoryToOption)
      .filter((option) => {
        if (!q) return true;
        return normalizeSearch(`${option.slug} ${option.label}`).includes(q);
      })
      .slice(0, 10);
  }, [categories, query]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 1) {
      setPostOptions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchWithSite(
          `/api/posts/search?q=${encodeURIComponent(q)}&limit=30`,
          { cache: "no-store", signal: controller.signal },
        );
        const json = res.ok ? await res.json() : null;
        if (requestId !== requestIdRef.current) return;
        const rows = Array.isArray(json?.items) ? json.items : [];
        const mapped: DestinationOption[] = rows
          .map((row: any) => {
            const slug = String(row?.slug || "").trim();
            const label =
              (row?.es?.name ? String(row.es.name) : "") ||
              (row?.name_es ? String(row.name_es) : "") ||
              (row?.en?.name ? String(row.en.name) : "") ||
              (row?.name_en ? String(row.name_en) : "") ||
              slug;
            return {
              kind: "post",
              slug,
              label,
              href: `/${slug}`,
            } as DestinationOption;
          })
          .filter((option: DestinationOption) => Boolean(option.slug))
          .slice(0, 10);
        setPostOptions(mapped);
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        if (requestId === requestIdRef.current) setPostOptions([]);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query, fetchWithSite, currentSite]);

  useEffect(
    () => () => {
      if (blurTimerRef.current != null) {
        window.clearTimeout(blurTimerRef.current);
      }
    },
    [],
  );

  const selectOption = (option: DestinationOption) => {
    onChange(option.href);
    setQuery(option.href.replace(/^\//, ""));
    setOpen(false);
  };

  const hasResults =
    categoryOptions.length > 0 || postOptions.length > 0;

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          className={className}
          onFocus={() => {
            if (blurTimerRef.current != null) {
              window.clearTimeout(blurTimerRef.current);
            }
            setQuery(String(value || "").replace(/^\//, ""));
            setOpen(true);
          }}
          onBlur={() => {
            blurTimerRef.current = window.setTimeout(() => {
              setOpen(false);
            }, 150);
          }}
          onChange={(event) => {
            const next = event.target.value;
            onChange(next);
            setQuery(next.replace(/^\//, ""));
            setOpen(true);
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="z-[60] w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="max-h-64 overflow-auto">
          {loading && !hasResults ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Buscando…
            </div>
          ) : null}

          {categoryOptions.length > 0 ? (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Categorías
              </div>
              {categoryOptions.map((option) => (
                <button
                  key={`category:${option.slug}`}
                  type="button"
                  className="w-full border-b border-black/10 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-[#f7f7f4]"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  title={option.href}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{option.label}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      Categoría
                    </span>
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {option.href}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {postOptions.length > 0 ? (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Posts
              </div>
              {postOptions.map((option) => (
                <button
                  key={`post:${option.slug}`}
                  type="button"
                  className="w-full border-b border-black/10 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-[#f7f7f4]"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  title={option.href}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{option.label}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      Post
                    </span>
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {option.href}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {!loading && !hasResults ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Sin sugerencias. Puedes escribir la ruta manualmente.
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
