type ResizeOptions = {
  width: number;
  quality?: number;
};

/**
 * Reescribe la URL de un banner a través del proxy local de resize
 * para servir un WebP más liviano en el tamaño de visualización.
 */
export function getResizedBannerSrc(
  src: string,
  { width, quality = 72 }: ResizeOptions,
): string {
  const clean = String(src || "").trim();
  if (!clean) return clean;
  if (clean.startsWith("/api/media/resize")) return clean;

  const params = new URLSearchParams({
    url: clean,
    w: String(Math.max(120, Math.min(1600, Math.trunc(width) || 960))),
    q: String(Math.max(40, Math.min(90, Math.trunc(quality) || 72))),
  });
  return `/api/media/resize?${params.toString()}`;
}
