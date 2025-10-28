import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Construye un excerpt para las cards uniendo párrafos hasta alcanzar un tamaño mínimo.
// - paragraphs: array de párrafos en texto plano (puede contener espacios/\n)
// - targetMinChars: cantidad mínima aproximada para asegurar 5 líneas con line-clamp-5
export function buildCardExcerpt(paragraphs: string[] | undefined, targetMinChars = 280): string {
  if (!Array.isArray(paragraphs) || paragraphs.length === 0) return "";
  // Unir párrafos respetando espacios, limpiar whitespace extra
  let out = "";
  for (const p of paragraphs) {
    const clean = String(p || "")
      .replace(/\s+/g, " ")
      .trim();
    if (!clean) continue;
    out = out ? `${out} ${clean}` : clean;
    if (out.length >= targetMinChars) break;
  }
  // Si sigue corto, añade más párrafos si hay
  if (out.length < targetMinChars) {
    for (let i = 0; i < paragraphs.length; i++) {
      const clean = String(paragraphs[i] || "")
        .replace(/\s+/g, " ")
        .trim();
      if (!clean) continue;
      if (out.includes(clean)) continue;
      out = `${out} ${clean}`.trim();
      if (out.length >= targetMinChars) break;
    }
  }
  return out;
}
