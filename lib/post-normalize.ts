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

  return {
    ...input,
    email: normEmail,
    phone: normPhone,
    website: fixUrl((input as any).website),
    reservationLink: fixUrl((input as any).reservationLink),
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
  } as PostInput;
}
