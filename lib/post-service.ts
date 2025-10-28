"use client";

import { postSchema, type PostInput } from "@/lib/post-schema";
import type { ValidationIssue, ValidationResult } from "@/lib/post-types";

// Normaliza ciertos campos (teléfono, trimming, imágenes)
export function normalizePost(input: PostInput): PostInput {
  const normPhone = input.phone
    ? `tel:${input.phone.replace(/^tel:/i, "").replace(/[^+\d]/g, "")}`
    : undefined;
  const uniqueImages = Array.from(new Set((input.images || []).map((s) => s.trim()).filter(Boolean)));
  return {
    ...input,
    phone: normPhone,
    images: uniqueImages,
    slug: input.slug.trim(),
    es: {
      ...input.es,
      name: input.es.name.trim(),
      subtitle: input.es.subtitle.trim(),
      description: input.es.description.map((p) => p.trim()).filter(Boolean),
    },
    en: {
      ...input.en,
      name: input.en.name.trim(),
      subtitle: input.en.subtitle.trim(),
      description: input.en.description.map((p) => p.trim()).filter(Boolean),
    },
    categories: (input.categories || []).map((c) => c.trim()).filter(Boolean),
  };
}

export function validatePost(input: PostInput): ValidationResult {
  const parsed = postSchema.safeParse(input);
  if (parsed.success) return { ok: true };
  const issues: ValidationIssue[] = parsed.error.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
  }));
  return { ok: false, issues };
}

// Simula persistencia local (para reemplazar luego por API)
export async function saveDraft(input: PostInput): Promise<void> {
  const key = `post:draft:${input.slug}`;
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(input));
    } else {
      // Fallback: log
      console.log("[saveDraft]", key, input);
    }
  } catch (err) {
    console.warn("No se pudo guardar draft en localStorage", err);
  }
}
