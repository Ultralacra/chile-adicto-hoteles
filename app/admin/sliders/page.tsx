"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAdminApi } from "@/hooks/use-admin-api";
import { useSiteContext } from "@/contexts/site-context";
import {
  buildSlotGroupsForSite,
  getBannerSlot,
  getBannerSlotsForSite,
  inferBannerSlotDevice,
  inferBannerSlotKind,
  slotBelongsToSite,
} from "@/lib/banner-slots";
import type { BannerSlotKind } from "@/lib/banner-slots";
import type { SiteId } from "@/lib/sites-config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Monitor,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Smartphone,
  Trash2,
} from "lucide-react";

type CategorySuggestion = {
  slug: string;
  label_es?: string | null;
  label_en?: string | null;
};

function languageFlagMeta(lang?: string | null): {
  code: "es" | "en";
  src: string;
  label: string;
} | null {
  const normalized = String(lang || "")
    .trim()
    .toLowerCase();
  if (normalized === "es") {
    return { code: "es", src: "/flags/cl.svg", label: "Español" };
  }
  if (normalized === "en") {
    return { code: "en", src: "/flags/us.svg", label: "Inglés" };
  }
  return null;
}

function LanguageFlagBadge({
  lang,
  selected = false,
  className = "",
}: {
  lang?: string | null;
  selected?: boolean;
  className?: string;
}) {
  const meta = languageFlagMeta(lang);
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        selected
          ? "border-white/25 bg-white/10 text-white"
          : "border-black/15 bg-white text-[#61625d]"
      } ${className}`}
      title={meta.label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={meta.src}
        alt={meta.label}
        className="h-2.5 w-[15px] object-cover"
      />
      {meta.code}
    </span>
  );
}

type HrefSuggestionItem = {
  kind: "category" | "post";
  slug: string;
  label: string;
  href: string;
};

type HomeResp = { desktop: string[]; mobile: string[] };

type DbSliderItem = {
  image_url: string;
  href?: string | null;
  active?: boolean;
  position?: number;
  lang?: string | null;
};

type DbSliderResp = { key: string; items: DbSliderItem[] };

type MediaListResp = {
  urls: string[];
  total?: number;
  limit?: number;
  offset?: number;
  nextOffset?: number | null;
  site?: string;
};

type MediaUsageItem = {
  url: string;
  posts: Array<{ slug: string; name?: string | null }>;
  sliders: Array<{ set_key: string; lang?: string | null }>;
};

export default function AdminSlidersList() {
  const { fetchWithSite, currentSite } = useAdminApi();
  const { isChanging } = useSiteContext();
  const activeSite = (currentSite || "santiagoadicto") as SiteId;
  const siteSlots = useMemo(
    () => getBannerSlotsForSite(activeSite),
    [activeSite],
  );
  const dbKeys = useMemo(() => siteSlots.map((slot) => slot.key), [siteSlots]);

  const [dbKey, setDbKey] = useState<string>(dbKeys[0] || "home-desktop");
  const [dbSite, setDbSite] = useState<string>(activeSite);
  const [slotKindFilter, setSlotKindFilter] = useState<"all" | BannerSlotKind>(
    "all",
  );
  const [newKeyKind, setNewKeyKind] = useState<BannerSlotKind>("slider");
  const [newKeyInput, setNewKeyInput] = useState<string>("");
  const [dbView, setDbView] = useState<"list" | "edit">("list");
  const [dbItems, setDbItems] = useState<DbSliderItem[]>([]);
  const [selectedDbIndex, setSelectedDbIndex] = useState(0);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbSaving, setDbSaving] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaLoadingMore, setMediaLoadingMore] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaTotal, setMediaTotal] = useState<number | null>(null);
  const [mediaNextOffset, setMediaNextOffset] = useState<number | null>(0);
  const [mediaQuery, setMediaQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerForIndex, setPickerForIndex] = useState<number | null>(null);
  const [selectedMediaUrls, setSelectedMediaUrls] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteUsage, setDeleteUsage] = useState<MediaUsageItem[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteChecking, setDeleteChecking] = useState(false);
  const mediaFileRef = useRef<HTMLInputElement | null>(null);
  const mediaScrollRef = useRef<HTMLDivElement | null>(null);
  const mediaReqIdRef = useRef(0);
  const mediaLoadingRef = useRef(false);
  const mediaLoadingMoreRef = useRef(false);
  const mediaNextOffsetRef = useRef<number | null>(0);
  const [categories, setCategories] = useState<CategorySuggestion[]>([]);

  const hrefSuggestAbortRef = useRef<AbortController | null>(null);
  const hrefSuggestBlurTimerRef = useRef<number | null>(null);
  const [hrefSuggest, setHrefSuggest] = useState<{
    index: number | null;
    query: string;
    loading: boolean;
    items: HrefSuggestionItem[];
  }>({ index: null, query: "", loading: false, items: [] });

  const [home, setHome] = useState<HomeResp | null>(null);
  const [restDesktopES, setRestDesktopES] = useState<string[]>([]);
  const [restDesktopEN, setRestDesktopEN] = useState<string[]>([]);
  const [restMobile, setRestMobile] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantsPosts, setRestaurantsPosts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [destinations, setDestinations] = useState<
    Record<string, Record<string, string>>
  >({});
  const [dbSetsList, setDbSetsList] = useState<
    { key: string; count: number; sample?: string | null }[]
  >([]);
  const [dbSetsLoading, setDbSetsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setLoading(true);
      try {
        // Home: usa API existente
        const rHome = await fetchWithSite("/api/slider-images", {
          cache: "no-store",
        });
        const jHome = rHome.ok
          ? ((await rHome.json()) as HomeResp)
          : { desktop: [], mobile: [] };
        if (!cancelled) setHome(jHome);

        // Restaurantes Desktop: manifest por idioma (si existe objeto {es,en})
        const rMan = await fetch("/imagenes-slider/manifest.json", {
          cache: "no-store",
        });
        if (rMan.ok) {
          const j = await rMan.json();
          if (Array.isArray(j)) {
            // formato array simple: lo mostramos como ES y EN iguales
            if (!cancelled) {
              setRestDesktopES(
                j.map((s: string) =>
                  s.startsWith("/") ? s : `/imagenes-slider/${s}`,
                ),
              );
              setRestDesktopEN(
                j.map((s: string) =>
                  s.startsWith("/") ? s : `/imagenes-slider/${s}`,
                ),
              );
            }
          } else if (j && typeof j === "object") {
            const es = Array.isArray(j.es) ? j.es : [];
            const en = Array.isArray(j.en) ? j.en : [];
            if (!cancelled) {
              setRestDesktopES(
                es.map((s: string) =>
                  s.startsWith("/") ? s : `/imagenes-slider/${s}`,
                ),
              );
              setRestDesktopEN(
                en.map((s: string) =>
                  s.startsWith("/") ? s : `/imagenes-slider/${s}`,
                ),
              );
            }
          }
        }

        // Restaurantes Mobile: carpeta pública listada por API (si existe)
        try {
          const rMob = await fetchWithSite("/api/restaurant-slider-mobile", {
            cache: "no-store",
          });
          if (rMob.ok) {
            const jm = await rMob.json();
            const imgs: string[] = Array.isArray(jm.images) ? jm.images : [];
            if (!cancelled) setRestMobile(imgs);
          } else {
            if (!cancelled) setRestMobile([]);
          }
        } catch {
          if (!cancelled) setRestMobile([]);
        }

        // Posts de restaurantes (para derivar href destino de cada imagen)
        try {
          const rPosts = await fetchWithSite(
            "/api/posts?categorySlug=restaurantes",
            {
              cache: "no-store",
            },
          );
          const rows = rPosts.ok ? await rPosts.json() : [];
          if (!cancelled && Array.isArray(rows)) setRestaurantsPosts(rows);
        } catch {
          if (!cancelled) setRestaurantsPosts([]);
        }

        // Destinos (overrides)
        try {
          const rDest = await fetchWithSite("/api/slider-destinations", {
            cache: "no-store",
          });
          const j = rDest.ok ? await rDest.json() : {};
          if (!cancelled) setDestinations(j || {});
        } catch {
          if (!cancelled) setDestinations({});
        }
      } catch {
        if (!cancelled) {
          setHome({ desktop: [], mobile: [] });
          setRestDesktopES([]);
          setRestDesktopEN([]);
          setRestMobile([]);
          setRestaurantsPosts([]);
          setDestinations({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const res = await fetchWithSite("/api/categories?full=1", {
          cache: "no-store",
        });
        const rows = res.ok ? await res.json() : [];
        const list: CategorySuggestion[] = (Array.isArray(rows) ? rows : [])
          .map((r: any) => ({
            slug: String(r?.slug || "").trim(),
            label_es: r?.label_es ?? null,
            label_en: r?.label_en ?? null,
          }))
          .filter((x: CategorySuggestion) => x.slug);
        if (!cancelled) setCategories(list);
      } catch {
        if (!cancelled) setCategories([]);
      }
    };
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [fetchWithSite, currentSite]);

  useEffect(() => {
    const idx = hrefSuggest.index;
    const raw = hrefSuggest.query;
    const q = String(raw || "").trim();

    if (idx == null) return;
    if (q.length < 1) {
      setHrefSuggest((s) => ({ ...s, loading: false, items: [] }));
      return;
    }

    const qn = q.toLowerCase();
    const prettyCategorySlugs = new Set<string>([
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

    const categoryMatches: HrefSuggestionItem[] = (categories || [])
      .filter((c) => {
        const slug = String(c.slug || "").toLowerCase();
        const les = String(c.label_es || "").toLowerCase();
        const len = String(c.label_en || "").toLowerCase();
        return slug.includes(qn) || les.includes(qn) || len.includes(qn);
      })
      .slice(0, 10)
      .map((c) => {
        const slug = String(c.slug || "").trim();
        const label =
          String(c.label_es || "").trim() ||
          String(c.label_en || "").trim() ||
          slug;
        const href = prettyCategorySlugs.has(slug)
          ? `/${slug}`
          : `/categoria/${slug}`;
        return { kind: "category", slug, label, href };
      });

    const controller = new AbortController();
    hrefSuggestAbortRef.current?.abort();
    hrefSuggestAbortRef.current = controller;

    const handle = window.setTimeout(async () => {
      try {
        // Mostramos categorías al tiro; luego completamos con posts del sitio actual
        setHrefSuggest((s) => ({
          ...s,
          loading: true,
          items: categoryMatches,
        }));
        const res = await fetchWithSite(
          `/api/posts/search?q=${encodeURIComponent(q)}&limit=30`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const json = res.ok ? await res.json() : null;
        const rows = Array.isArray(json?.items) ? json.items : [];
        const postMatches: HrefSuggestionItem[] = rows
          .map((r: any) => {
            const slug = String(r?.slug || "").trim();
            const label =
              (r?.es?.name ? String(r.es.name) : "") ||
              (r?.name_es ? String(r.name_es) : "") ||
              (r?.en?.name ? String(r.en.name) : "") ||
              (r?.name_en ? String(r.name_en) : "") ||
              slug;
            return {
              kind: "post",
              slug,
              label,
              href: `/${slug}`,
            } as HrefSuggestionItem;
          })
          .filter((x: HrefSuggestionItem) => x.slug)
          .slice(0, 10);

        const merged: HrefSuggestionItem[] = [];
        const seen = new Set<string>();
        for (const it of [...categoryMatches, ...postMatches]) {
          const k = `${it.kind}:${it.slug}`;
          if (seen.has(k)) continue;
          seen.add(k);
          merged.push(it);
          if (merged.length >= 10) break;
        }

        setHrefSuggest((s) => ({ ...s, loading: false, items: merged }));
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setHrefSuggest((s) => ({ ...s, loading: false, items: [] }));
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [hrefSuggest.index, hrefSuggest.query, categories, fetchWithSite, currentSite]);

  const MEDIA_PAGE_SIZE = 25;

  const fetchMediaPage = async (opts: {
    offset: number;
    append: boolean;
    refresh?: boolean;
  }) => {
    const { offset, append, refresh } = opts;
    const reqId = ++mediaReqIdRef.current;
    if (append) {
      mediaLoadingMoreRef.current = true;
      setMediaLoadingMore(true);
    } else {
      mediaLoadingRef.current = true;
      setMediaLoading(true);
    }

    try {
      const qs = new URLSearchParams();
      qs.set("limit", String(MEDIA_PAGE_SIZE));
      qs.set("offset", String(offset));
      const q = mediaQuery.trim();
      if (q) qs.set("q", q);
      if (refresh) qs.set("refresh", "1");
      const r = await fetchWithSite(`/api/media?${qs.toString()}`, {
        cache: "no-store",
      });
      const j = (r.ok ? await r.json() : null) as MediaListResp | null;
      if (reqId !== mediaReqIdRef.current) return;

      const urls = Array.isArray(j?.urls) ? j!.urls.map(String) : [];
      const clean = urls.map((u) => u.trim()).filter(Boolean);

      setMediaTotal(typeof j?.total === "number" ? j.total : null);
      const next = typeof j?.nextOffset === "number" ? j.nextOffset : null;
      mediaNextOffsetRef.current = next;
      setMediaNextOffset(next);

      if (append) {
        setMediaUrls((prev) => {
          const seen = new Set(prev);
          const next = [...prev];
          for (const u of clean) {
            if (!seen.has(u)) {
              seen.add(u);
              next.push(u);
            }
          }
          return next;
        });
      } else {
        setMediaUrls(clean);
      }
    } catch {
      if (!append) {
        setMediaUrls([]);
        setMediaTotal(null);
        mediaNextOffsetRef.current = null;
        setMediaNextOffset(null);
      }
    } finally {
      if (append) {
        mediaLoadingMoreRef.current = false;
        setMediaLoadingMore(false);
      } else {
        mediaLoadingRef.current = false;
        setMediaLoading(false);
      }
    }
  };

  const reloadMedia = async (opts?: { refresh?: boolean }) => {
    await fetchMediaPage({ offset: 0, append: false, refresh: opts?.refresh });
  };

  const loadMoreMedia = async () => {
    if (mediaLoadingRef.current || mediaLoadingMoreRef.current) return;
    const next = mediaNextOffsetRef.current;
    if (next == null) return;
    await fetchMediaPage({ offset: next, append: true });
  };

  const toggleMediaSelected = (url: string) => {
    setSelectedMediaUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );
  };

  const openDeleteConfirm = async () => {
    if (selectedMediaUrls.length === 0) return;
    setDeleteChecking(true);
    try {
      const res = await fetchWithSite(`/api/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "usage", urls: selectedMediaUrls }),
      });
      const data = await res.json().catch(() => null);
      const items = Array.isArray(data?.items) ? (data.items as MediaUsageItem[]) : [];
      setDeleteUsage(items);
      setDeleteConfirmOpen(true);
    } catch {
      setDeleteUsage(
        selectedMediaUrls.map((url) => ({ url, posts: [], sliders: [] })),
      );
      setDeleteConfirmOpen(true);
    } finally {
      setDeleteChecking(false);
    }
  };

  const confirmDeleteSelected = async () => {
    if (selectedMediaUrls.length === 0) return;
    setDeleteLoading(true);
    try {
      const res = await fetchWithSite(`/api/media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: selectedMediaUrls }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || data?.error || "No se pudo eliminar");
      }
      const deleted: string[] = Array.isArray(data?.deleted)
        ? data.deleted.map(String)
        : selectedMediaUrls;
      const deletedSet = new Set(deleted);
      setMediaUrls((prev) => prev.filter((u) => !deletedSet.has(u)));
      setMediaTotal((prev) =>
        typeof prev === "number"
          ? Math.max(0, prev - deleted.length)
          : prev,
      );
      setSelectedMediaUrls([]);
      setDeleteConfirmOpen(false);
      setDeleteUsage([]);
    } catch (e: any) {
      alert("No se pudo eliminar: " + String(e?.message || e));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cargar la primera página al abrir el picker (siempre fresca, más recientes primero)
  useEffect(() => {
    if (!pickerOpen) return;
    setSelectedMediaUrls([]);
    setMediaUrls([]);
    setMediaTotal(null);
    reloadMedia({ refresh: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen, currentSite]);

  // Nota: se quitó el scroll infinito para mejorar performance.
  // Ahora se usa botón "Cargar más".

  const uploadMediaFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files || []);
    if (arr.length === 0) return;
    setMediaUploading(true);
    try {
      const form = new FormData();
      for (const f of arr) form.append("files", f);
      const res = await fetchWithSite(`/api/media/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const urls: string[] = Array.isArray(data?.urls) ? data.urls : [];
      if (urls.length) {
        const uploaded = urls.map(String).filter(Boolean);
        const uploadedSet = new Set(uploaded);
        setMediaUrls((prev) => [
          ...uploaded,
          ...prev.filter((u) => !uploadedSet.has(u)),
        ]);
        setMediaTotal((prev) =>
          typeof prev === "number" ? prev + uploaded.length : prev,
        );
      }
    } catch (e: any) {
      alert("No se pudo subir: " + String(e?.message || e));
    } finally {
      setMediaUploading(false);
    }
  };

  const loadDbSet = async (key: string) => {
    setDbLoading(true);
    try {
      const res = await fetchWithSite(
        `/api/sliders/${encodeURIComponent(key)}?all=1&adminSite=${encodeURIComponent(
          dbSite,
        )}`,
        {
          cache: "no-store",
        },
      );
      const j = (res.ok ? await res.json() : null) as DbSliderResp | null;
      const items = Array.isArray(j?.items) ? j!.items : [];
      const normalized = items
        .map((it: any, idx: number) => ({
          image_url: String(it?.image_url || "").trim(),
          href: it?.href ? String(it.href) : "",
          active: typeof it?.active === "boolean" ? it.active : true,
          position: Number.isFinite(it?.position) ? Number(it.position) : idx,
          lang: it?.lang ? String(it.lang) : null,
        }))
        .filter((it) => it.image_url)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      setDbItems(normalized);
      setSelectedDbIndex(0);
    } catch {
      setDbItems([]);
      setSelectedDbIndex(0);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    loadDbSet(dbKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbKey, dbSite]);

  const loadDbSetsList = async () => {
    setDbSetsLoading(true);
    try {
      const res = await fetchWithSite(
        `/api/sliders?adminSite=${encodeURIComponent(dbSite)}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(await res.text());
      const j = await res.json();
      const sets = Array.isArray(j?.sets) ? j.sets : [];
      const existing = new Map(
        sets.map((s: any) => [
          String(s.key || ""),
          {
            key: String(s.key || ""),
            count: Number(s.count || 0),
            sample: s.sample || null,
          },
        ]),
      );
      const presets = getBannerSlotsForSite(dbSite as SiteId).map(
        (slot) =>
          existing.get(slot.key) || { key: slot.key, count: 0, sample: null },
      );
      const custom = sets
        .map((s: any) => existing.get(String(s.key || "")))
        .filter(
          (s: any) =>
            Boolean(s && !getBannerSlot(s.key)) &&
            slotBelongsToSite(String(s.key), dbSite as SiteId),
        );
      setDbSetsList([...presets, ...custom]);
    } catch {
      setDbSetsList([]);
    } finally {
      setDbSetsLoading(false);
    }
  };

  useEffect(() => {
    loadDbSetsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbSite]);

  // Usar el selector general de sitio del admin (no uno local distinto)
  useEffect(() => {
    if (!currentSite) return;
    setDbSite(currentSite);
    setSlotKindFilter("all");
    const firstKey = getBannerSlotsForSite(currentSite as SiteId)[0]?.key;
    if (firstKey) setDbKey(firstKey);
    if (dbView === "edit") {
      setDbView("list");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSite]);

  const filteredSlotGroups = useMemo(() => {
    const groups = buildSlotGroupsForSite(dbSite as SiteId);
    const byKey = new Map(dbSetsList.map((s) => [s.key, s]));

    return groups
      .filter((g) => {
        if (slotKindFilter !== "all" && g.kind !== slotKindFilter) return false;
        return true;
      })
      .map((g) => ({
        group: g,
        desktopMeta: g.desktop ? byKey.get(g.desktop.key) : null,
        mobileMeta: g.mobile ? byKey.get(g.mobile.key) : null,
        responsiveMeta: g.responsive ? byKey.get(g.responsive.key) : null,
      }));
  }, [dbSite, dbSetsList, slotKindFilter]);

  // Keys personalizadas del sitio (no están en el catálogo)
  const customSets = useMemo(() => {
    return dbSetsList.filter((s) => {
      if (getBannerSlot(s.key)) return false;
      if (!slotBelongsToSite(s.key, dbSite as SiteId)) return false;
      if (slotKindFilter !== "all" && inferBannerSlotKind(s.key) !== slotKindFilter) {
        return false;
      }
      return true;
    });
  }, [dbSetsList, dbSite, slotKindFilter]);

  const sliderCount = useMemo(
    () =>
      buildSlotGroupsForSite(dbSite as SiteId).filter((g) => g.kind === "slider")
        .length,
    [dbSite],
  );
  const bannerCount = useMemo(
    () =>
      buildSlotGroupsForSite(dbSite as SiteId).filter((g) => g.kind === "banner")
        .length,
    [dbSite],
  );

  const openGroupKey = (key: string) => {
    setDbKey(key);
    setDbView("edit");
    loadDbSet(key);
  };

  const updateDbItem = (idx: number, patch: Partial<DbSliderItem>) => {
    setDbItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );
  };

  const openPickerFor = (idx: number) => {
    setPickerForIndex(idx);
    setMediaQuery("");
    setMediaUrls([]);
    setMediaTotal(null);
    mediaNextOffsetRef.current = 0;
    setMediaNextOffset(0);
    setPickerOpen(true);
  };

  const getMediaName = (url: string) => {
    const clean = String(url || "")
      .split("#")[0]
      .split("?")[0];
    const last = clean.split("/").pop() || clean;
    try {
      return decodeURIComponent(last);
    } catch {
      return last;
    }
  };

  const pickerSelectedUrl = useMemo(() => {
    if (pickerForIndex == null) return "";
    return String(dbItems?.[pickerForIndex]?.image_url || "").trim();
  }, [pickerForIndex, dbItems]);

  const filteredMediaUrls = useMemo(() => {
    // La API ya devuelve resultados filtrados/paginados (q + limit/offset).
    // Solo nos preocupamos de pinnear la imagen seleccionada arriba.
    const base = mediaUrls;
    const selected = pickerSelectedUrl;
    if (!selected) return base;
    if (base.includes(selected))
      return [selected, ...base.filter((u) => u !== selected)];
    return [selected, ...base];
  }, [mediaUrls, pickerSelectedUrl]);

  // Si el usuario escribe en el buscador, pedimos la primera página filtrada al backend.
  useEffect(() => {
    if (!pickerOpen) return;
    const t = window.setTimeout(() => {
      reloadMedia();
    }, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen, mediaQuery]);

  const moveDbItem = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= dbItems.length) return;
    setDbItems((prev) => {
      const copy = prev.slice();
      const tmp = copy[idx];
      copy[idx] = copy[j];
      copy[j] = tmp;
      return copy;
    });
    setSelectedDbIndex((current) =>
      current === idx ? j : current === j ? idx : current,
    );
  };

  const removeDbItem = (idx: number) => {
    setDbItems((prev) => prev.filter((_, i) => i !== idx));
    setSelectedDbIndex((current) => {
      if (current > idx) return current - 1;
      if (current === idx) return Math.max(0, idx - 1);
      return current;
    });
  };

  const addDbItem = () => {
    const fallbackImage = mediaUrls[0] || "";
    setDbItems((prev) => [
      ...prev,
      { image_url: fallbackImage, href: "", active: true },
    ]);
    setSelectedDbIndex(dbItems.length);
  };

  const saveDbSet = async () => {
    setDbSaving(true);
    try {
      const inferredLang = dbKey.endsWith("-es")
        ? "es"
        : dbKey.endsWith("-en")
          ? "en"
          : null;
      const payload = {
        items: dbItems.map((it, idx) => ({
          image_url: String(it.image_url || "").trim(),
          href: it.href ? String(it.href).trim() : null,
          active: it.active !== false,
          position: idx,
          lang: inferredLang || it.lang || null,
        })),
      };
      const res = await fetchWithSite(
        `/api/sliders/${encodeURIComponent(dbKey)}?adminSite=${encodeURIComponent(
          dbSite,
        )}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      await loadDbSet(dbKey);
      alert("Slider guardado en la base de datos");
    } catch (e: any) {
      alert("No se pudo guardar: " + String(e?.message || e));
    } finally {
      setDbSaving(false);
    }
  };

  const RestMobileES = restMobile.filter((u) => /-1\./i.test(u));
  const RestMobileEN = restMobile.filter((u) => /-2\./i.test(u));

  // Href destino para Home: se deriva por nombre de archivo como en /api/slider-images
  const homeHrefFor = (filenameOrUrl: string) => {
    const norm = (s: string) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
    const name = norm(
      (filenameOrUrl.split("/").pop() || filenameOrUrl).replace(/\.[^.]+$/, ""),
    );
    const has = (k: string) => name.includes(k);
    let key: string | null = null;
    if (has("NINOS") || has("NIÑOS")) key = "NINOS";
    if (/^(ARQ|ARQU|AQU|AQI)/.test(name) || has("ARQUITECTURA"))
      key = "ARQUITECTURA";
    else if (has("BARRIOS")) key = "BARRIOS";
    else if (has("ICONOS")) key = "ICONOS";
    else if (has("MERCADOS")) key = "MERCADOS";
    else if (has("MIRADORES")) key = "MIRADORES";
    else if (has("CULTURA") || has("MUSEOS")) key = "CULTURA";
    else if (has("PALACIOS")) key = "PALACIOS";
    else if (has("PARQUES")) key = "PARQUES";
    else if (has("FUERA") || has("FUERA-DE-STGO") || has("OUTSIDE"))
      key = "FUERA-DE-STGO";
    else if (has("RESTAURANTES") || has("RESTAURANTS")) key = "RESTAURANTES";
    else key = "ICONOS";
    const map: Record<string, string> = {
      ICONOS: "/iconos",
      NINOS: "/ninos",
      ARQUITECTURA: "/arquitectura",
      BARRIOS: "/barrios",
      MERCADOS: "/mercados",
      MIRADORES: "/miradores",
      CULTURA: "/museos",
      PALACIOS: "/palacios",
      PARQUES: "/parques",
      "FUERA-DE-STGO": "/paseos-fuera-de-santiago",
      RESTAURANTES: "/restaurantes",
    };
    return map[key] || "/";
  };

  // Keys para overrides por conjunto
  const keyHomeDesktop = "home-desktop";
  const keyHomeMobile = "home-mobile";
  const keyRestDES = "restaurants-desktop-es";
  const keyRestDEN = "restaurants-desktop-en";
  const keyRestMES = "restaurants-mobile-es";
  const keyRestMEN = "restaurants-mobile-en";

  const baseName = (u: string) => (u.split("/").pop() || u).trim();

  // Índice para encontrar slug de restaurante por nombre/slug
  const restaurantsIndex = useMemo(() => {
    const normKey = (str: string) =>
      String(str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    return (restaurantsPosts || []).map((h) => {
      const slug = String(h.slug || "");
      const esName = String(h.es?.name || "");
      const enName = String(h.en?.name || "");
      return {
        slug,
        keys: [normKey(slug), normKey(esName), normKey(enName)].filter(Boolean),
      };
    });
  }, [restaurantsPosts]);

  function restaurantHrefFor(url: string) {
    const fname = url.split("/").pop() || url;
    const base = fname.replace(/\.[^.]+$/, "").replace(/-(1|2)$/i, "");
    const norm = (s: string) =>
      String(s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    const key = norm(base);
    let match: string | null = null;
    for (const row of restaurantsIndex) {
      if (
        row.keys.some((k: string) => k.startsWith(key) || key.startsWith(k))
      ) {
        match = row.slug;
        break;
      }
    }
    if (!match) {
      match = base
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    return `/${match}`;
  }

  const homeDesktopHrefs = (home?.desktop || []).map((u) => {
    const bn = baseName(u);
    return destinations?.[keyHomeDesktop]?.[bn] || homeHrefFor(u);
  });
  const homeMobileHrefs = (home?.mobile || []).map((u) => {
    const bn = baseName(u);
    return destinations?.[keyHomeMobile]?.[bn] || homeHrefFor(u);
  });
  const restDesktopESHrefs = restDesktopES.map((u) => {
    const bn = baseName(u);
    return destinations?.[keyRestDES]?.[bn] || restaurantHrefFor(u);
  });
  const restDesktopENHrefs = restDesktopEN.map((u) => {
    const bn = baseName(u);
    return destinations?.[keyRestDEN]?.[bn] || restaurantHrefFor(u);
  });
  const RestMobileESHrefs = RestMobileES.map((u) => {
    const bn = baseName(u);
    return destinations?.[keyRestMES]?.[bn] || restaurantHrefFor(u);
  });
  const RestMobileENHrefs = RestMobileEN.map((u) => {
    const bn = baseName(u);
    return destinations?.[keyRestMEN]?.[bn] || restaurantHrefFor(u);
  });

  // --- Reordenar en UI ---
  const moveIn = (arr: string[], index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= arr.length) return arr;
    const copy = arr.slice();
    const tmp = copy[index];
    copy[index] = copy[j];
    copy[j] = tmp;
    return copy;
  };

  const moveHomeDesktop = (i: number, d: -1 | 1) => {
    if (!home) return;
    setHome({ ...home, desktop: moveIn(home.desktop, i, d) });
  };
  const moveHomeMobile = (i: number, d: -1 | 1) => {
    if (!home) return;
    setHome({ ...home, mobile: moveIn(home.mobile, i, d) });
  };
  const moveRestDES = (i: number, d: -1 | 1) =>
    setRestDesktopES((p) => moveIn(p, i, d));
  const moveRestDEN = (i: number, d: -1 | 1) =>
    setRestDesktopEN((p) => moveIn(p, i, d));
  const moveRestMES = (i: number, d: -1 | 1) =>
    setRestMobile((p) => {
      // mover solo elementos ES (-1)
      const idxs = p.map((u, idx) => ({ idx, isES: /-1\./i.test(u) }));
      const esIdxs = idxs.filter((o) => o.isES).map((o) => o.idx);
      if (i < 0 || i >= esIdxs.length) return p;
      const a = p.slice();
      const from = esIdxs[i];
      const to = esIdxs[i] + d;
      if (to < 0 || to >= p.length) return p;
      const tmp = a[from];
      a[from] = a[to];
      a[to] = tmp;
      return a;
    });
  const moveRestMEN = (i: number, d: -1 | 1) =>
    setRestMobile((p) => {
      // mover solo elementos EN (-2)
      const idxs = p.map((u, idx) => ({ idx, isEN: /-2\./i.test(u) }));
      const enIdxs = idxs.filter((o) => o.isEN).map((o) => o.idx);
      if (i < 0 || i >= enIdxs.length) return p;
      const a = p.slice();
      const from = enIdxs[i];
      const to = enIdxs[i] + d;
      if (to < 0 || to >= p.length) return p;
      const tmp = a[from];
      a[from] = a[to];
      a[to] = tmp;
      return a;
    });

  const reorder = (arr: string[], from: number, to: number) => {
    const a = arr.slice();
    const [item] = a.splice(from, 1);
    a.splice(to, 0, item);
    return a;
  };

  const onReorderHomeDesktop = (from: number, to: number) => {
    if (!home) return;
    setHome({ ...home, desktop: reorder(home.desktop, from, to) });
  };
  const onReorderHomeMobile = (from: number, to: number) => {
    if (!home) return;
    setHome({ ...home, mobile: reorder(home.mobile, from, to) });
  };
  const onReorderRestDES = (from: number, to: number) =>
    setRestDesktopES((p) => reorder(p, from, to));
  const onReorderRestDEN = (from: number, to: number) =>
    setRestDesktopEN((p) => reorder(p, from, to));
  const onReorderRestMES = (from: number, to: number) =>
    setRestMobile((p) => {
      const idxs = p.map((u, idx) => ({ idx, isES: /-1\./i.test(u) }));
      const esIdxs = idxs.filter((o) => o.isES).map((o) => o.idx);
      if (from < 0 || from >= esIdxs.length || to < 0 || to >= esIdxs.length)
        return p;
      const a = p.slice();
      const realFrom = esIdxs[from];
      const realTo = esIdxs[to];
      const [item] = a.splice(realFrom, 1);
      a.splice(realTo, 0, item);
      return a;
    });
  const onReorderRestMEN = (from: number, to: number) =>
    setRestMobile((p) => {
      const idxs = p.map((u, idx) => ({ idx, isEN: /-2\./i.test(u) }));
      const enIdxs = idxs.filter((o) => o.isEN).map((o) => o.idx);
      if (from < 0 || from >= enIdxs.length || to < 0 || to >= enIdxs.length)
        return p;
      const a = p.slice();
      const realFrom = enIdxs[from];
      const realTo = enIdxs[to];
      const [item] = a.splice(realFrom, 1);
      a.splice(realTo, 0, item);
      return a;
    });

  // Editar destinos overrides
  const setDest = (key: string, basename: string, value: string) => {
    setDestinations((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [basename]: value,
      },
    }));
  };

  // Editar URL (solo aplica a Restaurantes Desktop que usan manifest)
  const setUrlAt = (set: "es" | "en", idx: number, value: string) => {
    if (set === "es")
      setRestDesktopES((p) => p.map((u, i) => (i === idx ? value : u)));
    else setRestDesktopEN((p) => p.map((u, i) => (i === idx ? value : u)));
  };

  // --- Guardar orden ---
  const saveOrders = async () => {
    setSaving(true);
    try {
      // Home: PUT /api/slider-images
      if (home) {
        await fetchWithSite("/api/slider-images", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ desktop: home.desktop, mobile: home.mobile }),
        });
      }
      // Rest Desktop: PUT /api/imagenes-slider/manifest
      await fetchWithSite("/api/imagenes-slider/manifest", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ es: restDesktopES, en: restDesktopEN }),
      });
      // Rest Mobile: PUT /api/restaurant-slider-mobile con orden por idioma
      const esOrder = restMobile
        .filter((u) => /-1\./i.test(u))
        .map((u) => u.split("/").pop());
      const enOrder = restMobile
        .filter((u) => /-2\./i.test(u))
        .map((u) => u.split("/").pop());
      if (esOrder.length)
        await fetchWithSite("/api/restaurant-slider-mobile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang: "es", order: esOrder }),
        });
      if (enOrder.length)
        await fetchWithSite("/api/restaurant-slider-mobile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang: "en", order: enOrder }),
        });

      // Destinos overrides
      await fetchWithSite("/api/slider-destinations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(destinations || {}),
      });

      // --- Sincronizar con Base de Datos (opcional y no bloqueante si no hay envs) ---
      try {
        const setsPayload = [
          {
            key: keyHomeDesktop,
            items: (home?.desktop || []).map((u, idx) => ({
              image_url: u,
              href: homeDesktopHrefs[idx] || null,
              position: idx,
            })),
          },
          {
            key: keyHomeMobile,
            items: (home?.mobile || []).map((u, idx) => ({
              image_url: u,
              href: homeMobileHrefs[idx] || null,
              position: idx,
            })),
          },
          {
            key: keyRestDES,
            items: restDesktopES.map((u, idx) => ({
              image_url: u,
              href: restDesktopESHrefs[idx] || null,
              position: idx,
              lang: "es",
            })),
          },
          {
            key: keyRestDEN,
            items: restDesktopEN.map((u, idx) => ({
              image_url: u,
              href: restDesktopENHrefs[idx] || null,
              position: idx,
              lang: "en",
            })),
          },
          {
            key: keyRestMES,
            items: RestMobileES.map((u, idx) => ({
              image_url: u,
              href: RestMobileESHrefs[idx] || null,
              position: idx,
              lang: "es",
            })),
          },
          {
            key: keyRestMEN,
            items: RestMobileEN.map((u, idx) => ({
              image_url: u,
              href: RestMobileENHrefs[idx] || null,
              position: idx,
              lang: "en",
            })),
          },
        ];
        await fetchWithSite("/api/sliders/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sets: setsPayload }),
        });
      } catch (e) {
        console.warn("[Admin Sliders] Sync DB saltado:", e);
      }
      alert("Orden guardado");
    } catch (e: any) {
      alert(`Error al guardar: ${String(e?.message || e)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="border-b border-black/10 pb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-red)]">
          Recursos editoriales
        </p>
        <h1 className="font-neutra-demi text-3xl uppercase tracking-wide text-[#20211f]">
          Sliders y Banners
        </h1>
        <p className="mt-2 text-[#61625d]">
          Administra carruseles y banners del sitio seleccionado arriba (
          <span className="font-mono text-sm text-[#20211f]">{currentSite}</span>
          ).
        </p>
      </div>

      <Card className="space-y-4 rounded-none border-black/10 bg-white p-5 shadow-none">
        {dbView === "list" ? (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <div className="font-neutra-demi text-sm uppercase tracking-wide text-[#20211f]">
                  Biblioteca visual
                </div>
                <div className="text-xs text-[#85867f]">
                  Sitio activo:{" "}
                  <span className="font-mono text-[#20211f]">{dbSite}</span>.
                  Cambia el sitio con el selector general del admin.
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#61625d]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    En uso en el front
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    En BD, no referenciado en el front
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      {
                        id: "all",
                        label: `Todos (${buildSlotGroupsForSite(dbSite as SiteId).length})`,
                      },
                      { id: "slider", label: `Sliders (${sliderCount})` },
                      { id: "banner", label: `Banners (${bannerCount})` },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSlotKindFilter(tab.id)}
                      className={`h-9 px-3 text-sm border transition-colors ${
                        slotKindFilter === tab.id
                          ? "border-[#20211f] bg-[#20211f] text-white"
                          : "border-black/10 bg-white text-[#20211f] hover:bg-[#f7f7f4]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-end gap-2 pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="newSlotKind">Tipo</Label>
                    <select
                      id="newSlotKind"
                      className="h-9 rounded-none border border-black/10 bg-[#fafaf8] px-2 text-sm"
                      value={newKeyKind}
                      onChange={(e) =>
                        setNewKeyKind(e.target.value as BannerSlotKind)
                      }
                    >
                      <option value="slider">Slider</option>
                      <option value="banner">Banner</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="newSlotKey">Nueva key</Label>
                    <Input
                      id="newSlotKey"
                      value={newKeyInput}
                      onChange={(e) => setNewKeyInput(e.target.value)}
                      placeholder={
                        newKeyKind === "banner"
                          ? "ej. home-promo-verano"
                          : "ej. home-desktop-v2"
                      }
                      className="h-9 md:w-[260px]"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-none border-black/10"
                    onClick={() => {
                      const v = String(newKeyInput || "").trim();
                      if (!v) return alert("Ingresa un key válido");
                      setDbKey(v);
                      setDbView("edit");
                      setNewKeyInput("");
                      loadDbSet(v);
                    }}
                  >
                    <Plus size={15} />
                    Crear / Editar
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-none border-black/10"
                  onClick={loadDbSetsList}
                  disabled={dbSetsLoading}
                >
                  <RefreshCw
                    className={dbSetsLoading ? "animate-spin" : ""}
                    size={15}
                  />
                  {dbSetsLoading ? "Cargando…" : "Refrescar lista"}
                </Button>
              </div>
            </div>

            {dbSetsLoading ? (
              <div className="text-sm text-muted-foreground">Cargando…</div>
            ) : filteredSlotGroups.length === 0 && customSets.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No hay{" "}
                {slotKindFilter === "banner"
                  ? "banners"
                  : slotKindFilter === "slider"
                    ? "sliders"
                    : "items"}{" "}
                para <span className="font-mono">{dbSite}</span>.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {filteredSlotGroups.map(
                    ({ group, desktopMeta, mobileMeta, responsiveMeta }) => {
                      const sample =
                        desktopMeta?.sample ||
                        mobileMeta?.sample ||
                        responsiveMeta?.sample ||
                        null;
                      return (
                        <div
                          key={group.id}
                          className="border border-black/10 bg-white p-3"
                        >
                          <div className="mb-3 flex items-start gap-3">
                            <div className="h-14 w-20 shrink-0 overflow-hidden bg-[#f3f3f1]">
                              {sample ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={sample}
                                  alt={group.label}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">
                                  Sin imagen
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex flex-wrap gap-1.5">
                                <span
                                  className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                    group.kind === "slider"
                                      ? "bg-[#20211f] text-white"
                                      : "bg-[var(--color-brand-red)] text-white"
                                  }`}
                                >
                                  {group.kind === "slider" ? "Slider" : "Banner"}
                                </span>
                                <LanguageFlagBadge lang={group.language} />
                              </div>
                              <div className="font-neutra-demi text-sm uppercase tracking-wide text-[#20211f]">
                                {group.label}
                              </div>
                              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700">
                                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                                <span>
                                  En uso · {group.location}
                                  {group.language
                                    ? ` · ${languageFlagMeta(group.language)?.label || group.language.toUpperCase()}`
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </div>

                          {group.responsive ? (
                            <button
                              type="button"
                              onClick={() => openGroupKey(group.responsive!.key)}
                              className="flex w-full items-center justify-between border border-black/10 bg-[#fafaf8] px-3 py-2 text-left text-sm hover:bg-[#f3f3f1]"
                              title={`Escritorio + Móvil · ${group.responsive.key}`}
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[#20211f]">
                                  <Monitor className="size-4 shrink-0" />
                                  <Smartphone className="size-4 shrink-0" />
                                </span>
                                <span className="truncate font-mono text-[11px] text-[#85867f]">
                                  {group.responsive.key}
                                </span>
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {responsiveMeta?.count || 0}
                              </span>
                            </button>
                          ) : (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <button
                                type="button"
                                disabled={!group.desktop}
                                onClick={() =>
                                  group.desktop &&
                                  openGroupKey(group.desktop.key)
                                }
                                className="flex items-center justify-between border border-black/10 bg-[#fafaf8] px-3 py-2 text-left text-sm hover:bg-[#f3f3f1] disabled:cursor-not-allowed disabled:opacity-40"
                                title={
                                  group.desktop
                                    ? `Escritorio · ${group.desktop.key}`
                                    : "Sin versión escritorio"
                                }
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <Monitor className="size-4 shrink-0 text-[#20211f]" />
                                  {group.desktop ? (
                                    <span className="truncate font-mono text-[10px] text-[#85867f]">
                                      {group.desktop.key}
                                    </span>
                                  ) : null}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {desktopMeta?.count || 0}
                                </span>
                              </button>
                              <button
                                type="button"
                                disabled={!group.mobile}
                                onClick={() =>
                                  group.mobile && openGroupKey(group.mobile.key)
                                }
                                className="flex items-center justify-between border border-black/10 bg-[#fafaf8] px-3 py-2 text-left text-sm hover:bg-[#f3f3f1] disabled:cursor-not-allowed disabled:opacity-40"
                                title={
                                  group.mobile
                                    ? `Móvil · ${group.mobile.key}`
                                    : "Sin versión móvil"
                                }
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <Smartphone className="size-4 shrink-0 text-[#20211f]" />
                                  {group.mobile ? (
                                    <span className="truncate font-mono text-[10px] text-[#85867f]">
                                      {group.mobile.key}
                                    </span>
                                  ) : null}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {mobileMeta?.count || 0}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>

                {customSets.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Sin uso en el front ({customSets.length})
                    </div>
                    <p className="text-[11px] text-[#85867f]">
                      Están en la base de datos de este sitio, pero no aparecen
                      referenciados en el código del front. Revisa si son basura.
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {customSets.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => openGroupKey(s.key)}
                          className="border border-dashed border-amber-300 bg-amber-50/40 p-3 text-left hover:bg-amber-50"
                        >
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            <span className="text-[10px] font-semibold uppercase text-amber-800">
                              No usado
                            </span>
                          </div>
                          <div className="truncate font-mono text-xs text-[#20211f]">
                            {s.key}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            {s.count} items
                            {inferBannerSlotDevice(s.key) === "mobile" ? (
                              <Smartphone className="size-3.5" />
                            ) : inferBannerSlotDevice(s.key) === "desktop" ? (
                              <Monitor className="size-3.5" />
                            ) : (
                              <span className="inline-flex items-center gap-0.5">
                                <Monitor className="size-3.5" />
                                <Smartphone className="size-3.5" />
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                <div className="font-neutra-demi text-sm uppercase tracking-wide text-[#20211f]">
                  Editar{" "}
                  {inferBannerSlotKind(dbKey) === "banner" ? "banner" : "slider"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Sitio: <span className="font-mono">{dbSite}</span> · Tipo:{" "}
                  <span className="font-mono">
                    {inferBannerSlotKind(dbKey)}
                  </span>{" "}
                  · Key: <span className="font-mono">{dbKey}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-none border-black/10"
                  onClick={() => {
                    setDbView("list");
                    loadDbSetsList();
                  }}
                  disabled={dbSaving}
                >
                  <ArrowLeft size={15} />
                  Volver
                </Button>
                <Button
                  variant="outline"
                  className="rounded-none border-black/10"
                  onClick={() => loadDbSet(dbKey)}
                  disabled={dbLoading || dbSaving}
                >
                  <RefreshCw size={15} />
                  Recargar
                </Button>
                <Button
                  variant="outline"
                  className="rounded-none border-black/10"
                  onClick={addDbItem}
                  disabled={dbLoading || dbSaving}
                >
                  <Plus size={15} />
                  Agregar slide
                </Button>
                <Button
                  className="rounded-none bg-[var(--color-brand-red)] hover:bg-[#b72d24]"
                  onClick={saveDbSet}
                  disabled={dbSaving || dbLoading}
                >
                  <Save size={15} />
                  {dbSaving ? "Guardando…" : "Guardar"}
                </Button>
              </div>
            </div>

            {(dbLoading || mediaLoading) && (
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Spinner className="size-4" /> Cargando{" "}
                {dbLoading ? "slider" : "imágenes"}…
              </div>
            )}

            {dbItems.length === 0 ? (
              <div className="text-sm text-[#85867f]">
                No hay slides en la BD para este key.
              </div>
            ) : (
              <div className="grid gap-5 border-t border-black/10 pt-5 lg:grid-cols-[minmax(240px,0.72fr)_minmax(0,1.45fr)]">
                <section className="min-w-0 border border-black/10 bg-[#fafaf8]">
                  <div className="border-b border-black/10 px-3 py-2.5">
                    <h2 className="font-neutra-demi text-sm uppercase tracking-wide text-[#20211f]">
                      Secuencia
                    </h2>
                    <p className="mt-0.5 text-xs text-[#61625d]">
                      {dbItems.length} slides en este slider
                    </p>
                  </div>
                  <div className="max-h-[62vh] overflow-y-auto">
                    {dbItems.map((item, idx) => {
                      const selected = selectedDbIndex === idx;
                      const slideLang =
                        item.lang ||
                        (dbKey.endsWith("-es")
                          ? "es"
                          : dbKey.endsWith("-en")
                            ? "en"
                            : null);
                      return (
                        <button
                          key={`${dbKey}-${idx}`}
                          type="button"
                          onClick={() => setSelectedDbIndex(idx)}
                          className={`flex w-full gap-3 border-b border-black/10 p-3 text-left transition-colors last:border-b-0 ${selected ? "bg-[#22231f] text-white" : "bg-white text-[#20211f] hover:bg-[#f3f3f1]"}`}
                        >
                          <div className="aspect-[16/9] w-20 shrink-0 overflow-hidden bg-[#e8e8e4]">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : null}
                          </div>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="flex min-w-0 items-center gap-1.5">
                                <span className="font-neutra-demi text-sm uppercase tracking-wide">
                                  Slide {idx + 1}
                                </span>
                                <LanguageFlagBadge
                                  lang={slideLang}
                                  selected={selected}
                                />
                              </span>
                              <span
                                className={`size-2 shrink-0 ${item.active !== false ? "bg-[#268477]" : "bg-[#9a9b94]"}`}
                              />
                            </span>
                            <span
                              className={`mt-1 block truncate text-xs ${selected ? "text-white/65" : "text-[#61625d]"}`}
                            >
                              {item.href || "Sin destino"}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {dbItems[selectedDbIndex] &&
                  (() => {
                    const item = dbItems[selectedDbIndex];
                    const idx = selectedDbIndex;
                    return (
                      <section className="min-w-0 border border-black/10 bg-white p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/10 pb-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-red)]">
                              Configuración del slide
                            </p>
                            <h2 className="mt-1 flex items-center gap-2 font-neutra-demi text-xl uppercase tracking-wide text-[#20211f]">
                              Slide {idx + 1}
                              <LanguageFlagBadge
                                lang={
                                  item.lang ||
                                  (dbKey.endsWith("-es")
                                    ? "es"
                                    : dbKey.endsWith("-en")
                                      ? "en"
                                      : null)
                                }
                              />
                            </h2>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-none border-black/10"
                              title="Subir slide"
                              aria-label="Subir slide"
                              onClick={() => moveDbItem(idx, -1)}
                              disabled={idx === 0 || dbSaving}
                            >
                              <ArrowUp size={15} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-none border-black/10"
                              title="Bajar slide"
                              aria-label="Bajar slide"
                              onClick={() => moveDbItem(idx, 1)}
                              disabled={idx === dbItems.length - 1 || dbSaving}
                            >
                              <ArrowDown size={15} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              title="Quitar slide"
                              aria-label="Quitar slide"
                              onClick={() => removeDbItem(idx)}
                              disabled={dbSaving}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]">
                          <div className="space-y-3">
                            <div className="flex min-h-[180px] items-center justify-center overflow-hidden border border-black/10 bg-[#f3f3f1] p-2">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={`Vista previa del slide ${idx + 1}`}
                                  className="max-h-[420px] w-full object-contain"
                                />
                              ) : (
                                <div className="grid size-full place-items-center text-xs text-[#85867f]">
                                  Sin imagen
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-none border-black/10"
                                onClick={() => openPickerFor(idx)}
                                disabled={dbSaving || mediaLoading}
                              >
                                Elegir imagen
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-none border-black/10"
                                onClick={() => reloadMedia({ refresh: true })}
                                disabled={dbSaving || mediaLoading}
                              >
                                <RefreshCw
                                  className={mediaLoading ? "animate-spin" : ""}
                                  size={14}
                                />
                              </Button>
                            </div>
                          </div>
                          <div className="grid content-start gap-4 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                              <Label>Imagen (URL)</Label>
                              <Input
                                value={item.image_url}
                                onChange={(e) =>
                                  updateDbItem(idx, {
                                    image_url: e.target.value,
                                  })
                                }
                                placeholder="https://..."
                              />
                              <p className="text-xs text-[#61625d]">
                                Pega una URL o selecciona un archivo desde la
                                biblioteca visual.
                              </p>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label>Destino</Label>
                              <div className="relative">
                                <Input
                                  value={item.href || ""}
                                  onFocus={() => {
                                    if (hrefSuggestBlurTimerRef.current != null)
                                      window.clearTimeout(
                                        hrefSuggestBlurTimerRef.current,
                                      );
                                    setHrefSuggest((state) => ({
                                      ...state,
                                      index: idx,
                                      query: String(item.href || "").replace(
                                        /^\//,
                                        "",
                                      ),
                                    }));
                                  }}
                                  onBlur={() => {
                                    hrefSuggestBlurTimerRef.current =
                                      window.setTimeout(
                                        () =>
                                          setHrefSuggest((state) =>
                                            state.index === idx
                                              ? {
                                                  ...state,
                                                  index: null,
                                                  items: [],
                                                  loading: false,
                                                }
                                              : state,
                                          ),
                                        150,
                                      );
                                  }}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    updateDbItem(idx, { href: value });
                                    setHrefSuggest((state) => ({
                                      ...state,
                                      index: idx,
                                      query: String(value || "").replace(
                                        /^\//,
                                        "",
                                      ),
                                    }));
                                  }}
                                  placeholder="/categoria o /mi-post"
                                />
                                {hrefSuggest.index === idx &&
                                (hrefSuggest.loading ||
                                  hrefSuggest.items.length > 0) ? (
                                  <div className="absolute z-50 mt-1 w-full border border-black/10 bg-white">
                                    <div className="max-h-56 overflow-auto">
                                      {hrefSuggest.loading ? (
                                        <div className="px-3 py-2 text-xs text-muted-foreground">
                                          Buscando…
                                        </div>
                                      ) : null}
                                      {hrefSuggest.items.map((suggestion) => (
                                        <button
                                          key={`${suggestion.kind}:${suggestion.slug}`}
                                          type="button"
                                          className="w-full border-b border-black/10 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-[#f7f7f4]"
                                          onMouseDown={(event) =>
                                            event.preventDefault()
                                          }
                                          onClick={() => {
                                            updateDbItem(idx, {
                                              href: suggestion.href,
                                            });
                                            setHrefSuggest((state) => ({
                                              ...state,
                                              index: null,
                                              items: [],
                                              loading: false,
                                            }));
                                          }}
                                          title={suggestion.href}
                                        >
                                          <span className="flex items-center justify-between gap-2">
                                            <span className="truncate font-medium">
                                              {suggestion.label}
                                            </span>
                                            <span className="shrink-0 text-[11px] text-muted-foreground">
                                              {suggestion.kind === "category"
                                                ? "Categoría"
                                                : "Post"}
                                            </span>
                                          </span>
                                          <span className="block truncate text-[11px] text-muted-foreground">
                                            {suggestion.href}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Idioma</Label>
                              <div className="flex items-center gap-2">
                                <select
                                  className="h-9 w-full rounded-none border border-black/10 bg-[#fafaf8] px-2 text-sm"
                                  value={item.lang ?? ""}
                                  onChange={(e) =>
                                    updateDbItem(idx, {
                                      lang: e.target.value || null,
                                    })
                                  }
                                >
                                  <option value="">Sin idioma específico</option>
                                  <option value="es">Español</option>
                                  <option value="en">Inglés</option>
                                </select>
                                <LanguageFlagBadge lang={item.lang} />
                              </div>
                            </div>
                            <div className="border border-black/10 bg-[#fafaf8] px-3 py-2.5">
                              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium">
                                Publicar slide
                                <input
                                  type="checkbox"
                                  className="size-4 accent-[var(--color-brand-red)]"
                                  checked={item.active !== false}
                                  onChange={(e) =>
                                    updateDbItem(idx, {
                                      active: e.target.checked,
                                    })
                                  }
                                />
                              </label>
                              <p className="mt-1 text-xs text-[#61625d]">
                                Los slides inactivos permanecen guardados, pero
                                no se muestran.
                              </p>
                            </div>
                          </div>
                        </div>
                      </section>
                    );
                  })()}
              </div>
            )}

            <Dialog
              open={pickerOpen}
              onOpenChange={(open) => {
                setPickerOpen(open);
                if (!open) {
                  setPickerForIndex(null);
                  setSelectedMediaUrls([]);
                  setDeleteConfirmOpen(false);
                  setDeleteUsage([]);
                }
              }}
            >
              <DialogContent className="sm:max-w-6xl max-h-[85vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>
                    Seleccionar imagen
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({currentSite})
                    </span>
                  </DialogTitle>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={mediaFileRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;
                      uploadMediaFiles(files).finally(() => {
                        if (mediaFileRef.current)
                          mediaFileRef.current.value = "";
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => mediaFileRef.current?.click()}
                    disabled={mediaUploading || dbSaving}
                  >
                    {mediaUploading ? "Subiendo…" : "Subir imágenes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reloadMedia({ refresh: true })}
                    disabled={mediaLoading || mediaUploading}
                  >
                    {mediaLoading ? "Cargando…" : "Recargar lista"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => openDeleteConfirm()}
                    disabled={
                      selectedMediaUrls.length === 0 ||
                      deleteChecking ||
                      deleteLoading ||
                      mediaUploading
                    }
                  >
                    <Trash2 className="size-4" />
                    {deleteChecking
                      ? "Revisando…"
                      : `Eliminar${selectedMediaUrls.length ? ` (${selectedMediaUrls.length})` : ""}`}
                  </Button>

                  <Input
                    value={mediaQuery}
                    onChange={(e) => setMediaQuery(e.target.value)}
                    placeholder="Buscar por nombre de imagen…"
                    className="h-9 w-full sm:w-[320px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMediaQuery("")}
                    disabled={!mediaQuery.trim()}
                  >
                    Limpiar
                  </Button>
                  {selectedMediaUrls.length > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSelectedMediaUrls([])}
                    >
                      Quitar selección
                    </Button>
                  ) : null}
                  <div className="text-xs text-muted-foreground">
                    Mostrando {filteredMediaUrls.length}
                    {typeof mediaTotal === "number" ? ` de ${mediaTotal}` : ""}
                    {mediaLoadingMore ? " · Cargando más…" : ""}
                  </div>
                </div>

                {mediaUrls.length === 0 && mediaLoading ? (
                  <div className="text-sm text-muted-foreground">Cargando…</div>
                ) : mediaUrls.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No hay imágenes disponibles para este sitio.
                  </div>
                ) : (
                  <div
                    ref={mediaScrollRef}
                    className="max-h-[65vh] overflow-auto pr-1"
                  >
                    {filteredMediaUrls.length === 0 ? (
                      <div className="py-6 text-sm text-muted-foreground">
                        No hay resultados
                        {mediaQuery.trim()
                          ? ` para "${mediaQuery.trim()}"`
                          : ""}
                        .
                      </div>
                    ) : null}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {filteredMediaUrls.map((u) => {
                        const checked = selectedMediaUrls.includes(u);
                        return (
                          <div
                            key={u}
                            className={`relative overflow-hidden border border-black/10 text-left ${
                              u === pickerSelectedUrl
                                ? "ring-2 ring-[var(--color-brand-red)]"
                                : ""
                            } ${checked ? "ring-2 ring-black/40" : ""}`}
                          >
                            <label
                              className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 cursor-pointer items-center justify-center bg-white/90 border border-black/20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleMediaSelected(u)}
                                className="h-3.5 w-3.5 accent-[var(--color-brand-red)]"
                                aria-label={`Seleccionar ${getMediaName(u)}`}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                if (pickerForIndex == null) return;
                                updateDbItem(pickerForIndex, { image_url: u });
                                setPickerOpen(false);
                                setPickerForIndex(null);
                              }}
                              title={u}
                              className="w-full text-left hover:bg-[#f7f7f4]"
                            >
                              <div className="w-full aspect-[4/3] overflow-hidden bg-[#f3f3f1]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={u}
                                  alt="media"
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="px-2 py-1 text-[10px] text-muted-foreground truncate">
                                {getMediaName(u)}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="py-3 flex items-center justify-center">
                      {mediaNextOffset == null ? (
                        <div className="text-xs text-muted-foreground">
                          Fin de la lista.
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => loadMoreMedia()}
                          disabled={mediaLoading || mediaLoadingMore}
                        >
                          {mediaLoadingMore ? "Cargando…" : "Cargar más"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <AlertDialog
              open={deleteConfirmOpen}
              onOpenChange={(open) => {
                if (deleteLoading) return;
                setDeleteConfirmOpen(open);
                if (!open) setDeleteUsage([]);
              }}
            >
              <AlertDialogContent className="sm:max-w-lg max-h-[85vh] overflow-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    ¿Eliminar {selectedMediaUrls.length} imagen
                    {selectedMediaUrls.length === 1 ? "" : "es"}?
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        Esta acción borrará las imágenes del sitio{" "}
                        <strong>{currentSite}</strong> (storage y referencias
                        locales). No se puede deshacer.
                      </p>
                      {(() => {
                        const linked = deleteUsage.filter(
                          (item) =>
                            item.posts.length > 0 || item.sliders.length > 0,
                        );
                        if (linked.length === 0) {
                          return (
                            <p>
                              No hay posts ni sliders asociados a estas
                              imágenes en este sitio.
                            </p>
                          );
                        }
                        return (
                          <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-950">
                            <p className="font-medium">
                              Advertencia: hay imágenes asociadas a contenido.
                            </p>
                            <ul className="max-h-48 space-y-2 overflow-auto text-xs">
                              {linked.map((item) => (
                                <li key={item.url}>
                                  <div className="font-medium truncate">
                                    {getMediaName(item.url)}
                                  </div>
                                  {item.posts.length > 0 ? (
                                    <div>
                                      Posts:{" "}
                                      {item.posts
                                        .map((p) => p.name || p.slug)
                                        .join(", ")}
                                    </div>
                                  ) : null}
                                  {item.sliders.length > 0 ? (
                                    <div>
                                      Sliders:{" "}
                                      {item.sliders
                                        .map((s) => s.set_key)
                                        .join(", ")}
                                    </div>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                            <p>
                              Si continúas, también se quitarán esas
                              referencias.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteLoading}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleteLoading}
                    className="bg-red-600 hover:bg-red-700"
                    onClick={(e) => {
                      e.preventDefault();
                      confirmDeleteSelected();
                    }}
                  >
                    {deleteLoading ? "Eliminando…" : "Sí, eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </Card>
    </div>
  );
}

function ImagesGrid({
  urls,
  hrefs,
  emptyText,
  onMove,
  onReorder,
  onChangeUrl,
  onChangeHref,
}: {
  urls: string[];
  hrefs?: string[];
  emptyText?: string;
  onMove?: (index: number, dir: -1 | 1) => void;
  onReorder?: (from: number, to: number) => void;
  onChangeUrl?: (index: number, value: string) => void;
  onChangeHref?: (index: number, value: string) => void;
}) {
  if (!urls || urls.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        {emptyText || "Sin imágenes"}
      </div>
    );
  }
  return (
    <div className="relative">
      <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
        <CarouselContent>
          {urls.map((u, i) => (
            <CarouselItem
              key={i}
              className="basis-1/2 sm:basis-1/3 lg:basis-1/4"
            >
              <div className="group overflow-hidden border border-black/10 bg-white">
                <div className="relative h-24 w-full overflow-hidden bg-[#f3f3f1]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u}
                    alt={`img-${i}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  {onMove ? (
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        className="border border-black/10 bg-white/90 p-1 hover:bg-white"
                        onClick={() => onMove(i, -1)}
                        title="Subir"
                        type="button"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        className="border border-black/10 bg-white/90 p-1 hover:bg-white"
                        onClick={() => onMove(i, +1)}
                        title="Bajar"
                        type="button"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="px-2 py-1 bg-black/40 text-white text-[10px] space-y-0.5">
                  <div className="truncate">{u}</div>
                  {hrefs?.[i] ? (
                    <div className="truncate text-emerald-200">
                      Destino: {hrefs[i]}
                    </div>
                  ) : null}
                </div>

                {onChangeUrl || onChangeHref ? (
                  <div className="px-2 py-2 text-[11px] space-y-1 bg-white">
                    {onChangeUrl ? (
                      <div className="flex gap-1 items-center">
                        <span className="min-w-[60px] text-gray-500">
                          Imagen:
                        </span>
                        <input
                          className="flex-1 border border-black/10 px-2 py-1"
                          value={u}
                          onChange={(e) => onChangeUrl(i, e.target.value)}
                        />
                      </div>
                    ) : null}
                    {onChangeHref ? (
                      <div className="flex gap-1 items-center">
                        <span className="min-w-[60px] text-gray-500">
                          Destino:
                        </span>
                        <input
                          className="flex-1 border rounded px-2 py-1"
                          value={hrefs?.[i] || ""}
                          onChange={(e) => onChangeHref(i, e.target.value)}
                          placeholder="p. ej. /iconos o /mi-post"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="!left-2" />
        <CarouselNext className="!right-2" />
      </Carousel>
    </div>
  );
}
