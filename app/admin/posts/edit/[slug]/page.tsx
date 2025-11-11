"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import AdminRichText from "@/components/admin-rich-text";
import { ArrowLeft, Save, Tag, Globe, Plus, X } from "lucide-react";
import { normalizePost, validatePost } from "@/lib/post-service";
import { Spinner } from "@/components/ui/spinner";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hotel, setHotel] = useState<any | null>(null);
  const [categoriesApi, setCategoriesApi] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`/api/posts/${encodeURIComponent(slug)}`, {
            cache: "no-store",
          }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);
        const p = pRes.ok ? await pRes.json() : null;
        const c = cRes.ok ? await cRes.json() : [];
        // Debug: imprimir lo cargado
        console.log("[Admin Edit] GET post", p);
        console.log("[Admin Edit] GET categories", c);
        if (!cancelled) {
          setHotel(p && p.slug ? p : null);
          setCategoriesApi(Array.isArray(c) ? c : []);
        }
      } catch (e) {
        if (!cancelled) {
          setHotel(null);
          setCategoriesApi([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Local editable state (pre-filled)
  const [nameEs, setNameEs] = useState("");
  const [subtitleEs, setSubtitleEs] = useState("");
  // Descripción: un solo bloque (párrafos separados por línea en blanco)
  const [descriptionUnified, setDescriptionUnified] = useState<string>("");

  // Inglés
  const [nameEn, setNameEn] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [descriptionUnifiedEn, setDescriptionUnifiedEn] = useState<string>("");

  // Contacto editable
  const [website, setWebsite] = useState("");
  const [websiteDisplay, setWebsiteDisplay] = useState("");
  const [instagram, setInstagram] = useState("");
  const [instagramDisplay, setInstagramDisplay] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photosCredit, setPhotosCredit] = useState("");
  // Operación / reservas
  const [hours, setHours] = useState("");
  const [reservationLink, setReservationLink] = useState("");
  const [reservationPolicy, setReservationPolicy] = useState("");
  const [interestingFact, setInterestingFact] = useState("");

  // Imágenes: mantener arreglo y featured index + featuredImage persistente
  const [images, setImages] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredImage, setFeaturedImage] = useState<string>("");
  const moveImage = moveImageFactory(images, setImages);
  // Estados para drag & drop de la galería
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
    // Ajustar featuredIndex si corresponde
    setFeaturedIndex((fi) => {
      if (fi === from) return to; // la destacada se movió
      if (from < fi && to >= fi) return fi - 1; // elemento antes de featured se movió detrás
      if (from > fi && to <= fi) return fi + 1; // elemento después de featured se movió delante
      return fi;
    });
  };
  const removeImage = (index: number) => {
    const arr = images.filter((_, i) => i !== index);
    setImages(arr);
    if (index === featuredIndex) {
      setFeaturedIndex(0);
    } else if (index < featuredIndex) {
      setFeaturedIndex(Math.max(0, featuredIndex - 1));
    }
  };
  const [categories, setCategories] = useState<string[]>(["TODOS"]);
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
    phone?: string; // input sin "tel:"; lo formateamos al guardar
  };
  const [locations, setLocations] = useState<LocationState[]>([]);

  // Cargar datos del hotel en los estados locales cuando llegue
  useEffect(() => {
    if (!hotel) return;
    // Helpers para convertir entre array de párrafos y HTML para el editor
    const paragraphsToHtml = (arr: string[] | undefined) => {
      if (!Array.isArray(arr) || arr.length === 0) return "";
      return arr
        .map((p) => `<p>${p}</p>`) // permitimos HTML dentro del párrafo
        .join("\n");
    };
    setNameEs(hotel.es?.name || "");
    setSubtitleEs(hotel.es?.subtitle || "");
    setDescriptionUnified(paragraphsToHtml(hotel.es?.description));
    // infoHtml removido del editor

    setNameEn(hotel.en?.name || "");
    setSubtitleEn(hotel.en?.subtitle || "");
    setDescriptionUnifiedEn(paragraphsToHtml(hotel.en?.description));
    // infoHtml removido del editor

    setWebsite(hotel.website || "");
    setWebsiteDisplay(hotel.website_display || "");
    setInstagram(hotel.instagram || "");
    setInstagramDisplay(hotel.instagram_display || "");
    setEmail(hotel.email || "");
    setPhone(String(hotel.phone || "").replace(/^tel:/i, ""));
    setAddress(hotel.address || "");
    setPhotosCredit(hotel.photosCredit || "");
    setHours(hotel.hours || "");
    setReservationLink(hotel.reservationLink || "");
    setReservationPolicy(hotel.reservationPolicy || "");
    setInterestingFact(hotel.interestingFact || "");

    let initialImgs: string[] = Array.isArray(hotel.images)
      ? hotel.images.slice()
      : [];
    // Incluir la featuredImage en la lista local si no está (para poder volver a seleccionarla).
    if (hotel.featuredImage && !initialImgs.includes(hotel.featuredImage)) {
      initialImgs = [hotel.featuredImage, ...initialImgs];
    }
    setImages(initialImgs);
    // Marcar índice de la featured si existe
    const idx = hotel.featuredImage
      ? initialImgs.indexOf(hotel.featuredImage)
      : -1;
    setFeaturedIndex(idx >= 0 ? idx : 0);
    setFeaturedImage(hotel.featuredImage || initialImgs[0] || "");
    setCategories(
      Array.isArray(hotel.categories) && hotel.categories.length
        ? hotel.categories.map((c: any) => String(c).toUpperCase())
        : ["TODOS"]
    );
    // locations existentes
    const locs = Array.isArray(hotel.locations) ? hotel.locations : [];
    setLocations(
      locs.map((l: any) => ({
        label: l?.label || "",
        address: l?.address || "",
        hours: l?.hours || "",
        website: l?.website || "",
        website_display: l?.website_display || "",
        instagram: l?.instagram || "",
        instagram_display: l?.instagram_display || "",
        reservationLink: l?.reservationLink || "",
        reservationPolicy: l?.reservationPolicy || "",
        interestingFact: l?.interestingFact || "",
        email: l?.email || "",
        phone: String(l?.phone || "").replace(/^tel:/i, ""),
      }))
    );
  }, [hotel]);

  const allCategories = categoriesApi;

  // Mantener sincronizado featuredImage cuando cambia featuredIndex o images
  useEffect(() => {
    if (images.length === 0) return;
    if (featuredIndex >= 0 && featuredIndex < images.length) {
      setFeaturedImage(images[featuredIndex]);
    }
  }, [featuredIndex, images]);

  const handleSave = () => {
    if (!hotel) {
      alert("No hay post cargado para guardar");
      return;
    }
    // Convertir HTML del editor a array de párrafos (HTML permitido por párrafo)
    const htmlToParagraphs = (html: string): string[] => {
      const container = document.createElement("div");
      container.innerHTML = html || "";
      const ps = Array.from(container.querySelectorAll("p"));
      if (ps.length > 0) {
        return ps.map((p) => p.innerHTML.trim()).filter(Boolean);
      }
      // Fallback: dividir por saltos dobles de línea o <br><br>
      const cleaned = container.innerHTML
        .replace(/(?:<br\s*\/?>(\s|&nbsp;)*){2,}/gi, "\n\n")
        .replace(/<br\s*\/?>(\s|&nbsp;)*/gi, "\n")
        .replace(/<[^>]+>/g, "");
      return cleaned
        .split(/\n{2,}/)
        .map((s) => s.trim())
        .filter(Boolean);
    };
    const descriptionEs = htmlToParagraphs(String(descriptionUnified));
    const descriptionEn = htmlToParagraphs(String(descriptionUnifiedEn));
    // Determinar featured final; si no hay imágenes mantener la previa
    const normalizedFeaturedIdx = Math.min(
      Math.max(0, featuredIndex || 0),
      Math.max(0, images.length - 1)
    );
    const finalFeatured = images[normalizedFeaturedIdx] || featuredImage || "";
    // Galería SIN la destacada (para no duplicarla en post_images)
    const galleryImages = images.filter(
      (img, i) => img && img !== finalFeatured && i !== normalizedFeaturedIdx
    );

    const sanitizePhone = (p: string) =>
      p ? `tel:${p.replace(/[^+\d]/g, "")}` : "";
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
      slug: hotel?.slug || slug,
      featuredImage: finalFeatured || undefined,
      es: {
        name: nameEs,
        subtitle: subtitleEs,
        description: descriptionEs,
      },
      en: {
        name: nameEn,
        subtitle: subtitleEn,
        description: descriptionEn,
      },
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
    };
    const normalized = normalizePost(updated as any);
    // Enviar exactamente las claves top-level que el backend espera para considerar campos "provided".
    // Si el usuario deja vacío => enviar null para limpiar en DB.
    const payloadToSend = {
      slug: normalized.slug,
      featuredImage: normalized.featuredImage ?? null,
      es: normalized.es,
      en: normalized.en,
      // Enviar cadenas vacías en lugar de null para pasar validación Zod en el API.
      // La normalización del API convierte "" de URLs a undefined y luego se guarda como NULL en DB.
      website: website.trim() === "" ? "" : normalized.website,
      website_display: websiteDisplay.trim() === "" ? "" : websiteDisplay,
      instagram: instagram.trim() === "" ? "" : instagram,
      instagram_display: instagramDisplay.trim() === "" ? "" : instagramDisplay,
      email: email.trim() === "" ? "" : normalized.email,
      phone: phone.trim() === "" ? "" : normalized.phone,
      address: address.trim() === "" ? "" : address,
      photosCredit: photosCredit.trim() === "" ? "" : photosCredit,
      hours: hours.trim() === "" ? "" : hours,
      reservationLink:
        reservationLink.trim() === "" ? "" : normalized.reservationLink,
      reservationPolicy:
        reservationPolicy.trim() === "" ? "" : reservationPolicy,
      interestingFact: interestingFact.trim() === "" ? "" : interestingFact,
      images: normalized.images, // galería sin destacada
      categories: normalized.categories,
      locations: normalized.locations,
    } as any;
    console.log("[Admin Edit] PUT payloadToSend", payloadToSend);
    const result = validatePost(normalized as any);
    if (!result.ok) {
      const first = result.issues?.[0];
      alert(
        `Error de validación: ${first?.path || ""} - ${first?.message || ""}`
      );
      return;
    }
    setSaving(true);
    fetch(`/api/posts/${encodeURIComponent(slug)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadToSend),
    })
      .then(async (r) => {
        if (!r.ok) {
          const msg = await r.text();
          throw new Error(msg || `Error ${r.status}`);
        }
        const data = await r.json();
        console.log("[Admin Edit] PUT response", data);
        // Actualizar estado local de imágenes si cambió
        if (Array.isArray(normalized.images)) {
          // Después de guardar, reconstruir lista local combinando featured + galería
          const nextFeatured = normalized.featuredImage || finalFeatured;
          const nextGallery = normalized.images.filter(
            (img: string) => img !== nextFeatured
          );
          const rebuilt = nextFeatured
            ? [nextFeatured, ...nextGallery]
            : nextGallery;
          setImages(rebuilt);
          setFeaturedImage(nextFeatured || "");
          setFeaturedIndex(0);
        }
        return data;
      })
      .then(async () => {
        // Refrescar el post desde el servidor para actualizar el estado local y la UI
        try {
          const resp = await fetch(`/api/posts/${encodeURIComponent(slug)}`, {
            cache: "no-store",
          });
          if (resp.ok) {
            const fresh = await resp.json();
            console.log("[Admin Edit] Refreshed post after save", fresh);
            setHotel(fresh && fresh.slug ? fresh : null);
          }
        } catch (e) {
          console.warn("No se pudo refrescar post después de guardar", e);
        }
        alert("Cambios guardados correctamente");
      })
      .catch((e) => {
        console.error("Update failed", e);
        alert("No se pudo guardar: " + (e?.message || e));
      })
      .finally(() => {
        setSaving(false);
      });
  };

  // Pegado inteligente e infoHtml han sido eliminados del editor.

  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter((c) => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 lg:px-8 py-6 space-y-6">
        {saving && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm grid place-items-center">
            <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
              <Spinner className="size-5" />
              <div className="text-gray-700 font-medium">
                Guardando cambios…
              </div>
            </div>
          </div>
        )}
        {loading ? (
          <div className="w-full p-6 bg-white rounded-lg shadow flex items-center gap-2 text-gray-600">
            <Spinner className="size-4" /> Cargando post…
          </div>
        ) : !hotel ? (
          <div className="w-full p-6 bg-white rounded-lg shadow text-gray-700">
            No se encontró el post "{slug}".{" "}
            <button
              className="text-red-600 underline"
              onClick={() => router.push("/admin/posts")}
            >
              Volver a la lista
            </button>
          </div>
        ) : null}
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Editar post</h1>
            <p className="text-gray-600 mt-1">
              {hotel?.es?.name || hotel?.en?.name || slug}
            </p>
          </div>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 gap-2 disabled:opacity-60"
            disabled={saving}
          >
            <Save size={20} />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>

        {/* Basic Info */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="text-green-600" size={20} />
            <h2 className="font-semibold text-lg">Información básica</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Categorías <span className="text-red-600">*</span>
              </Label>
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
            </div>
          </div>
        </Card>

        {/* Contacto editable */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-green-600" size={20} />
            <h2 className="font-semibold text-lg">Contacto</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-gray-600">WEB</Label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://sitio.cl"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">WEB (display)</Label>
              <Input
                value={websiteDisplay}
                onChange={(e) => setWebsiteDisplay(e.target.value)}
                placeholder="sitio.cl"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">INSTAGRAM</Label>
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/handle o @handle"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">
                INSTAGRAM (display)
              </Label>
              <Input
                value={instagramDisplay}
                onChange={(e) => setInstagramDisplay(e.target.value)}
                placeholder="@handle"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">EMAIL</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@dominio.cl"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">TEL</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+56 9 1234 5678"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs text-gray-600">DIRECCIÓN</Label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs text-gray-600">CRÉDITO FOTOS</Label>
              <Input
                value={photosCredit}
                onChange={(e) => setPhotosCredit(e.target.value)}
                placeholder="@usuario / Autor"
              />
            </div>
            {/* Campos operativos a nivel general (cuando no hay sucursales) */}
            <div>
              <Label className="text-xs text-gray-600">HORARIO</Label>
              <Input
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="MARTES A SÁBADO, DE 19:30 A 00:00 HRS"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">RESERVAS (link)</Label>
              <Input
                value={reservationLink}
                onChange={(e) => setReservationLink(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">
                RESERVAS (política)
              </Label>
              <Input
                value={reservationPolicy}
                onChange={(e) => setReservationPolicy(e.target.value)}
                placeholder="Se recomienda / Obligatorio / etc."
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs text-gray-600">DATO DE INTERÉS</Label>
              <Input
                value={interestingFact}
                onChange={(e) => setInterestingFact(e.target.value)}
                placeholder="Dato llamativo o contextual"
              />
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
                    <Label className="text-xs text-gray-600">
                      Web (display)
                    </Label>
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
                    <Label className="text-xs text-gray-600">
                      Instagram (display)
                    </Label>
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
                    <Label className="text-xs text-gray-600">
                      Reservas (link)
                    </Label>
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
                    <Label className="text-xs text-gray-600">
                      Reservas (política)
                    </Label>
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
                    <Label className="text-xs text-gray-600">
                      Dato de interés
                    </Label>
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
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setLocations((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    Eliminar sucursal
                  </Button>
                </div>
              </div>
            ))}
            <Button
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

        {/* Imágenes: destacada + galería */}
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
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setFeaturedIndex(idx)}
                      >
                        Destacar
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => reorderImages(idx, idx - 1)}
                        >
                          ↑
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => reorderImages(idx, idx + 1)}
                        >
                          ↓
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => removeImage(idx)}
                        >
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

        {/* Contenido ES/EN (bloque único por idioma) */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-green-600" size={20} />
            <h2 className="font-semibold text-lg">Contenido</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Español */}
            <div className="space-y-3">
              <h3 className="font-semibold">Español</h3>
              <div>
                <Label className="text-xs text-gray-600">Nombre</Label>
                <Input
                  value={nameEs}
                  onChange={(e) => setNameEs(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Subtítulo</Label>
                <Input
                  value={subtitleEs}
                  onChange={(e) => setSubtitleEs(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">
                  Descripción (bloque único)
                </Label>
                <AdminRichText
                  value={descriptionUnified}
                  onChange={(v) => setDescriptionUnified(v)}
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Usa la barra superior para dar formato; Enter crea nuevos
                  párrafos.
                </p>
              </div>

              {/* Secciones eliminadas: pegado inteligente + datos útiles HTML */}
            </div>

            {/* English */}
            <div className="space-y-3">
              <h3 className="font-semibold">English</h3>
              <div>
                <Label className="text-xs text-gray-600">Name</Label>
                <Input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Subtitle</Label>
                <Input
                  value={subtitleEn}
                  onChange={(e) => setSubtitleEn(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">
                  Description (single block)
                </Label>
                <AdminRichText
                  value={descriptionUnifiedEn}
                  onChange={(v) => setDescriptionUnifiedEn(v)}
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Use the toolbar for formatting; Enter creates new paragraphs.
                </p>
              </div>

              {/* Secciones eliminadas: smart paste + useful info HTML */}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border">
          <Button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 gap-2 disabled:opacity-60"
            disabled={saving}
          >
            <Save size={20} />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/posts")}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helpers para galería
function moveImageFactory(
  images: string[],
  setImages: (imgs: string[]) => void
): (index: number, dir: -1 | 1) => void {
  return (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= images.length) return;
    const arr = [...images];
    const [item] = arr.splice(index, 1);
    arr.splice(newIndex, 0, item);
    setImages(arr);
  };
}

// removeImageFactory ya no se usa; la lógica de eliminación ajusta featuredIndex in-line
