"use client";

import { useEffect, useMemo, useState } from "react";

type CategoryRow = {
  slug: string;
  label_es: string | null;
  label_en: string | null;
};

export default function SettingsPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [catsError, setCatsError] = useState<string | null>(null);

  const [slug, setSlug] = useState("");
  const [labelEs, setLabelEs] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [savingCat, setSavingCat] = useState(false);

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
    // Si no ingresan slug, lo inferimos desde label ES/EN
    return normalizeSlug(labelEs || labelEn);
  }, [slug, labelEs, labelEn]);

  const loadCategories = async () => {
    setLoadingCats(true);
    setCatsError(null);
    try {
      const res = await fetch("/api/categories?full=1", { cache: "no-store" });
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
  }, []);

  const saveCategory = async () => {
    const s = effectiveSlug;
    if (!s) {
      setCatsError("Ingresa un slug o un nombre para generar slug.");
      return;
    }
    setSavingCat(true);
    setCatsError(null);
    try {
      const payload = {
        slug: s,
        label_es: labelEs.trim() || null,
        label_en: labelEn.trim() || null,
      };
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || `Error ${res.status}`);
      }
      setSlug("");
      setLabelEs("");
      setLabelEn("");
      await loadCategories();
    } catch (e: any) {
      setCatsError(String(e?.message || e));
    } finally {
      setSavingCat(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="border-b border-black/10 pb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-red)]">
          Sistema
        </p>
        <h1 className="font-neutra-demi text-3xl uppercase tracking-wide text-[#20211f]">
          Configuración
        </h1>
        <p className="mt-2 text-[#61625d]">
          Ajustes del panel de administración
        </p>
      </div>

      <div className="border border-black/10 bg-white p-5">
        <h2 className="mb-4 font-neutra-demi text-xl uppercase tracking-wide text-[#20211f]">
          Credenciales de administrador
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value="admin"
              disabled
              className="w-full border border-black/10 bg-[#f3f3f1] px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value="chileadicto2024"
              disabled
              className="w-full border border-black/10 bg-[#f3f3f1] px-4 py-2"
            />
          </div>
          <p className="text-sm text-gray-500">
            Próximamente se habilitará el cambio de contraseña…
          </p>
        </div>
      </div>

      <div className="border border-black/10 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-neutra-demi text-xl uppercase tracking-wide text-[#20211f]">
              Categorías
            </h2>
            <p className="mt-1 text-[#61625d]">
              Crea o actualiza categorías y se guardan en la base de datos.
            </p>
          </div>
          <button
            type="button"
            onClick={loadCategories}
            className="border border-black/10 bg-white px-4 py-2 hover:bg-[#f7f7f4]"
            disabled={loadingCats}
          >
            {loadingCats ? "Cargando…" : "Recargar"}
          </button>
        </div>

        {catsError && (
          <div className="mt-4 border border-[#ba1028]/20 bg-[#fff1f2] px-4 py-3 text-[#ba1028]">
            {catsError}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-black/10 bg-white px-4 py-2"
              placeholder="ninos"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se normaliza automáticamente: {effectiveSlug || "—"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label ES
            </label>
            <input
              type="text"
              value={labelEs}
              onChange={(e) => setLabelEs(e.target.value)}
              className="w-full border border-black/10 bg-white px-4 py-2"
              placeholder="NIÑOS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label EN
            </label>
            <input
              type="text"
              value={labelEn}
              onChange={(e) => setLabelEn(e.target.value)}
              className="w-full border border-black/10 bg-white px-4 py-2"
              placeholder="KIDS"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={saveCategory}
            disabled={savingCat}
            className="px-4 py-2 bg-[var(--color-brand-red)] text-white font-bold uppercase hover:opacity-90 disabled:opacity-60"
          >
            {savingCat ? "Guardando…" : "Guardar categoría"}
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Existentes</h3>
          <div className="overflow-x-auto border border-black/10">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f3f3f1]">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">
                    slug
                  </th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">
                    label_es
                  </th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">
                    label_en
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3 text-gray-500" colSpan={3}>
                      {loadingCats
                        ? "Cargando categorías…"
                        : "No hay categorías (o no se pudo leer la BD)."}
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.slug} className="border-t border-gray-200">
                      <td className="px-4 py-2 font-mono">{c.slug}</td>
                      <td className="px-4 py-2">{c.label_es || "—"}</td>
                      <td className="px-4 py-2">{c.label_en || "—"}</td>
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
