"use client";

import {
  ArrowUpRight,
  CalendarDays,
  FilePlus2,
  FileText,
  FolderTree,
  Image,
  Layers3,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useAdminApi } from "@/hooks/use-admin-api";
import { useSiteContext } from "@/contexts/site-context";

export default function AdminDashboard() {
  const { fetchWithSite, currentSite } = useAdminApi();
  const { isChanging } = useSiteContext();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          fetchWithSite("/api/posts", { cache: "no-store" }),
          fetchWithSite("/api/categories", { cache: "no-store" }),
        ]);
        const p = pRes.ok ? await pRes.json() : [];
        const c = cRes.ok ? await cRes.json() : [];
        if (!cancelled) {
          setPosts(Array.isArray(p) ? p : []);
          setCategories(Array.isArray(c) ? c : []);
        }
      } catch (e) {
        if (!cancelled) {
          setPosts([]);
          setCategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchWithSite, currentSite]);

  const totalPosts = posts.length;
  const postsByCategory = useMemo(() => {
    return categories.map((cat) => {
      const has = (h: any) => {
        const cats = new Set<string>([
          ...(h.categories || []).map((c: string) => String(c).toUpperCase()),
        ]);
        if (h.es?.category) cats.add(String(h.es.category).toUpperCase());
        if (h.en?.category) cats.add(String(h.en.category).toUpperCase());
        return cats.has(cat);
      };
      return { name: cat, count: posts.filter(has).length };
    });
  }, [posts, categories]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-red)]">
            Resumen editorial
          </p>
          <h1 className="font-neutra-demi text-3xl uppercase tracking-wide text-[#20211f]">
            Contenido de {currentSite}
          </h1>
          <p className="mt-2 text-[#61625d]">
            Administra publicaciones, campañas visuales y la agenda cultural
            desde un solo lugar.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-10 items-center justify-center gap-2 bg-[var(--color-brand-red)] px-4 text-sm font-medium text-white transition-colors hover:bg-[#ba1028]"
        >
          <FilePlus2 className="size-4" /> Nuevo post
        </Link>
      </div>

      {loading && (
        <div className="flex items-center gap-2 border border-black/10 bg-white px-4 py-3 text-sm text-[#61625d]">
          <Spinner className="size-4" /> Cargando datos…
        </div>
      )}

      <div className="grid gap-px overflow-hidden border border-black/10 bg-black/10 md:grid-cols-3">
        <div className="flex items-start justify-between bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61625d]">
              Posts
            </p>
            <p className="mt-2 font-neutra-demi text-4xl text-[#20211f]">
              {totalPosts}
            </p>
            <p className="mt-1 text-sm text-[#61625d]">Entradas disponibles</p>
          </div>
          <FileText className="size-5 text-[var(--color-brand-red)]" />
        </div>
        <div className="flex items-start justify-between bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61625d]">
              Categorías
            </p>
            <p className="mt-2 font-neutra-demi text-4xl text-[#20211f]">
              {categories.length}
            </p>
            <p className="mt-1 text-sm text-[#61625d]">
              Clasificaciones activas
            </p>
          </div>
          <FolderTree className="size-5 text-[#268477]" />
        </div>
        <div className="flex items-start justify-between bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61625d]">
              Estado
            </p>
            <p className="mt-2 font-neutra-demi text-2xl text-[#20211f]">
              Operativo
            </p>
            <p className="mt-2 text-sm text-[#61625d]">
              Sitio seleccionado: {currentSite}
            </p>
          </div>
          <Layers3 className="size-5 text-[#b56c22]" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="border border-black/10 bg-white">
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <div>
              <h2 className="font-neutra-demi text-xl uppercase tracking-wide">
                Posts por categoría
              </h2>
              <p className="mt-1 text-sm text-[#61625d]">
                Distribución del contenido publicado.
              </p>
            </div>
            <Link
              href="/admin/categories"
              className="text-sm font-medium text-[var(--color-brand-red)] hover:underline"
            >
              Gestionar
            </Link>
          </div>
          <div className="divide-y divide-black/10">
            {postsByCategory.map((cat) => (
              <Link
                key={cat.name}
                href={`/admin/posts?category=${encodeURIComponent(cat.name)}`}
                className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[#f7f7f4]"
              >
                <span className="text-sm font-medium text-[#31322f]">
                  {cat.name}
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-[#61625d]">
                  {cat.count}
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            ))}
            {postsByCategory.length === 0 && !loading && (
              <p className="px-5 py-8 text-sm text-[#61625d]">
                Aún no hay categorías disponibles.
              </p>
            )}
          </div>
        </section>

        <section className="border border-black/10 bg-[#22231f] p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
            Acciones rápidas
          </p>
          <h2 className="mt-2 font-neutra-demi text-2xl uppercase tracking-wide">
            Publica y organiza
          </h2>
          <div className="mt-5 divide-y divide-white/15">
            <Link
              href="/admin/posts/new"
              className="flex items-center justify-between py-3 text-sm transition-colors hover:text-[#ff5a72]"
            >
              <span className="flex items-center gap-2">
                <FilePlus2 className="size-4" /> Crear un post
              </span>
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/admin/agenda-cultural"
              className="flex items-center justify-between py-3 text-sm transition-colors hover:text-[#ff5a72]"
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4" /> Programar Agenda
              </span>
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/admin/images"
              className="flex items-center justify-between py-3 text-sm transition-colors hover:text-[#ff5a72]"
            >
              <span className="flex items-center gap-2">
                <Image className="size-4" /> Biblioteca visual
              </span>
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
