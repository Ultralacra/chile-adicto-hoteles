"use client";

import type React from "react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import AdminRichText from "@/components/admin-rich-text";
import { ArrowLeft, Save, Tag, Globe, Plus, X, Code } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { normalizePost, validatePost } from "@/lib/post-service";
import { Spinner } from "@/components/ui/spinner";

export default function NewPostPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);
  const [categoriesApi, setCategoriesApi] = useState<string[]>([]);

  // Slug
  const [editSlug, setEditSlug] = useState<string>("");
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  // Contacto
  const [website, setWebsite] = useState("");
  const [websiteDisplay, setWebsiteDisplay] = useState("");
  const [instagram, setInstagram] = useState("");
  const [instagramDisplay, setInstagramDisplay] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photosCredit, setPhotosCredit] = useState("");
  const [hours, setHours] = useState("");
  const [reservationLink, setReservationLink] = useState("");
  const [reservationPolicy, setReservationPolicy] = useState("");
  const [interestingFact, setInterestingFact] = useState("");

  // Contenido ES/EN (bloque único por idioma)
  const [nameEs, setNameEs] = useState("");
  const [subtitleEs, setSubtitleEs] = useState("");
  const [descriptionUnified, setDescriptionUnified] = useState<string>("");
  const [nameEn, setNameEn] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [descriptionUnifiedEn, setDescriptionUnifiedEn] = useState<string>(
    ""
  );

  // Categorías y comunas
  const [categories, setCategories] = useState<string[]>(["TODOS"]);
  const possibleCommunes = [
    "Santiago",
    "Providencia",
    "Las Condes",
    "Vitacura",
    "Lo Barnechea",
    "La Reina",
    "Ñuñoa",
    "Recoleta",
    "Independencia",
    "San Miguel",
    "Estación Central",
    "Maipú",
    "La Florida",
    "Puente Alto",
    "Alto Jahuel",
  ];
  const [communes, setCommunes] = useState<string[]>([]);
  const [autoDetectedCommunes, setAutoDetectedCommunes] = useState<string[]>(
    []
  );
  const normalizeComuna = (s: string) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

  // Sucursales / Locations
  type LocationState = {
    label?: string;
    address?: string;
    hours?: string;
    website?: string;
    website_display?: string;
    instagram?: string;
    instagram_display?: string;
    reservationLink?: string;
    reservationPolicy?: string;
    interestingFact?: string;
    email?: string;
    phone?: string;
  };
  const [locations, setLocations] = useState<LocationState[]>([]);

  // Imágenes con destacada y reorden
  const [images, setImages] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredImage, setFeaturedImage] = useState<string>("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const reorderImages = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setImages((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setFeaturedIndex((fi) => {
      if (fi === from) return to;
      if (from < fi && to >= fi) return fi - 1;
      if (from > fi && to <= fi) return fi + 1;
      return fi;
    });
  };
  const removeImage = (index: number) => {
    const arr = images.filter((_, i) => i !== index);
    setImages(arr);
    if (index === featuredIndex) setFeaturedIndex(0);
    else if (index < featuredIndex) setFeaturedIndex(Math.max(0, featuredIndex - 1));
  };

  // Sincronizar featuredImage cuando cambian images/featuredIndex
  useEffect(() => {
    if (images.length === 0) return;
    if (featuredIndex >= 0 && featuredIndex < images.length) {
      setFeaturedImage(images[featuredIndex]);
    }
  }, [featuredIndex, images]);

  // Cargar categorías del API
  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      setLoadingCats(true);
      try {
        const r = await fetch("/api/categories", { cache: "no-store" });
        const c = r.ok ? await r.json() : [];
        if (!cancelled) setCategoriesApi(Array.isArray(c) ? c : []);
      } catch {
        if (!cancelled) setCategoriesApi([]);
      } finally {
        if (!cancelled) setLoadingCats(false);
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-detección de comunas desde campos ingresados
  useEffect(() => {
    const found = new Set<string>();
    const tryAdd = (raw?: string) => {
      if (!raw) return;
      const haystack = normalizeComuna(String(raw));
      for (const pc of possibleCommunes) {
        if (haystack.includes(normalizeComuna(pc))) found.add(pc);
      }
    };
    tryAdd(address);
    (Array.isArray(locations) ? locations : []).forEach((l) => {
      tryAdd(l?.address);
      tryAdd(l?.label);
    });
    // Descripciones como texto plano para heurística simple
    const plainEs = descriptionUnified.replace(/<[^>]+>/g, " ");
    const plainEn = descriptionUnifiedEn.replace(/<[^>]+>/g, " ");
    tryAdd(plainEs);
    tryAdd(plainEn);
    setAutoDetectedCommunes(possibleCommunes.filter((c) => found.has(c)));
  }, [address, locations, descriptionUnified, descriptionUnifiedEn]);

  // Vista previa JSON
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewJson, setPreviewJson] = useState<string>("{}");

  const allCategories = categoriesApi;
  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter((c) => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  const buildPayload = () => {
    // Convertir HTML del editor a array de párrafos
    const htmlToParagraphs = (html: string): string[] => {
      const container = document.createElement("div");
      container.innerHTML = html || "";
      const ps = Array.from(container.querySelectorAll("p"));
      if (ps.length > 0) return ps.map((p) => p.innerHTML.trim()).filter(Boolean);
      const cleaned = container.innerHTML
        .replace(/(?:<br\s*\/?>(\s|&nbsp;)*){2,}/gi, "\n\n")
        .replace(/<br\s*\/?>(\s|&nbsp;)*/gi, "\n")
        .replace(/<[^>]+>/g, "");
      return cleaned.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    };
    const descriptionEs = htmlToParagraphs(String(descriptionUnified));
    const descriptionEn = htmlToParagraphs(String(descriptionUnifiedEn));

    const normalizedFeaturedIdx = Math.min(
      Math.max(0, featuredIndex || 0),
      Math.max(0, images.length - 1)
    );
    const finalFeatured = images[normalizedFeaturedIdx] || featuredImage || "";
    const galleryImages = images.filter(
      (img, i) => img && img !== finalFeatured && i !== normalizedFeaturedIdx
    );

    const sanitizePhone = (p: string) => (p ? `tel:${p.replace(/[^+\d]/g, "")}` : "");
    const sanitizedLocations = (locations || []).map((l) => ({
      label: l.label || undefined,
      address: l.address || undefined,
      hours: l.hours || undefined,
      website: l.website || undefined,
      website_display: l.website_display || undefined,
      instagram: l.instagram || undefined,
      instagram_display: l.instagram_display || undefined,
      reservationLink: l.reservationLink || undefined,
      reservationPolicy: l.reservationPolicy || undefined,
      interestingFact: l.interestingFact || undefined,
      email: l.email || undefined,
      phone: l.phone ? sanitizePhone(l.phone) : "",
    }));

    const updated = {
      slug: editSlug,
      featuredImage: finalFeatured || undefined,
      es: { name: nameEs, subtitle: subtitleEs, description: descriptionEs },
      en: { name: nameEn, subtitle: subtitleEn, description: descriptionEn },
      website,
      website_display: websiteDisplay,
      instagram,
      instagram_display: instagramDisplay,
      email,
      phone: phone ? `tel:${phone.replace(/[^+\d]/g, "")}` : "",
      address,
      photosCredit,
      hours,
      reservationLink,
      reservationPolicy,
      interestingFact,
      images: galleryImages,
      categories,
      locations: sanitizedLocations,
    } as any;

    const normalized = normalizePost(updated);
    const payloadToSend = {
      slug: normalized.slug,
      featuredImage: normalized.featuredImage ?? null,
      es: normalized.es,
      en: normalized.en,
      website: website.trim() === "" ? "" : normalized.website,
      website_display: websiteDisplay.trim() === "" ? "" : websiteDisplay,
      instagram: instagram.trim() === "" ? "" : instagram,
      instagram_display:
        instagramDisplay.trim() === "" ? "" : instagramDisplay,
      email: email.trim() === "" ? "" : normalized.email,
      phone: phone.trim() === "" ? "" : normalized.phone,
      address: address.trim() === "" ? "" : address,
      photosCredit: photosCredit.trim() === "" ? "" : photosCredit,
      hours: hours.trim() === "" ? "" : hours,
      reservationLink:
        reservationLink.trim() === "" ? "" : normalized.reservationLink,
      reservationPolicy:
        reservationPolicy.trim() === "" ? "" : reservationPolicy,
      interestingFact:
        interestingFact.trim() === "" ? "" : interestingFact,
      images: normalized.images,
      categories: normalized.categories,
      locations: normalized.locations,
      communes,
    } as any;
    return { payloadToSend, normalized, finalFeatured };
  };

  const openPreview = () => {
    const built = buildPayload();
    const { payloadToSend } = built;
    try {
      setPreviewJson(JSON.stringify(payloadToSend, null, 2).replace(/\n/g, "\n"));
    } catch {
      setPreviewJson('{' + "\n  \"error\": \"No se pudo serializar\"\n" + '}');
    }
    setPreviewOpen(true);
  };

  const handleCreate = () => {
    if (!editSlug || !slugRegex.test(editSlug)) {
      alert("Slug inválido. Usa minúsculas, números y guiones.");
      return;
    }
    const { payloadToSend, normalized, finalFeatured } = buildPayload();
    const result = validatePost(normalized as any);
    if (!result.ok) {
      const first = result.issues?.[0];
      alert(`Error de validación: ${first?.path || ""} - ${first?.message || ""}`);
      return;
    }
    setCreating(true);
    fetch(`/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadToSend),
    })
      .then(async (r) => {
        if (!r.ok) {
          const msg = await r.text();
          throw new Error(msg || `Error ${r.status}`);
        }
        return r.json();
      })
      .then(async (data) => {
        try {
          const newSlug: string = String(data?.slug || normalized.slug);
          const key = `post:communes:${newSlug}`;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(communes));
          }
          router.replace(`/admin/posts/edit/${encodeURIComponent(newSlug)}`);
        } catch {}
        alert("Post creado correctamente");
      })
      .catch((e) => {
        console.error("Create failed", e);
        alert("No se pudo crear: " + (e?.message || e));
      })
      .finally(() => setCreating(false));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 lg:px-8 py-6 space-y-6">
        {creating && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm grid place-items-center">
            <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
              <Spinner className="size-5" />
              <div className="text-gray-700 font-medium">Creando post…</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Crear post</h1>
            <p className="text-gray-600 mt-1">Completa la información del lugar</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={openPreview}
              className="gap-2"
              disabled={creating}
            >
              <Code size={18} /> Ver JSON
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-green-600 hover:bg-green-700 gap-2 disabled:opacity-60"
              disabled={creating}
            >
              <Save size={20} />
              {creating ? "Creando..." : "Crear post"}
            </Button>
          </div>
        </div>

        {/* Información básica */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="text-green-600" size={20} />
            <h2 className="font-semibold text-lg">Información básica</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Slug</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                  placeholder="mi-super-slug"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const base = (nameEs || nameEn || "").trim();
                    if (!base) return;
                    const s = base
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "");
                    setEditSlug(s);
                  }}
                >
                  Generar
                </Button>
              </div>
              {!slugRegex.test(editSlug || "") && editSlug && (
                <p className="text-xs text-red-600 mt-1">
                  Usa minúsculas, números y guiones. Ej: mi-post-ejemplo
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Categorías</Label>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(["TODOS", ...allCategories])).map((cat) => (
                  <label
                    key={cat}
                    className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                      categories.includes(cat)
                        ? "border-green-600 bg-green-50 text-green-700 font-medium"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={categories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="sr-only"
                    />
                    {cat}
                  </label>
                ))}
              </div>
              {loadingCats && (
                <p className="text-xs text-gray-500 mt-1">Cargando categorías…</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Comunas</Label>
              <div className="flex flex-wrap gap-2">
                {possibleCommunes.map((com) => {
                  const active = communes.includes(com);
                  return (
                    <label
                      key={com}
                      className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                        active
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() =>
                          setCommunes((prev) =>
                            prev.includes(com)
                              ? prev.filter((c) => c !== com)
                              : [...prev, com]
                          )
                        }
                        className="sr-only"
                      />
                      {com}
                    </label>
                  );
                })}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                {autoDetectedCommunes.length > 0 ? (
                  <>
                    <span className="uppercase tracking-wide text-gray-500">Sugeridas:</span>
                    {autoDetectedCommunes.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded bg-gray-100 border text-gray-700">
                        {c}
                      </span>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 ml-1"
                      onClick={() => setCommunes(autoDetectedCommunes)}
                    >
                      Usar sugeridas
                    </Button>
                  </>
                ) : (
                  <span className="text-gray-500">No detectadas automáticamente</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Nota: las comunas aún no se guardan en la base de datos. Se conservan localmente
                y se incluyen en el JSON de vista previa/guardado para futura compatibilidad.
              </p>
            </div>
          </div>
        </Card>

        {/* Contacto */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-green-600" size={20} />
            <h2 className="font-semibold text-lg">Contacto</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-gray-600">WEB</Label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://sitio.cl" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">WEB (display)</Label>
              <Input value={websiteDisplay} onChange={(e) => setWebsiteDisplay(e.target.value)} placeholder="sitio.cl" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">INSTAGRAM</Label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/handle o @handle" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">INSTAGRAM (display)</Label>
              <Input value={instagramDisplay} onChange={(e) => setInstagramDisplay(e.target.value)} placeholder="@handle" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">EMAIL</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@dominio.cl" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">TEL</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 1234 5678" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs text-gray-600">DIRECCIÓN</Label>
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs text-gray-600">CRÉDITO FOTOS</Label>
              <Input value={photosCredit} onChange={(e) => setPhotosCredit(e.target.value)} placeholder="@usuario / Autor" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">HORARIO</Label>
              <Input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="MARTES A SÁBADO, DE 19:30 A 00:00 HRS" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">RESERVAS (link)</Label>
              <Input value={reservationLink} onChange={(e) => setReservationLink(e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">RESERVAS (política)</Label>
              <Input value={reservationPolicy} onChange={(e) => setReservationPolicy(e.target.value)} placeholder="Se recomienda / Obligatorio / etc." />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs text-gray-600">DATO DE INTERÉS</Label>
              <Input value={interestingFact} onChange={(e) => setInterestingFact(e.target.value)} placeholder="Dato llamativo o contextual" />
            </div>
          </div>
        </Card>

        {/* Sucursales / Locations */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-green-600" size={20} />
            <h2 className="font-semibold text-lg">Sucursales / Locations</h2>
          </div>
          <div className="space-y-4">
            {locations.map((loc, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Etiqueta</Label>
                    <Input
                      value={loc.label || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocations((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], label: v };
                          return arr;
                        });
                      }}
                      placeholder="Ej: Vitacura, Sucursal Centro, etc."
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Horario</Label>
                    <Input
                      value={loc.hours || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocations((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], hours: v };
                          return arr;
                        });
                      }}
                      placeholder="LUN-DOM 12:00-22:00"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs text-gray-600">Dirección</Label>
                    <Textarea
                      rows={2}
                      value={loc.address || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocations((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], address: v };
                          return arr;
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Web</Label>
                    <Input
                      value={loc.website || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocations((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], website: v };
                          return arr;
                        });
                      }}
                      placeholder="https://…"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Web (display)</Label>
                    <Input
                      value={loc.website_display || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocations((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], website_display: v };
                          return arr;
                        });
                      }}
                      placeholder="WWW.SITIO.CL"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Instagram</Label>
                    <Input
                      value={loc.instagram || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocations((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], instagram: v };
                          return arr;
                        });
                      }}
                      placeholder="https://instagram.com/… o @handle"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Instagram (display)</Label>
                    <Input
                      value={loc.instagram_display || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocations((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], instagram_display: v };
                          return arr;
                        });
                      }}
                      placeholder="@handle"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Reservas (link)</Label>
                    <Input
                      value={loc.reservationLink || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocations((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], reservationLink: v };
                          return arr;
                        });
                      }}
                      placeholder="https://…"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Reservas (política)</Label>
                    <Input
                      value={loc.reservationPolicy || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocations((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], reservationPolicy: v };
                          return arr;
                        });
                      }}
                      placeholder="Se recomienda / Obligatorio / etc."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs text-gray-600">Dato de interés</Label>
                    <Input
                      value={loc.interestingFact || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocations((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], interestingFact: v };
                          return arr;
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Tel</Label>
                    <Input
                      value={loc.phone || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocations((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], phone: v };
                          return arr;
                        });
                      }}
                      placeholder="+56 9 …"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Email</Label>
                    <Input
                      value={loc.email || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocations((prev) => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], email: v };
                          return arr;
                        });
                      }}
                      placeholder="correo@…"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setLocations((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Eliminar sucursal
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() =>
                setLocations((prev) => [
                  ...prev,
                  {
                    label: "",
                    address: "",
                    hours: "",
                    website: "",
                    website_display: "",
                    instagram: "",
                    instagram_display: "",
                    reservationLink: "",
                    reservationPolicy: "",
                    interestingFact: "",
                    email: "",
                    phone: "",
                  },
                ])
              }
            >
              <Plus size={16} /> Agregar sucursal
            </Button>
          </div>
        </Card>

        {/* Imágenes */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-green-600" size={20} />
            <h2 className="font-semibold text-lg">Imágenes</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Destacada</h3>
              {images[featuredIndex] ? (
                <img
                  src={images[featuredIndex]}
                  alt="Destacada"
                  className="w-full max-w-xl aspect-[16/9] object-cover border rounded"
                />
              ) : (
                <div className="w-full max-w-xl aspect-[16/9] bg-gray-100 border rounded grid place-items-center text-gray-500">
                  Sin imagen
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Galería</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative group border border-transparent rounded"
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverIndex(idx);
                    }}
                    onDrop={() => {
                      if (dragIndex === null || dragIndex === idx) return;
                      reorderImages(dragIndex, idx);
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => {
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }}
                    style={{ cursor: "grab" }}
                  >
                    <img
                      src={src}
                      alt={`img-${idx}`}
                      className={`w-full aspect-[4/3] object-cover border rounded ${
                        dragOverIndex === idx ? "ring-2 ring-green-400" : ""
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute bottom-1 left-1 right-1 flex gap-1 justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" onClick={() => setFeaturedIndex(idx)}>
                        Destacar
                      </Button>
                      <div className="flex gap-1">
                        <Button size="icon" variant="secondary" onClick={() => reorderImages(idx, idx - 1)}>
                          ↑
                        </Button>
                        <Button size="icon" variant="secondary" onClick={() => reorderImages(idx, idx + 1)}>
                          ↓
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => removeImage(idx)}>
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Pega URL de imagen..."
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (e.key === "Enter" && target.value.trim()) {
                    setImages([...images, target.value.trim()]);
                    target.value = "";
                  }
                }}
              />
              <Button
                onClick={() => {
                  const url = prompt("URL de imagen");
                  if (url && url.trim()) setImages([...images, url.trim()]);
                }}
                variant="outline"
              >
                Agregar imagen
              </Button>
            </div>
          </div>
        </Card>

        {/* Contenido ES/EN */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-green-600" size={20} />
            <h2 className="font-semibold text-lg">Contenido</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Español</h3>
              <div>
                <Label className="text-xs text-gray-600">Nombre</Label>
                <Input value={nameEs} onChange={(e) => setNameEs(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Subtítulo</Label>
                <Input value={subtitleEs} onChange={(e) => setSubtitleEs(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Descripción (bloque único)</Label>
                <AdminRichText value={descriptionUnified} onChange={(v) => setDescriptionUnified(v)} />
                <p className="text-[11px] text-gray-500 mt-1">Usa la barra superior para dar formato; Enter crea nuevos párrafos.</p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">English</h3>
              <div>
                <Label className="text-xs text-gray-600">Name</Label>
                <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Subtitle</Label>
                <Input value={subtitleEn} onChange={(e) => setSubtitleEn(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Description (single block)</Label>
                <AdminRichText value={descriptionUnifiedEn} onChange={(v) => setDescriptionUnifiedEn(v)} />
                <p className="text-[11px] text-gray-500 mt-1">Use the toolbar for formatting; Enter creates new paragraphs.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Acciones */}
        <div className="flex gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border">
          <Button
            onClick={handleCreate}
            className="flex-1 bg-green-600 hover:bg-green-700 gap-2 disabled:opacity-60"
            disabled={creating}
          >
            <Save size={20} />
            {creating ? "Creando..." : "Crear post"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/posts")}>Cancelar</Button>
        </div>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Vista previa JSON (sin enviar)</DialogTitle>
              <DialogDescription>
                Esta es la estructura exacta que se enviará al crear.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md border bg-gray-50 p-2 max-h-[60vh] overflow-auto text-xs font-mono">
              <pre className="whitespace-pre-wrap break-words">{previewJson}</pre>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(previewJson).catch(() => {});
                }}
                className="gap-2"
              >
                Copiar JSON
              </Button>
              <Button onClick={() => setPreviewOpen(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
 
