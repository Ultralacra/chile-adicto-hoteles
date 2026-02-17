import type { PostInput } from "@/lib/post-schema";

// Normaliza ciertos campos (teléfono, email, trimming, imágenes, urls)
export function normalizePost(input: PostInput): PostInput {
  const fixUrl = (u?: string) => {
    if (!u) return undefined;
    const v = String(u).trim();
    if (!v) return undefined;
    if (/^https?:\/\//i.test(v)) return v;
    // dominios simples tipo sitio.cl o sub.sitio.cl/ruta
    if (/^[\w.-]+\.[a-z]{2,}(?:[\/:].*)?$/i.test(v)) return `https://${v}`;
    return v; // dejar como está y que el schema decida
  };
  const normPhone = ((): string | undefined => {
    const raw = (input as any)?.phone;
    if (raw === undefined || raw === null) return undefined;
    const s = String(raw).trim();
    if (!s) return undefined; // tratamos cadena vacía como undefined
    return `tel:${s.replace(/^tel:/i, "").replace(/[^+\d]/g, "")}`;
  })();
  const normEmail = ((): string | undefined => {
    const raw = (input as any)?.email;
    if (raw === undefined || raw === null) return undefined;
    const s = String(raw).trim();
    if (!s) return undefined;
    return s;
  })();
  const imagesIn = Array.isArray((input as any).images) ? (input as any).images : [];
  const uniqueImages = Array.from(new Set(imagesIn.map((s: any) => String(s).trim()).filter(Boolean)));

  const esIn: any = (input as any).es || {};
  const enIn: any = (input as any).en || {};
  const esDesc = Array.isArray(esIn.description) ? esIn.description : [];
  const enDesc = Array.isArray(enIn.description) ? enIn.description : [];
  const catsIn = Array.isArray((input as any).categories) ? (input as any).categories : [];
  const locsIn = Array.isArray((input as any).locations) ? (input as any).locations : [];
  const rawPublicationStatus = String((input as any)?.publicationStatus || "").trim().toLowerCase();
  const normalizedPublicationStatus =
    rawPublicationStatus === "unpublished" ? "unpublished" : rawPublicationStatus === "published" ? "published" : undefined;
  const normalizeDate = (value: unknown): string | undefined => {
    if (value === undefined || value === null) return undefined;
    const raw = String(value).trim();
    if (!raw) return undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    // datetime-local (sin zona): asumimos zona local del cliente y serializamos a ISO UTC
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) {
      const dt = new Date(raw);
      if (!Number.isNaN(dt.getTime())) return dt.toISOString();
      return raw;
    }

    // ISO / datetime con zona
    const dt = new Date(raw);
    if (!Number.isNaN(dt.getTime())) return dt.toISOString();
    return raw;
  };
  const publishStartAt = normalizeDate((input as any)?.publishStartAt);
  const publishEndAt = normalizeDate((input as any)?.publishEndAt);

  const normalizedLocs = locsIn.map((loc: any) => {
    const website = fixUrl(loc.website);
    const reservationLink = fixUrl(loc.reservationLink);
    // Normalizar teléfono en locations igual que arriba
    let phone: string | undefined;
    if (loc.phone !== undefined && loc.phone !== null) {
      const s = String(loc.phone).trim();
      if (s) phone = `tel:${s.replace(/^tel:/i, "").replace(/[^+\d]/g, "")}`;
    }
    return {
      ...loc,
      label: loc.label ? String(loc.label).trim() : undefined,
      address: loc.address ? String(loc.address).trim() : undefined,
      hours: loc.hours ? String(loc.hours).trim() : undefined,
      website,
      website_display: loc.website_display ? String(loc.website_display).trim() : undefined,
      instagram: loc.instagram ? String(loc.instagram).trim() : undefined,
      instagram_display: loc.instagram_display ? String(loc.instagram_display).trim() : undefined,
      reservationLink,
      reservationPolicy: loc.reservationPolicy ? String(loc.reservationPolicy).trim() : undefined,
      interestingFact: loc.interestingFact ? String(loc.interestingFact).trim() : undefined,
      email: loc.email ? String(loc.email).trim() : undefined,
      phone,
    };
  });

  return {
    ...input,
    email: normEmail,
    phone: normPhone,
    website: fixUrl((input as any).website),
    reservationLink: fixUrl((input as any).reservationLink),
    publicationStatus: normalizedPublicationStatus,
    publishStartAt,
    publishEndAt,
    images: uniqueImages,
    slug: String(input.slug).trim(),
    es: {
      ...esIn,
      name: String(esIn.name ?? "").trim(),
      subtitle: String(esIn.subtitle ?? "").trim(),
      description: esDesc.map((p: any) => String(p).trim()).filter(Boolean),
    },
    en: {
      ...enIn,
      name: String(enIn.name ?? "").trim(),
      subtitle: String(enIn.subtitle ?? "").trim(),
      description: enDesc.map((p: any) => String(p).trim()).filter(Boolean),
    },
    categories: catsIn.map((c: any) => String(c).trim()).filter(Boolean),
    locations: normalizedLocs,
  } as PostInput;
}
