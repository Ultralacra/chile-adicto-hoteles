export type PostDeleteSummary = {
  imageCount: number;
  featuredCount: number;
  galleryCount: number;
  categoryCount: number;
  communeCount: number;
  locationCount: number;
  translationCount: number;
};

function asUrlList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object" && "url" in item) {
        return String((item as { url?: unknown }).url || "").trim();
      }
      return "";
    })
    .filter(Boolean);
}

export function getPostDeleteSummary(post: any): PostDeleteSummary {
  const featured = String(
    post?.featuredImage || post?.featured_image || "",
  ).trim();
  const galleryUrls = asUrlList(post?.images).filter((url) => url !== featured);
  const imageUrls = new Set<string>(
    [featured, ...galleryUrls].filter(Boolean),
  );

  const categories = Array.isArray(post?.categories) ? post.categories : [];
  const communes = Array.isArray(post?.communes) ? post.communes : [];
  const locations = Array.isArray(post?.locations) ? post.locations : [];

  let translationCount = 0;
  if (post?.es?.name || post?.es?.subtitle || post?.es?.description) {
    translationCount += 1;
  }
  if (post?.en?.name || post?.en?.subtitle || post?.en?.description) {
    translationCount += 1;
  }
  if (translationCount === 0) translationCount = 1;

  return {
    imageCount: imageUrls.size,
    featuredCount: featured ? 1 : 0,
    galleryCount: galleryUrls.length,
    categoryCount: categories.length,
    communeCount: communes.length,
    locationCount: locations.length,
    translationCount,
  };
}

export function formatPostDeleteSummaryLines(
  summary: PostDeleteSummary,
): string[] {
  const lines: string[] = [];

  if (summary.imageCount === 0) {
    lines.push("0 imágenes asociadas");
  } else {
    const parts: string[] = [];
    if (summary.featuredCount) parts.push("1 destacada");
    if (summary.galleryCount) {
      parts.push(
        summary.galleryCount === 1
          ? "1 de galería"
          : `${summary.galleryCount} de galería`,
      );
    }
    lines.push(
      summary.imageCount === 1
        ? `1 imagen asociada${parts.length ? ` (${parts.join(" + ")})` : ""}`
        : `${summary.imageCount} imágenes asociadas${
            parts.length ? ` (${parts.join(" + ")})` : ""
          }`,
    );
  }

  lines.push(
    summary.translationCount === 1
      ? "1 traducción"
      : `${summary.translationCount} traducciones`,
  );
  lines.push(
    summary.categoryCount === 1
      ? "1 categoría"
      : `${summary.categoryCount} categorías`,
  );
  lines.push(
    summary.communeCount === 1
      ? "1 comuna"
      : `${summary.communeCount} comunas`,
  );
  lines.push(
    summary.locationCount === 1
      ? "1 ubicación / sucursal"
      : `${summary.locationCount} ubicaciones / sucursales`,
  );
  return lines;
}
