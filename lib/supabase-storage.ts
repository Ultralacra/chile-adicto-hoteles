import { getResizedBannerSrc } from "@/lib/banner-image";

/**
 * Normaliza URLs de imagen y, si se pide un ancho, las pasa por
 * /api/media/resize (sharp propio). No usa el Image Optimization de Next.
 */
export function getStorageImageUrl(
  url: string | null | undefined,
  width?: number,
): string {
  if (!url) return "/placeholder.svg";
  const trimmed = String(url).trim();
  if (!trimmed) return "/placeholder.svg";
  if (trimmed.startsWith("data:")) return trimmed;
  if (/\.svg(\?|#|$)/i.test(trimmed)) return trimmed;
  if (!width || !Number.isFinite(width) || width <= 0) return trimmed;
  return getResizedBannerSrc(trimmed, {
    width: Math.trunc(width),
    quality: 70,
  });
}
