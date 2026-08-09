"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  FolderOpen,
  Images as ImagesIcon,
  Save,
  Search,
  X,
} from "lucide-react";
import { useAdminApi } from "@/hooks/use-admin-api";
import { useSiteContext } from "@/contexts/site-context";

type PostLite = {
  slug: string;
  featuredImage?: string | null;
  images?: string[];
  es?: { name?: string };
  en?: { name?: string };
};

type ImageRecord = {
  url: string;
  postSlug: string;
  postName: string;
  folder: string;
  kind: "featured" | "gallery";
};

function getPostName(post: PostLite) {
  return post.es?.name || post.en?.name || post.slug;
}

function getImageFolder(url: string) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname
      .split("/")
      .map((segment) => decodeURIComponent(segment))
      .filter(Boolean);
    const publicObjectIndex = parts.findIndex(
      (segment, index) =>
        segment === "object" &&
        parts[index - 1] === "v1" &&
        parts[index + 1] === "public",
    );

    if (publicObjectIndex >= 0) {
      const storagePath = parts.slice(publicObjectIndex + 3);
      if (storagePath.length > 1) {
        return storagePath.slice(0, -1).join("/");
      }
    }

    if (parts.length > 1) {
      return parts.slice(0, -1).join("/");
    }
  } catch {
    const clean = String(url || "")
      .split("?")[0]
      .split("#")[0];
    const parts = clean.split("/").filter(Boolean);
    if (parts.length > 1) {
      return parts.slice(0, -1).join("/");
    }
  }

  return "raiz";
}

function buildImageRecords(post: PostLite): ImageRecord[] {
  const records: ImageRecord[] = [];
  const seen = new Set<string>();
  const postName = getPostName(post);

  const pushRecord = (
    url: string | null | undefined,
    kind: ImageRecord["kind"],
  ) => {
    const normalized = String(url || "").trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    records.push({
      url: normalized,
      postSlug: post.slug,
      postName,
      folder: getImageFolder(normalized),
      kind,
    });
  };

  pushRecord(post.featuredImage, "featured");

  for (const image of Array.isArray(post.images) ? post.images : []) {
    pushRecord(image, "gallery");
  }

  return records;
}

export default function AdminImagesPage() {
  const { fetchWithSite } = useAdminApi();
  const { currentSite } = useSiteContext();
  const [loading, setLoading] = useState(true);
  const [loadingSelectedPost, setLoadingSelectedPost] = useState(false);
  const [posts, setPosts] = useState<PostLite[]>([]);
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostLite | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchWithSite("/api/posts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (!cancelled) setPosts(Array.isArray(rows) ? rows : []);
      })
      .catch(() => !cancelled && setPosts([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [fetchWithSite, currentSite]);

  useEffect(() => {
    if (!selectedSlug) {
      setLoadingSelectedPost(false);
      setSelectedPost(null);
      setImages([]);
      setFeaturedIndex(0);
      return;
    }
    let cancelled = false;
    setLoadingSelectedPost(true);
    setSelectedPost(null);
    setImages([]);
    fetchWithSite(`/api/posts/${encodeURIComponent(selectedSlug)}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((row) => {
        if (cancelled || !row) return;
        setSelectedPost(row);
        const gal: string[] = Array.isArray(row.images)
          ? row.images.slice()
          : [];
        const feat: string | undefined =
          row.featuredImage || gal[0] || undefined;
        const without = gal.filter((u) => u !== feat);
        const combined = feat ? [feat, ...without] : without;
        setImages(combined);
        setFeaturedIndex(0);
      })
      .catch(() => !cancelled && setSelectedPost(null))
      .finally(() => {
        if (!cancelled) setLoadingSelectedPost(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSlug, fetchWithSite]);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const name = String(p.es?.name || p.en?.name || "").toLowerCase();
      return p.slug.toLowerCase().includes(q) || name.includes(q);
    });
  }, [posts, query]);

  const allImageRecords = useMemo(
    () => posts.flatMap((post) => buildImageRecords(post)),
    [posts],
  );

  const filteredImageRecords = useMemo(
    () => filteredPosts.flatMap((post) => buildImageRecords(post)),
    [filteredPosts],
  );

  const overallStats = useMemo(() => {
    const uniqueUrls = new Set(allImageRecords.map((record) => record.url));
    const folders = new Set(allImageRecords.map((record) => record.folder));
    const postsWithImages = posts.filter(
      (post) => buildImageRecords(post).length > 0,
    ).length;

    return {
      totalImages: allImageRecords.length,
      uniqueImages: uniqueUrls.size,
      postsWithImages,
      folders: folders.size,
    };
  }, [allImageRecords, posts]);

  const filteredStats = useMemo(() => {
    const uniqueUrls = new Set(
      filteredImageRecords.map((record) => record.url),
    );

    return {
      posts: filteredPosts.length,
      totalImages: filteredImageRecords.length,
      uniqueImages: uniqueUrls.size,
    };
  }, [filteredImageRecords, filteredPosts]);

  const postsSummary = useMemo(() => {
    return filteredPosts
      .map((post) => {
        const records = buildImageRecords(post);
        const featured = records.filter(
          (record) => record.kind === "featured",
        ).length;
        const gallery = records.filter(
          (record) => record.kind === "gallery",
        ).length;
        const folders = new Set(records.map((record) => record.folder));

        return {
          slug: post.slug,
          name: getPostName(post),
          total: records.length,
          featured,
          gallery,
          folders: folders.size,
        };
      })
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "es"));
  }, [filteredPosts]);

  const folderSummary = useMemo(() => {
    const grouped = new Map<
      string,
      { folder: string; total: number; urls: Set<string>; posts: Set<string> }
    >();

    for (const record of filteredImageRecords) {
      const current = grouped.get(record.folder) || {
        folder: record.folder,
        total: 0,
        urls: new Set<string>(),
        posts: new Set<string>(),
      };
      current.total += 1;
      current.urls.add(record.url);
      current.posts.add(record.postSlug);
      grouped.set(record.folder, current);
    }

    return Array.from(grouped.values())
      .map((item) => ({
        folder: item.folder,
        total: item.total,
        uniqueImages: item.urls.size,
        posts: item.posts.size,
      }))
      .sort(
        (a, b) => b.total - a.total || a.folder.localeCompare(b.folder, "es"),
      );
  }, [filteredImageRecords]);

  const move = (from: number, to: number) => {
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= images.length ||
      to >= images.length
    )
      return;
    const arr = [...images];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    setImages(arr);
    setFeaturedIndex((fi) => (fi === from ? to : fi));
  };

  const remove = (idx: number) => {
    const arr = images.filter((_, i) => i !== idx);
    setImages(arr);
    if (idx === featuredIndex) setFeaturedIndex(0);
  };

  const handleDropFiles = async (files: FileList | File[]) => {
    if (!selectedSlug) return alert("Selecciona un post primero");
    const arr = Array.from(files || []);
    if (arr.length === 0) return;
    setUploading(true);
    try {
      const form = new FormData();
      for (const f of arr) form.append("files", f);
      const res = await fetchWithSite(
        `/api/posts/${encodeURIComponent(selectedSlug)}/images`,
        {
          method: "POST",
          body: form,
        },
      );
      if (!res.ok) throw new Error(await res.text());
      const fresh = await fetchWithSite(
        `/api/posts/${encodeURIComponent(selectedSlug)}`,
        { cache: "no-store" },
      ).then((r) => (r.ok ? r.json() : null));
      if (fresh) {
        setSelectedPost(fresh);
        const gal: string[] = Array.isArray(fresh.images)
          ? fresh.images.slice()
          : [];
        const feat: string | undefined =
          fresh.featuredImage || gal[0] || undefined;
        const without = gal.filter((u: string) => u !== feat);
        const combined = feat ? [feat, ...without] : without;
        setImages(combined);
        setFeaturedIndex((fi) => Math.min(fi, combined.length - 1));
      }
    } catch (e: any) {
      console.error(e);
      alert("No se pudo subir: " + (e?.message || e));
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPost) return;
    setSaving(true);
    try {
      const fi = Math.max(0, Math.min(featuredIndex, images.length - 1));
      const featured = images[fi] || "";
      const gallery = images.filter((_, i) => i !== fi);
      const payload = { featuredImage: featured || null, images: gallery };
      const res = await fetchWithSite(
        `/api/posts/${encodeURIComponent(selectedPost.slug)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      const fresh = await fetchWithSite(
        `/api/posts/${encodeURIComponent(selectedPost.slug)}`,
        { cache: "no-store" },
      ).then((r) => (r.ok ? r.json() : null));
      if (fresh) {
        setSelectedPost(fresh);
        const gal: string[] = Array.isArray(fresh.images)
          ? fresh.images.slice()
          : [];
        const feat: string | undefined =
          fresh.featuredImage || gal[0] || undefined;
        const without = gal.filter((u) => u !== feat);
        const combined = feat ? [feat, ...without] : without;
        setImages(combined);
        setFeaturedIndex(0);
      }
      alert("Imágenes guardadas correctamente");
    } catch (e: any) {
      console.error(e);
      alert("No se pudo guardar: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-red)]">
            Recursos editoriales
          </p>
          <h1 className="flex items-center gap-2 font-neutra-demi text-3xl uppercase tracking-wide text-[#20211f]">
            <ImagesIcon className="size-6 text-[var(--color-brand-red)]" />
            Biblioteca visual
          </h1>
          <p className="mt-2 text-[#61625d]">
            Organiza las imágenes asociadas al contenido del sitio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/posts">
            <Button variant="outline" size="icon" className="rounded-none">
              <ArrowLeft size={18} />
            </Button>
          </Link>
        </div>
      </div>

      <Card className="rounded-none border-black/10 bg-white p-4 shadow-none">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Search
              size={17}
              className="shrink-0 text-[var(--color-brand-red)]"
            />
            <Input
              className="h-10 rounded-none border-black/10 bg-[#fafaf8] shadow-none"
              placeholder="Buscar por nombre o slug…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#61625d]">
            <span className="font-neutra-demi text-lg text-[#20211f]">
              {filteredPosts.length}
            </span>
            posts
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="overflow-hidden rounded-none border-black/10 bg-white p-0 shadow-none">
          <div className="flex items-center justify-between border-b border-black/10 bg-[#fafaf8] px-4 py-3">
            <div>
              <div className="font-neutra-demi text-sm uppercase tracking-wide text-[#20211f]">
                Posts
              </div>
              <div className="mt-1 text-[11px] text-[#85867f]">
                Selecciona un contenido
              </div>
            </div>
            <span className="text-xs text-[#85867f]">
              {filteredPosts.length}
            </span>
          </div>
          <div className="max-h-[52vh] overflow-auto">
            {loading ? (
              <div className="flex items-center gap-2 p-4 text-[#61625d]">
                <Spinner className="size-4" /> Cargando…
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-4 text-[#61625d]">Sin resultados</div>
            ) : (
              <ul className="divide-y divide-black/10">
                {filteredPosts.map((p) => {
                  const active = selectedSlug === p.slug;
                  return (
                    <li key={p.slug}>
                      <button
                        className={`relative w-full px-4 py-3 text-left transition-colors hover:bg-[#f7f7f4] ${
                          active ? "bg-[#fff1ef]" : "bg-white"
                        }`}
                        onClick={() => {
                          setSelectedSlug(p.slug);
                          setActiveTab("editor");
                        }}
                      >
                        {active ? (
                          <span className="absolute inset-y-0 left-0 w-1 bg-[var(--color-brand-red)]" />
                        ) : null}
                        <div
                          className={`truncate text-sm ${active ? "font-semibold text-[#20211f]" : "font-medium text-[#30312e]"}`}
                        >
                          {p.es?.name || p.en?.name || p.slug}
                        </div>
                        <div className="mt-1 truncate text-[11px] text-[#85867f]">
                          {p.slug}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        <div className="min-w-0">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <Card className="rounded-none border-black/10 bg-white p-4 shadow-none">
                <div className="text-xs uppercase tracking-wide text-[#85867f]">
                  Imágenes registradas
                </div>
                <div className="mt-1 font-neutra-demi text-3xl text-[#20211f]">
                  {overallStats.totalImages}
                </div>
              </Card>
              <Card className="rounded-none border-black/10 bg-white p-4 shadow-none">
                <div className="text-xs uppercase tracking-wide text-[#85867f]">
                  URLs únicas
                </div>
                <div className="mt-1 font-neutra-demi text-3xl text-[#20211f]">
                  {overallStats.uniqueImages}
                </div>
              </Card>
              <Card className="rounded-none border-black/10 bg-white p-4 shadow-none">
                <div className="text-xs uppercase tracking-wide text-[#85867f]">
                  Posts con imágenes
                </div>
                <div className="mt-1 font-neutra-demi text-3xl text-[#20211f]">
                  {overallStats.postsWithImages}
                </div>
              </Card>
              <Card className="rounded-none border-black/10 bg-white p-4 shadow-none">
                <div className="text-xs uppercase tracking-wide text-[#85867f]">
                  Carpetas detectadas
                </div>
                <div className="mt-1 font-neutra-demi text-3xl text-[#20211f]">
                  {overallStats.folders}
                </div>
              </Card>
            </div>

            {query.trim() ? (
              <Card className="rounded-none border-black/10 bg-white p-4 text-sm text-gray-600 shadow-none">
                El filtro actual muestra {filteredStats.posts} posts,{" "}
                {filteredStats.totalImages} imágenes registradas y{" "}
                {filteredStats.uniqueImages} URLs únicas.
              </Card>
            ) : null}

            {(saving || uploading) && (
              <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm grid place-items-center">
                <div className="flex items-center gap-3 border border-black/10 bg-white p-6 shadow-lg">
                  <Spinner className="size-5" />
                  <div className="text-gray-700 font-medium">
                    {saving ? "Guardando…" : "Subiendo imágenes…"}
                  </div>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-black/10 bg-transparent p-0">
                <TabsTrigger
                  className="h-11 rounded-none border-0 border-b-2 border-transparent px-4 text-xs uppercase tracking-[0.1em] text-[#85867f] shadow-none data-[state=active]:border-[var(--color-brand-red)] data-[state=active]:bg-transparent data-[state=active]:text-[#20211f] data-[state=active]:shadow-none"
                  value="editor"
                >
                  Editar post
                </TabsTrigger>
                <TabsTrigger
                  className="h-11 rounded-none border-0 border-b-2 border-transparent px-4 text-xs uppercase tracking-[0.1em] text-[#85867f] shadow-none data-[state=active]:border-[var(--color-brand-red)] data-[state=active]:bg-transparent data-[state=active]:text-[#20211f] data-[state=active]:shadow-none"
                  value="posts"
                >
                  Por post
                </TabsTrigger>
                <TabsTrigger
                  className="h-11 rounded-none border-0 border-b-2 border-transparent px-4 text-xs uppercase tracking-[0.1em] text-[#85867f] shadow-none data-[state=active]:border-[var(--color-brand-red)] data-[state=active]:bg-transparent data-[state=active]:text-[#20211f] data-[state=active]:shadow-none"
                  value="folders"
                >
                  Por carpeta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor">
                <Card className="rounded-none border-black/10 bg-white p-4 shadow-none">
                  {loadingSelectedPost ? (
                    <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-[#61625d]">
                      <Spinner className="size-5 text-[var(--color-brand-red)]" />
                      Cargando imágenes…
                    </div>
                  ) : !selectedPost ? (
                    <div className="text-gray-600">
                      Selecciona un post para administrar sus imágenes.
                    </div>
                  ) : (
                    <div
                      className="space-y-4"
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (!isDragging) setIsDragging(true);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        const files = e.dataTransfer?.files;
                        if (files && files.length > 0) {
                          handleDropFiles(files);
                        }
                        setIsDragging(false);
                      }}
                    >
                      <div>
                        <div className="text-sm text-gray-500">Post</div>
                        <div className="font-semibold">
                          {selectedPost.es?.name ||
                            selectedPost.en?.name ||
                            selectedPost.slug}
                        </div>
                        <div className="relative">
                          {isDragging && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-[var(--color-brand-red)] bg-[#fff1ef]/80 font-medium text-[var(--color-brand-red)]">
                              Suelta tus imágenes aquí para subirlas…
                            </div>
                          )}
                          <div className="text-[11px] text-gray-500">
                            {selectedPost.slug}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600">
                          Destacada
                        </Label>
                        {images[featuredIndex] ? (
                          <img
                            src={images[featuredIndex]}
                            alt="Destacada"
                            className="w-full max-w-xl aspect-[16/9] border border-black/10 object-cover"
                          />
                        ) : (
                          <div className="grid w-full max-w-xl aspect-[16/9] place-items-center border border-black/10 bg-[#f3f3f1] text-[#85867f]">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600">Galería</Label>
                        {images.length === 0 ? (
                          <div className="text-gray-500 text-sm">
                            No hay imágenes.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {images.map((src, idx) => (
                              <div
                                key={idx}
                                className={`group relative border border-black/10 ${
                                  idx === featuredIndex
                                    ? "ring-2 ring-[var(--color-brand-red)]"
                                    : ""
                                }`}
                              >
                                <img
                                  src={src}
                                  alt={`img-${idx}`}
                                  className="w-full aspect-[4/3] object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                                <div className="absolute bottom-1 left-1 right-1 flex gap-1 justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-none border-black/10 bg-white text-xs"
                                    onClick={() => setFeaturedIndex(idx)}
                                  >
                                    Destacar
                                  </Button>
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="rounded-none border-black/10 bg-white"
                                      onClick={() => move(idx, idx - 1)}
                                    >
                                      ↑
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="rounded-none border-black/10 bg-white"
                                      onClick={() => move(idx, idx + 1)}
                                    >
                                      ↓
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="rounded-none border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                                      onClick={() => remove(idx)}
                                    >
                                      <X size={14} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0)
                              handleDropFiles(files);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-none border-black/10"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Subir archivos
                        </Button>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleSave}
                          className="gap-2 rounded-none bg-[var(--color-brand-red)] hover:bg-[#b72d24]"
                        >
                          <Save size={18} /> Guardar cambios
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-none border-black/10"
                          onClick={() => setSelectedSlug(null)}
                        >
                          Cerrar
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="posts">
                <Card className="overflow-hidden rounded-none border-black/10 bg-white p-0 shadow-none">
                  <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-[#fafaf8] px-4 py-3">
                    <div>
                      <div className="font-neutra-demi text-sm uppercase tracking-wide text-[#20211f]">
                        Resumen por post
                      </div>
                      <div className="text-xs text-[#85867f]">
                        Conteo de imágenes destacadas y de galería por post.
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {postsSummary.length} posts
                    </div>
                  </div>

                  {postsSummary.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">
                      No hay posts para mostrar.
                    </div>
                  ) : (
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#fafaf8] text-xs uppercase tracking-wide text-[#85867f]">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium">
                              Post
                            </th>
                            <th className="text-left px-4 py-3 font-medium">
                              Slug
                            </th>
                            <th className="text-right px-4 py-3 font-medium">
                              Total
                            </th>
                            <th className="text-right px-4 py-3 font-medium">
                              Destacada
                            </th>
                            <th className="text-right px-4 py-3 font-medium">
                              Galería
                            </th>
                            <th className="text-right px-4 py-3 font-medium">
                              Carpetas
                            </th>
                            <th className="text-right px-4 py-3 font-medium">
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {postsSummary.map((post) => (
                            <tr
                              key={post.slug}
                              className="border-t border-black/10"
                            >
                              <td className="px-4 py-3 font-medium text-[#20211f]">
                                {post.name}
                              </td>
                              <td className="px-4 py-3 text-[#85867f]">
                                {post.slug}
                              </td>
                              <td className="px-4 py-3 text-right text-[#20211f]">
                                {post.total}
                              </td>
                              <td className="px-4 py-3 text-right text-[#20211f]">
                                {post.featured}
                              </td>
                              <td className="px-4 py-3 text-right text-[#20211f]">
                                {post.gallery}
                              </td>
                              <td className="px-4 py-3 text-right text-[#20211f]">
                                {post.folders}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-none border-black/10"
                                  onClick={() => {
                                    setSelectedSlug(post.slug);
                                    setActiveTab("editor");
                                  }}
                                >
                                  Editar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="folders">
                <Card className="overflow-hidden rounded-none border-black/10 bg-white p-0 shadow-none">
                  <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-[#fafaf8] px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2 font-neutra-demi text-sm uppercase tracking-wide text-[#20211f]">
                        <FolderOpen
                          size={16}
                          className="text-[var(--color-brand-red)]"
                        />
                        Resumen por carpeta
                      </div>
                      <div className="text-xs text-[#85867f]">
                        Agrupación según la carpeta detectada en la URL de cada
                        imagen.
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {folderSummary.length} carpetas
                    </div>
                  </div>

                  {folderSummary.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">
                      No hay carpetas para mostrar.
                    </div>
                  ) : (
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#fafaf8] text-xs uppercase tracking-wide text-[#85867f]">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium">
                              Carpeta
                            </th>
                            <th className="text-right px-4 py-3 font-medium">
                              Total
                            </th>
                            <th className="text-right px-4 py-3 font-medium">
                              URLs únicas
                            </th>
                            <th className="text-right px-4 py-3 font-medium">
                              Posts
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {folderSummary.map((folder) => (
                            <tr
                              key={folder.folder}
                              className="border-t border-black/10"
                            >
                              <td className="break-all px-4 py-3 font-medium text-[#20211f]">
                                {folder.folder}
                              </td>
                              <td className="px-4 py-3 text-right text-[#20211f]">
                                {folder.total}
                              </td>
                              <td className="px-4 py-3 text-right text-[#20211f]">
                                {folder.uniqueImages}
                              </td>
                              <td className="px-4 py-3 text-right text-[#20211f]">
                                {folder.posts}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
