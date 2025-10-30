"use client";

import data from "@/lib/data.json";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import AdminRichText from "@/components/admin-rich-text";
import { ArrowLeft, Save, Tag, Globe, Plus, X } from "lucide-react";
import { normalizePost, validatePost } from "@/lib/post-service";

export default function EditPostPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { slug } = params;
  const hotel = (data as any[]).find((p) => p.slug === slug);

  if (!hotel) {
    notFound();
  }

  // Local editable state (pre-filled)
  const [nameEs, setNameEs] = useState(hotel?.es?.name || "");
  const [subtitleEs, setSubtitleEs] = useState(hotel?.es?.subtitle || "");
  // Descripción: un solo bloque (párrafos separados por línea en blanco)
  const [descriptionUnified, setDescriptionUnified] = useState<string>(
    (hotel?.es?.description || []).join("\n\n")
  );
  const [infoHtmlEs, setInfoHtmlEs] = useState<string>(
    hotel?.es?.infoHtml || ""
  );
  const [rawPasteEs, setRawPasteEs] = useState<string>("");

  // Inglés
  const [nameEn, setNameEn] = useState(hotel?.en?.name || "");
  const [subtitleEn, setSubtitleEn] = useState(hotel?.en?.subtitle || "");
  const [descriptionUnifiedEn, setDescriptionUnifiedEn] = useState<string>(
    (hotel?.en?.description || []).join("\n\n")
  );
  const [infoHtmlEn, setInfoHtmlEn] = useState<string>(
    hotel?.en?.infoHtml || ""
  );
  const [rawPasteEn, setRawPasteEn] = useState<string>("");

  // Contacto editable
  const [website, setWebsite] = useState(hotel?.website || "");
  const [websiteDisplay, setWebsiteDisplay] = useState(
    hotel?.website_display || ""
  );
  const [instagram, setInstagram] = useState(hotel?.instagram || "");
  const [instagramDisplay, setInstagramDisplay] = useState(
    hotel?.instagram_display || ""
  );
  const [email, setEmail] = useState(hotel?.email || "");
  const [phone, setPhone] = useState(
    String(hotel?.phone || "").replace(/^tel:/i, "")
  );
  const [address, setAddress] = useState(hotel?.address || "");
  const [photosCredit, setPhotosCredit] = useState(hotel?.photosCredit || "");

  // Imágenes: mantener arreglo y featured index
  const initialImages: string[] = Array.isArray(hotel?.images)
    ? hotel.images
    : [];
  const [images, setImages] = useState<string[]>(initialImages);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const moveImage = moveImageFactory(images, setImages);
  const removeImage = removeImageFactory(images, setImages);
  const [categories, setCategories] = useState<string[]>(
    hotel?.categories || ["TODOS"]
  );

  // Derivar todas las categorías disponibles de data.json
  const allCategories = Array.from(
    new Set(
      (data as any[]).flatMap((h: any) => [
        ...(h.categories || []),
        h.es?.category || null,
        h.en?.category || null,
      ])
    )
  )
    .filter(Boolean)
    .map((c) => String(c).toUpperCase())
    .sort();

  const handleSave = () => {
    // Extraer solo la parte de contenido (antes del separador ---) y convertir a array de párrafos
    const descriptionEs = String(descriptionUnified)
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    const descriptionEn = String(descriptionUnifiedEn)
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    // Ensamblar imágenes poniendo la destacada al inicio
    const normalizedFeatured = Math.min(
      Math.max(0, featuredIndex || 0),
      Math.max(0, images.length - 1)
    );
    const orderedImages = images.length
      ? [
          images[normalizedFeatured],
          ...images.filter((_, i) => i !== normalizedFeatured),
        ]
      : [];

    const updated = {
      slug: hotel.slug,
      es: {
        name: nameEs,
        subtitle: subtitleEs,
        description: descriptionEs,
        infoHtml: infoHtmlEs || undefined,
      },
      en: {
        name: nameEn,
        subtitle: subtitleEn,
        description: descriptionEn,
        infoHtml: infoHtmlEn || undefined,
      },
      website,
      website_display: websiteDisplay,
      instagram,
      instagram_display: instagramDisplay,
      email,
      phone: phone ? `tel:${phone.replace(/[^+\d]/g, "")}` : "",
      address,
      photosCredit,
      images: orderedImages,
      categories,
    };
    const normalized = normalizePost(updated as any);
    const result = validatePost(normalized as any);
    if (!result.ok) {
      const first = result.issues?.[0];
      alert(
        `Error de validación: ${first?.path || ""} - ${first?.message || ""}`
      );
      return;
    }
    console.log("Updated post:", JSON.stringify(normalized, null, 2));
    alert("Cambios guardados! Revisa la consola para ver el JSON actualizado.");
  };

  // --- Pegado inteligente (idéntico a Nuevo) ---
  function autoFillFromPaste(lang: "es" | "en", raw: string) {
    if (!raw || !raw.trim()) return;
    const blocks = String(raw)
      .replace(/\r\n/g, "\n")
      .replace(/\u00A0/g, " ")
      .trim()
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter(Boolean);

    const labelMap =
      lang === "es"
        ? {
            direccion: /^(direcci[oó]n|ubicaci[oó]n)\s*[:\-]?/i,
            web: /^(web|website|sitio)\s*[:\-]?/i,
            instagram: /^(instagram)\s*[:\-]?/i,
            horario: /^(horario|apertura|cierre)\s*[:\-]?/i,
            reservas: /^(reservas?)\s*[:\-]?/i,
            dato: /^(dato\s+de\s+inter[eé]s)\s*[:\-]?/i,
            tel: /^(tel[eé]fono|tel)\s*[:\-]?/i,
            email: /^(email|mail|correo)\s*[:\-]?/i,
            fotos: /^(fotos|fotograf[ií]as)\s*[:\-]?/i,
          }
        : {
            direccion: /^(address|location)\s*[:\-]?/i,
            web: /^(web|website|site)\s*[:\-]?/i,
            instagram: /^(instagram)\s*[:\-]?/i,
            horario: /^(hours?)\s*[:\-]?/i,
            reservas: /^(reservations?)\s*[:\-]?/i,
            dato: /^(interesting\s+fact)\s*[:\-]?/i,
            tel: /^(tel|phone)\s*[:\-]?/i,
            email: /^(email|mail)\s*[:\-]?/i,
            fotos: /^(photos?)\s*[:\-]?/i,
          };

    const found: Partial<Record<keyof typeof labelMap, string>> = {};
    const remaining: string[] = [];
    for (const b of blocks) {
      const line = b.split("\n")[0];
      let matchedKey: keyof typeof labelMap | undefined;
      for (const key of Object.keys(labelMap) as Array<keyof typeof labelMap>) {
        if (labelMap[key].test(line)) {
          matchedKey = key;
          break;
        }
      }
      if (matchedKey) {
        const value = b.replace(labelMap[matchedKey], "").trim();
        if (value) found[matchedKey] = value;
      } else {
        remaining.push(b);
      }
    }
    const fmtLink = (val: string) => {
      const v = val.trim();
      if (/^https?:\/\//i.test(v))
        return `<a href="${v}" target="_blank" rel="noopener noreferrer">${v.replace(
          /^https?:\/\//i,
          ""
        )}</a>`;
      if (/^@/.test(v))
        return `<a href="https://www.instagram.com/${v.replace(
          /^@/,
          ""
        )}" target="_blank" rel="noopener noreferrer">${v}</a>`;
      if (/^[\w.-]+\.[a-z]{2,}$/i.test(v))
        return `<a href="https://${v}" target="_blank" rel="noopener noreferrer">${v}</a>`;
      return v;
    };
    function buildInfoHtmlES() {
      const parts: string[] = [];
      if (found.direccion)
        parts.push(`<p><strong>Dirección:</strong> ${found.direccion}</p>`);
      if (found.web)
        parts.push(`<p><strong>Web:</strong> ${fmtLink(found.web)}</p>`);
      if (found.instagram)
        parts.push(
          `<p><strong>Instagram:</strong> ${fmtLink(found.instagram)}</p>`
        );
      if (found.horario)
        parts.push(`<p><strong>Horario:</strong> ${found.horario}</p>`);
      if (found.reservas)
        parts.push(
          `<p><strong>Reservas:</strong> ${fmtLink(found.reservas)}</p>`
        );
      if (found.dato)
        parts.push(`<p><strong>Dato de interés:</strong> ${found.dato}</p>`);
      if (found.tel) parts.push(`<p><strong>Tel:</strong> ${found.tel}</p>`);
      if (found.email)
        parts.push(`<p><strong>Email:</strong> ${found.email}</p>`);
      if (found.fotos)
        parts.push(`<p><strong>Fotos:</strong> ${found.fotos}</p>`);
      return parts.join("\n");
    }
    function buildInfoHtmlEN() {
      const parts: string[] = [];
      if (found.direccion)
        parts.push(`<p><strong>Address:</strong> ${found.direccion}</p>`);
      if (found.web)
        parts.push(`<p><strong>Web:</strong> ${fmtLink(found.web)}</p>`);
      if (found.instagram)
        parts.push(
          `<p><strong>Instagram:</strong> ${fmtLink(found.instagram)}</p>`
        );
      if (found.horario)
        parts.push(`<p><strong>Hours:</strong> ${found.horario}</p>`);
      if (found.reservas)
        parts.push(
          `<p><strong>Reservations:</strong> ${fmtLink(found.reservas)}</p>`
        );
      if (found.dato)
        parts.push(`<p><strong>Interesting fact:</strong> ${found.dato}</p>`);
      if (found.tel) parts.push(`<p><strong>Tel:</strong> ${found.tel}</p>`);
      if (found.email)
        parts.push(`<p><strong>Email:</strong> ${found.email}</p>`);
      if (found.fotos)
        parts.push(`<p><strong>Photos:</strong> ${found.fotos}</p>`);
      return parts.join("\n");
    }
    if (lang === "es") {
      setDescriptionUnified(remaining.join("\n\n"));
      setInfoHtmlEs(buildInfoHtmlES());
    } else {
      setDescriptionUnifiedEn(remaining.join("\n\n"));
      setInfoHtmlEn(buildInfoHtmlEN());
    }
  }

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
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Editar post</h1>
            <p className="text-gray-600 mt-1">{hotel.es.name}</p>
          </div>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Save size={20} />
            Guardar cambios
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
                {["TODOS", ...allCategories].map((cat) => (
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
                  <div key={idx} className="relative group">
                    <img
                      src={src}
                      alt={`img-${idx}`}
                      className="w-full aspect-[4/3] object-cover border rounded"
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
                          onClick={() => moveImage(idx, -1)}
                        >
                          ↑
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => moveImage(idx, 1)}
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
                  Separa párrafos con una línea en blanco.
                </p>
              </div>

              {/* Pegado inteligente ES */}
              <div className="p-3 border rounded bg-gray-50">
                <Label className="text-xs text-gray-600 mb-1 block">
                  Pegado inteligente (ES)
                </Label>
                <Textarea
                  rows={5}
                  value={rawPasteEs}
                  onChange={(e) => setRawPasteEs(e.target.value)}
                  placeholder="Pega aquí…"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => autoFillFromPaste("es", rawPasteEs)}
                  >
                    Formatear y repartir
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRawPasteEs("")}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              {/* Datos útiles HTML ES */}
              <div>
                <Label className="text-xs text-gray-600">
                  Datos útiles (HTML)
                </Label>
                <AdminRichText value={infoHtmlEs} onChange={setInfoHtmlEs} />
                <p className="text-[11px] text-gray-500 mt-1">
                  Si existe, reemplaza el bloque estructurado en la vista.
                </p>
              </div>
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
                  Separate paragraphs with a blank line.
                </p>
              </div>

              {/* Smart paste EN */}
              <div className="p-3 border rounded bg-gray-50">
                <Label className="text-xs text-gray-600 mb-1 block">
                  Smart paste (EN)
                </Label>
                <Textarea
                  rows={5}
                  value={rawPasteEn}
                  onChange={(e) => setRawPasteEn(e.target.value)}
                  placeholder="Paste here…"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => autoFillFromPaste("en", rawPasteEn)}
                  >
                    Format & fill
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRawPasteEn("")}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Useful info HTML EN */}
              <div>
                <Label className="text-xs text-gray-600">
                  Useful information (HTML)
                </Label>
                <AdminRichText value={infoHtmlEn} onChange={setInfoHtmlEn} />
                <p className="text-[11px] text-gray-500 mt-1">
                  If present, it replaces the structured block in the detail
                  view.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border">
          <Button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
          >
            <Save size={20} />
            Guardar cambios
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

function removeImageFactory(
  images: string[],
  setImages: (imgs: string[]) => void
): (index: number) => void {
  return (index: number) => {
    const arr = images.filter((_, i) => i !== index);
    setImages(arr);
  };
}
