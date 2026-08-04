"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  List,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search as SearchIcon,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useAdminApi } from "@/hooks/use-admin-api";
import { useSiteContext } from "@/contexts/site-context";

type CommuneRow = {
  slug: string;
  label: string | null;
  show_in_menu?: boolean | null;
  menu_order?: number | null;
};

type CommuneDetail = {
  slug: string;
  commune: CommuneRow | null;
  posts: Array<{
    slug: string;
    featuredImage: string | null;
    name_es: string;
    name_en: string;
  }>;
};

type PostSearchItem = {
  slug: string;
  featuredImage: string | null;
  name_es: string;
  name_en: string;
};

export default function AdminCommunesPage() {
  const { fetchWithSite } = useAdminApi();
  const { currentSite } = useSiteContext();
  const [communes, setCommunes] = useState<CommuneRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [showInMenu, setShowInMenu] = useState(true);
  const [menuOrder, setMenuOrder] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<CommuneDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [postQuery, setPostQuery] = useState("");
  const [postResults, setPostResults] = useState<PostSearchItem[]>([]);
  const [searchingPosts, setSearchingPosts] = useState(false);
  const [addingPostSlug, setAddingPostSlug] = useState<string | null>(null);
  const [removingPostSlug, setRemovingPostSlug] = useState<string | null>(null);

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
    return normalizeSlug(label);
  }, [slug, label]);

  const loadCommunes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithSite("/api/communes?full=1&includeHidden=1", {
        cache: "no-store",
      });
      const json = res.ok ? await res.json() : [];
      setCommunes(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setError(String(e?.message || e));
      setCommunes([]);
    } finally {
      setLoading(false);
    }
  };

  const toCsvCell = (value: any) => {
    const s = String(value ?? "");
    // CSV escape: wrap in quotes if contains special chars, double quotes inside
    if (/[\r\n,\"]/g.test(s)) {
      return `"${s.replace(/\"/g, '""')}"`;
    }
    return s;
  };

  const exportAllToExcelCsv = async () => {
    setExporting(true);
    setError(null);
    try {
      const res = await fetchWithSite("/api/communes?full=1&includeHidden=1", {
        cache: "no-store",
      });
      const json = res.ok ? await res.json() : [];
      const rows: CommuneRow[] = Array.isArray(json) ? json : [];

      const lines: string[] = [];
      // Header
      lines.push(
        [
          "commune_slug",
          "commune_label",
          "post_count",
          "post_slug",
          "post_name_es",
          "post_name_en",
        ].join(","),
      );

      for (const c of rows) {
        const slug = String(c?.slug || "").trim();
        if (!slug) continue;
        const label = String(c?.label || "").trim();

        const dRes = await fetchWithSite(
          `/api/communes/${encodeURIComponent(slug)}`,
          {
            cache: "no-store",
          },
        );
        const detail = (
          dRes.ok ? await dRes.json() : null
        ) as CommuneDetail | null;
        const posts = Array.isArray(detail?.posts) ? detail!.posts : [];

        if (posts.length === 0) {
          lines.push(
            [
              toCsvCell(slug),
              toCsvCell(label),
              "0",
              toCsvCell("SIN POSTS"),
              "",
              "",
            ].join(","),
          );
          continue;
        }

        for (const p of posts) {
          lines.push(
            [
              toCsvCell(slug),
              toCsvCell(label),
              String(posts.length),
              toCsvCell(p.slug),
              toCsvCell(p.name_es),
              toCsvCell(p.name_en),
            ].join(","),
          );
        }
      }

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const stamp =
        now.getFullYear() +
        pad(now.getMonth() + 1) +
        pad(now.getDate()) +
        "-" +
        pad(now.getHours()) +
        pad(now.getMinutes()) +
        pad(now.getSeconds());

      // UTF-8 BOM ayuda a Excel a detectar acentos correctamente
      const csv = "\uFEFF" + lines.join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comunas-posts-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setExporting(false);
    }
  };

  const loadDetail = async (slugToLoad: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetchWithSite(
        `/api/communes/${encodeURIComponent(slugToLoad)}`,
        {
          cache: "no-store",
        },
      );
      const json = (res.ok ? await res.json() : null) as CommuneDetail | null;
      setDetail(json && typeof json === "object" ? json : null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadCommunes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchWithSite, currentSite]);

  useEffect(() => {
    if (!detailSlug) {
      setDetail(null);
      return;
    }
    loadDetail(detailSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailSlug]);

  const resetForm = () => {
    setSelectedSlug(null);
    setSlug("");
    setLabel("");
    setShowInMenu(true);
    setMenuOrder(0);
    setError(null);
  };

  const startEdit = (row: CommuneRow) => {
    setSelectedSlug(row.slug);
    setSlug(row.slug);
    setLabel(row.label || "");
    setShowInMenu(row.show_in_menu !== false);
    setMenuOrder(
      Number.isFinite(Number(row.menu_order)) ? Number(row.menu_order) : 0,
    );
    setError(null);
    setDetailSlug(row.slug);
  };

  const saveCommune = async () => {
    const s = effectiveSlug;
    if (!s) {
      setError("Ingresa un slug o un nombre para generar slug.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        slug: s,
        label: label.trim() || s,
        show_in_menu: Boolean(showInMenu),
        menu_order: Number(menuOrder) || 0,
      };
      const res = await fetchWithSite("/api/communes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok)
        throw new Error(data?.message || `Error ${res.status}`);
      resetForm();
      await loadCommunes();
      setDetailSlug(s);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const deleteCommune = async (row: CommuneRow) => {
    const ok = window.confirm(
      `¿Eliminar la comuna "${row.slug}"? Se eliminarán también sus asociaciones.`,
    );
    if (!ok) return;

    setDeletingSlug(row.slug);
    setError(null);
    try {
      const res = await fetchWithSite(
        `/api/communes?slug=${encodeURIComponent(row.slug)}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok)
        throw new Error(data?.message || `Error ${res.status}`);

      if (selectedSlug === row.slug) resetForm();
      if (detailSlug === row.slug) setDetailSlug(null);
      await loadCommunes();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setDeletingSlug(null);
    }
  };

  const searchPosts = async (q: string) => {
    setSearchingPosts(true);
    try {
      const res = await fetchWithSite(
        `/api/posts/search?q=${encodeURIComponent(q)}&limit=30`,
        {
          cache: "no-store",
        },
      );
      const json = res.ok ? await res.json() : null;
      const items = Array.isArray(json?.items)
        ? (json.items as PostSearchItem[])
        : [];
      setPostResults(items);
    } catch {
      setPostResults([]);
    } finally {
      setSearchingPosts(false);
    }
  };

  useEffect(() => {
    const q = postQuery.trim();
    if (!q) {
      setPostResults([]);
      return;
    }
    const t = setTimeout(() => searchPosts(q), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postQuery]);

  const addPostToCommune = async (postSlug: string) => {
    if (!detailSlug) return;
    setAddingPostSlug(postSlug);
    setError(null);
    try {
      const res = await fetchWithSite(
        `/api/communes/${encodeURIComponent(detailSlug)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postSlug }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok)
        throw new Error(data?.message || `Error ${res.status}`);
      setPostQuery("");
      setPostResults([]);
      await loadDetail(detailSlug);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setAddingPostSlug(null);
    }
  };

  const removePostFromCommune = async (postSlug: string) => {
    if (!detailSlug) return;
    setRemovingPostSlug(postSlug);
    setError(null);
    try {
      const res = await fetchWithSite(
        `/api/communes/${encodeURIComponent(
          detailSlug,
        )}?postSlug=${encodeURIComponent(postSlug)}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok)
        throw new Error(data?.message || `Error ${res.status}`);
      await loadDetail(detailSlug);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setRemovingPostSlug(null);
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
            <MapPin className="size-6 text-[var(--color-brand-red)]" />
            Comunas
          </h1>
          <p className="mt-2 text-[#61625d]">
            Mantén comunas y asigna posts a cada comuna (DB). Esto reemplaza
            configuración estática.
          </p>
        </div>
        <div className="border border-black/10 bg-white px-3 py-2 text-xs text-[#61625d]">
          <span className="font-semibold text-[#20211f]">
            {communes.length}
          </span>{" "}
          comunas registradas
        </div>
      </div>

      <div className="border border-black/10 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-neutra-demi text-xl uppercase tracking-wide text-[#20211f]">
              Gestionar comunas
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
              onClick={exportAllToExcelCsv}
              className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-[#f7f7f4]"
              disabled={exporting || loading}
              title="Descarga un CSV compatible con Excel"
            >
              <Download size={15} />
              {exporting ? "Exportando…" : "Exportar Excel"}
            </button>
            <button
              type="button"
              onClick={loadCommunes}
              className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-[#f7f7f4]"
              disabled={loading}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} size={15} />
              {loading ? "Cargando…" : "Recargar"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 border border-[#ba1028]/20 bg-[#fff1f2] px-4 py-3 text-[#ba1028]">
            {error}
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
              placeholder="vitacura"
            />
            <p className="mt-1 text-[11px] text-[#85867f]">
              Se normaliza automáticamente: {effectiveSlug || "—"}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#61625d]">
              Nombre
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-10 w-full border border-black/10 bg-[#fafaf8] px-3 text-sm outline-none focus:border-[var(--color-brand-red)]"
              placeholder="Vitacura"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#61625d]">
              Orden
            </label>
            <input
              type="number"
              value={menuOrder}
              onChange={(e) => setMenuOrder(Number(e.target.value) || 0)}
              className="h-10 w-full border border-black/10 bg-[#fafaf8] px-3 text-sm outline-none focus:border-[var(--color-brand-red)]"
              placeholder="0"
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
            onClick={saveCommune}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[var(--color-brand-red)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? null : <Save size={15} />}
            {saving
              ? "Guardando…"
              : selectedSlug
                ? "Actualizar comuna"
                : "Crear comuna"}
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
            {communes.length} registros
          </span>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-gray-600">Cargando…</div>
          ) : communes.length === 0 ? (
            <div className="text-gray-600">No hay comunas aún.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#f3f3f1]">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[#61625d]">
                    <th className="px-4 py-3 pr-4">Slug</th>
                    <th className="px-4 py-3 pr-4">Nombre</th>
                    <th className="px-4 py-3 pr-4">Orden</th>
                    <th className="px-4 py-3 pr-4">Menú</th>
                    <th className="px-4 py-3 pr-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {communes.map((c) => (
                    <tr
                      key={c.slug}
                      className="border-t border-black/10 text-[#30312e] hover:bg-[#f7f7f4]"
                    >
                      <td className="px-4 py-3 pr-4 font-mono text-xs">
                        {c.slug}
                      </td>
                      <td className="px-4 py-3 pr-4">{c.label || c.slug}</td>
                      <td className="px-4 py-3 pr-4">
                        {Number(c.menu_order ?? 0)}
                      </td>
                      <td className="px-4 py-3 pr-4 text-xs uppercase tracking-wide text-[#61625d]">
                        {c.show_in_menu === false ? "No" : "Sí"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 pr-4">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="inline-flex h-8 w-8 items-center justify-center border border-black/10 hover:bg-[#f7f7f4]"
                            title={`Editar ${c.slug}`}
                            aria-label={`Editar ${c.slug}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailSlug(c.slug)}
                            className="inline-flex h-8 w-8 items-center justify-center border border-black/10 hover:bg-[#f7f7f4]"
                            title={`Ver posts de ${c.slug}`}
                            aria-label={`Ver posts de ${c.slug}`}
                          >
                            <List size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCommune(c)}
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="border border-black/10 bg-white">
        <div className="flex items-center justify-between border-b border-black/10 p-5">
          <div>
            <h2 className="font-neutra-demi text-xl uppercase tracking-wide text-[#20211f]">
              Posts por comuna
            </h2>
            <p className="mt-1 text-[#61625d]">
              Selecciona una comuna y asigna/quita posts.
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {detailSlug ? (
              <span>
                Comuna: <span className="font-mono">{detailSlug}</span>
              </span>
            ) : (
              "—"
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {!detailSlug ? (
            <div className="text-gray-600">
              Elige una comuna (botón “Posts”).
            </div>
          ) : loadingDetail ? (
            <div className="text-gray-600">Cargando…</div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar post por slug o nombre
                </label>
                <div className="relative">
                  <SearchIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-red)]"
                    size={16}
                  />
                  <input
                    type="text"
                    value={postQuery}
                    onChange={(e) => setPostQuery(e.target.value)}
                    className="h-10 w-full border border-black/10 bg-[#fafaf8] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-brand-red)]"
                    placeholder="the-singular"
                  />
                </div>
                {searchingPosts && (
                  <div className="text-sm text-gray-500 mt-2">Buscando…</div>
                )}
                {postResults.length > 0 && (
                  <div className="mt-2 overflow-hidden border border-black/10">
                    {postResults.map((p) => (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => addPostToCommune(p.slug)}
                        disabled={addingPostSlug === p.slug}
                        className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-[#f7f7f4]"
                      >
                        <span className="text-sm">
                          <span className="font-mono">{p.slug}</span>
                          {p.name_es ? ` — ${p.name_es}` : ""}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-red)]">
                          {addingPostSlug === p.slug ? (
                            <RefreshCw className="animate-spin" size={14} />
                          ) : (
                            <UserPlus size={14} />
                          )}
                          {addingPostSlug === p.slug ? "Agregando…" : "Agregar"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-black/10 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-neutra-demi text-lg uppercase tracking-wide text-[#20211f]">
                    Asociados
                  </h3>
                  <button
                    type="button"
                    onClick={() => loadDetail(detailSlug)}
                    className="inline-flex items-center gap-2 border border-black/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:bg-[#f7f7f4]"
                  >
                    <RefreshCw size={14} />
                    Recargar
                  </button>
                </div>

                {(detail?.posts?.length || 0) === 0 ? (
                  <div className="text-gray-600 mt-2">
                    Sin posts asociados aún.
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {detail?.posts.map((p) => (
                      <div
                        key={p.slug}
                        className="flex items-center justify-between border border-black/10 px-4 py-2"
                      >
                        <div className="text-sm">
                          <div className="font-mono">{p.slug}</div>
                          <div className="text-gray-600">
                            {p.name_es || p.name_en || "(sin nombre)"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePostFromCommune(p.slug)}
                          disabled={removingPostSlug === p.slug}
                          className="inline-flex h-8 w-8 items-center justify-center border border-[#ba1028]/30 text-[#ba1028] hover:bg-[#fff1f2] disabled:opacity-60"
                          title={`Quitar ${p.slug}`}
                          aria-label={`Quitar ${p.slug}`}
                        >
                          {removingPostSlug === p.slug ? (
                            <RefreshCw className="animate-spin" size={15} />
                          ) : (
                            <X size={15} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
