export const HIDDEN_FRONT_SLUGS = new Set<string>([
  // Ocultos explícitamente en el frontend
  "w-santiago",
  "test",
]);

function normalize(s: unknown): string {
  return String(s ?? "")
    .trim()
    .toLowerCase();
}

function equalsIgnoreCase(a: unknown, b: unknown): boolean {
  return normalize(a) === normalize(b);
}

/**
 * Determina si un post debe ocultarse en el frontend.
 * Nota: NO afecta al admin (depende de dónde se use).
 */
export function isHiddenFrontPost(post: any): boolean {
  const slug = normalize(post?.slug);
  if (HIDDEN_FRONT_SLUGS.has(slug)) return true;

  // Fallback por nombre (por si el slug no es literalmente "test")
  const names = [
    post?.name,
    post?.title,
    post?.es?.name,
    post?.en?.name,
    post?.es?.title,
    post?.en?.title,
  ];

  return names.some((n) => equalsIgnoreCase(n, "test"));
}
