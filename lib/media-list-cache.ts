type MediaListCache = {
  ts: number;
  urls: string[];
};

const mediaListCacheBySite = new Map<string, MediaListCache>();

export const MEDIA_CACHE_MS = 60_000;

export function getMediaListCache(siteId: string) {
  return mediaListCacheBySite.get(siteId) || null;
}

export function setMediaListCache(siteId: string, urls: string[]) {
  mediaListCacheBySite.set(siteId, { ts: Date.now(), urls });
}

export function invalidateMediaListCache(siteId?: string) {
  if (siteId) {
    mediaListCacheBySite.delete(siteId);
    return;
  }
  mediaListCacheBySite.clear();
}

/** Extrae un timestamp usable para ordenar (más nuevo = mayor). */
export function mediaRecencyScore(
  url: string,
  createdAt?: string | null,
): number {
  if (createdAt) {
    const t = Date.parse(createdAt);
    if (Number.isFinite(t)) return t;
  }
  const raw = String(url || "");
  const tsMatch = raw.match(/(?:^|\/)(\d{13})(?:[-_]|$)/);
  if (tsMatch) return Number(tsMatch[1]);
  const folderMatch = raw.match(/\/uploads\/(\d{4})\/(\d{2})\//);
  if (folderMatch) {
    return Date.UTC(Number(folderMatch[1]), Number(folderMatch[2]) - 1, 1);
  }
  return 0;
}

export function sortMediaUrlsNewestFirst(
  urls: string[],
  createdAtByUrl?: Map<string, string>,
): string[] {
  return [...urls].sort((a, b) => {
    const scoreB = mediaRecencyScore(b, createdAtByUrl?.get(b));
    const scoreA = mediaRecencyScore(a, createdAtByUrl?.get(a));
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.localeCompare(a);
  });
}
