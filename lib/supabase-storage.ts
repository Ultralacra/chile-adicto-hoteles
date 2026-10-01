/**
 * Normaliza URLs de imagen.
 * El resize real lo hace next/image (ver next.config images.unoptimized).
 * El parámetro width se conserva por compatibilidad con callers existentes.
 */
export function getStorageImageUrl(
  url: string | null | undefined,
  width?: number,
): string {
  if (!url) return "/placeholder.svg";
  const trimmed = String(url).trim();
  if (!trimmed) return "/placeholder.svg";
  void width;
  return trimmed;
}
