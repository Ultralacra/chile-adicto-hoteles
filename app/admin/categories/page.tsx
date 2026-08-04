"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Save, Tag, Trash2 } from "lucide-react";
import { useAdminApi } from "@/hooks/use-admin-api";
import { useSiteContext } from "@/contexts/site-context";

type CategoryRow = {
  slug: string;
  label_es: string | null;
  label_en: string | null;
  show_in_menu?: boolean | null;
};

export default function AdminCategoriesPage() {
  const { fetchWithSite } = useAdminApi();
  const { currentSite } = useSiteContext();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [catsError, setCatsError] = useState<string | null>(null);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [labelEs, setLabelEs] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [showInMenu, setShowInMenu] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const normalizeSlug = (input: string) =>
    String(input || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const effectiveSlug = useMemo(() => {
    if (slug.trim()) return normalizeSlug(slug);
    return normalizeSlug(labelEs || labelEn);
  }, [slug, labelEs, labelEn]);

  const loadCategories = async () => {
    setLoadingCats(true);
    setCatsError(null);
    try {
      const res = await fetchWithSite(
        "/api/categories?full=1&includeHidden=1",
        {
          cache: "no-store",
        },
      );
      const json = res.ok ? await res.json() : [];
      setCategories(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setCatsError(String(e?.message || e));
      setCategories([]);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchWithSite, currentSite]);

  const resetForm = () => {
    setSelectedSlug(null);
    setSlug("");
    setLabelEs("");
    setLabelEn("");
    setShowInMenu(true);
    setCatsError(null);
  };

  const startEdit = (row: CategoryRow) => {
    setSelectedSlug(row.slug);
    setSlug(row.slug);
    setLabelEs(row.label_es || "");
    setLabelEn(row.label_en || "");
    setShowInMenu(row.show_in_menu !== false);
    setCatsError(null);
  };

  const saveCategory = async () => {
    const s = effectiveSlug;
    if (!s) {
      setCatsError("Ingresa un slug o un nombre para generar slug.");
      return;
    }
    setSaving(true);
    setCatsError(null);
    try {
      const payload = {
        slug: s,
        label_es: labelEs.trim() || null,
        label_en: labelEn.trim() || null,
        show_in_menu: Boolean(showInMenu),
      };
      const res = await fetchWithSite("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || `Error ${res.status}`);
      }
      resetForm();
      await loadCategories();
    } catch (e: any) {
      setCatsError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (row: CategoryRow) => {
    const ok = window.confirm(
      `¿Eliminar la categoría "${row.slug}"? Esto no se puede deshacer.`,
    );
    if (!ok) return;
    setDeletingSlug(row.slug);
    setCatsError(null);
    try {
      const res = await fetchWithSite(
        `/api/categories?slug=${encodeURIComponent(row.slug)}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || `Error ${res.status}`);
      }
      if (selectedSlug === row.slug) resetForm();
      await loadCategories();
    } catch (e: any) {
      setCatsError(String(e?.message || e));
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-red)]">
            Catálogo editorial
          </p>
          <h1 className="flex items-center gap-2 font-neutra-demi text-3xl uppercase tracking-wide text-[#20211f]">
            <Tag className="size-6 text-[var(--color-brand-red)]" />
            Categorías
          </h1>
          <p className="mt-2 text-[#61625d]">
            Crea, edita y elimina categorías guardadas en la base de datos.
          </p>
        </div>
        <div className="border border-black/10 bg-white px-3 py-2 text-xs text-[#61625d]">
          <span className="font-semibold text-[#20211f]">
            {categories.length}
          </span>{" "}
          categorías registradas
        </div>
      </div>

      <div className="border border-black/10 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-neutra-demi text-xl uppercase tracking-wide text-[#20211f]">
              Gestionar categorías
            </h2>
            <p className="mt-1 text-[#61625d]">
              El slug se normaliza automáticamente.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-[#f7f7f4]"
            >
              <Plus size={15} />
              Nuevo
            </button>
            <button
              type="button"
              onClick={loadCategories}
              className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-[#f7f7f4]"
              disabled={loadingCats}
            >
              <RefreshCw
                className={loadingCats ? "animate-spin" : ""}
                size={15}
              />
              {loadingCats ? "Cargando…" : "Recargar"}
            </button>
          </div>
        </div>

        {catsError && (
          <div className="mt-4 border border-[#ba1028]/20 bg-[#fff1f2] px-4 py-3 text-[#ba1028]">
            {catsError}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#61625d]">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-10 w-full border border-black/10 bg-[#fafaf8] px-3 text-sm outline-none focus:border-[var(--color-brand-red)]"
              placeholder="ninos"
            />
            <p className="mt-1 text-[11px] text-[#85867f]">
              Se normaliza automáticamente: {effectiveSlug || "—"}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#61625d]">
              Label ES
            </label>
            <input
              type="text"
              value={labelEs}
              onChange={(e) => setLabelEs(e.target.value)}
              className="h-10 w-full border border-black/10 bg-[#fafaf8] px-3 text-sm outline-none focus:border-[var(--color-brand-red)]"
              placeholder="NIÑOS"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#61625d]">
              Label EN
            </label>
            <input
              type="text"
              value={labelEn}
              onChange={(e) => setLabelEn(e.target.value)}
              className="h-10 w-full border border-black/10 bg-[#fafaf8] px-3 text-sm outline-none focus:border-[var(--color-brand-red)]"
              placeholder="KIDS"
            />
          </div>

          <div className="flex items-center gap-3 pt-7">
            <input
              id="show_in_menu"
              type="checkbox"
              checked={showInMenu}
              onChange={(e) => setShowInMenu(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="show_in_menu" className="text-sm text-[#61625d]">
              Mostrar en menú
            </label>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={saveCategory}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[var(--color-brand-red)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? null : <Save size={15} />}
            {saving
              ? "Guardando…"
              : selectedSlug
                ? "Actualizar categoría"
                : "Crear categoría"}
          </button>
          {selectedSlug && (
            <span className="text-xs uppercase tracking-wide text-[#61625d]">
              Editando: <span className="font-mono">{selectedSlug}</span>
            </span>
          )}
        </div>
      </div>

      <div className="border border-black/10 bg-white">
        <div className="flex items-center justify-between border-b border-black/10 bg-[#fafaf8] p-5">
          <h2 className="font-neutra-demi text-xl uppercase tracking-wide text-[#20211f]">
            Existentes
          </h2>
          <span className="text-xs uppercase tracking-wide text-[#85867f]">
            {categories.length} registros
          </span>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto border border-black/10">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f3f3f1] text-[#61625d]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    label_es
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    label_en
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    menú
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                    acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-gray-500" colSpan={5}>
                      {loadingCats
                        ? "Cargando categorías…"
                        : "No hay categorías (o no se pudo leer la BD)."}
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr
                      key={c.slug}
                      className="border-t border-black/10 text-[#30312e] hover:bg-[#f7f7f4]"
                    >
                      <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
                      <td className="px-4 py-3">{c.label_es || "—"}</td>
                      <td className="px-4 py-3">{c.label_en || "—"}</td>
                      <td className="px-4 py-3 text-xs uppercase tracking-wide text-[#61625d]">
                        {c.show_in_menu === false ? "Oculta" : "Visible"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="mr-1 inline-flex h-8 w-8 items-center justify-center border border-black/10 hover:bg-[#f7f7f4]"
                          title={`Editar ${c.slug}`}
                          aria-label={`Editar ${c.slug}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(c)}
                          disabled={deletingSlug === c.slug}
                          className="inline-flex h-8 w-8 items-center justify-center border border-[#ba1028]/30 text-[#ba1028] hover:bg-[#fff1f2] disabled:opacity-60"
                          title={`Eliminar ${c.slug}`}
                          aria-label={`Eliminar ${c.slug}`}
                        >
                          {deletingSlug === c.slug ? (
                            <RefreshCw className="animate-spin" size={15} />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
