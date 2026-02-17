export type PublicationStatus = "published" | "unpublished";

function normalizeDateOnly(value: unknown): string | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}

function normalizeDateTime(value: unknown): Date | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function todayChileDateOnly(now = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

export function getPublicationStatusValue(post: any): PublicationStatus {
  const raw = String(post?.publicationStatus ?? post?.publication_status ?? "")
    .trim()
    .toLowerCase();
  return raw === "unpublished" ? "unpublished" : "published";
}

export function isWithinPublicationWindow(post: any, now = new Date()): boolean {
  const rawStart = post?.publishStartAt ?? post?.publish_start_at;
  const rawEnd = post?.publishEndAt ?? post?.publish_end_at;

  const startDateTime = normalizeDateTime(rawStart);
  const endDateTime = normalizeDateTime(rawEnd);

  if (startDateTime && now < startDateTime) return false;
  if (endDateTime && now > endDateTime) return false;

  const today = todayChileDateOnly(now);
  const start = normalizeDateOnly(rawStart);
  const end = normalizeDateOnly(rawEnd);

  if (start && today < start) return false;
  if (end && today > end) return false;
  return true;
}

export function isPostCurrentlyPublished(post: any, now = new Date()): boolean {
  if (getPublicationStatusValue(post) !== "published") return false;
  return isWithinPublicationWindow(post, now);
}

export function getPostPublicationBadge(post: any): "Publicado" | "No publicado" {
  return isPostCurrentlyPublished(post) ? "Publicado" : "No publicado";
}
