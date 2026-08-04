export type AgendaLanguage = "es" | "en";

export type AgendaPeriod = {
  id: number;
  label: string | null;
  title: string | null;
  startDate: string;
  endDate: string;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  alt: string;
  href: string;
  sortOrder: number;
  postSlugs: string[];
};

export type AgendaFeaturedSlot = {
  id: number;
  postSlug: string;
  startDate: string | null;
  endDate: string | null;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  alt: string;
  href: string;
};

function stringOrNull(value: unknown): string | null {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export function agendaDateInChile(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function rangesOverlap(
  leftStart: string | null | undefined,
  leftEnd: string | null | undefined,
  rightStart: string | null | undefined,
  rightEnd: string | null | undefined,
): boolean {
  const startA = leftStart || "0001-01-01";
  const endA = leftEnd || "9999-12-31";
  const startB = rightStart || "0001-01-01";
  const endB = rightEnd || "9999-12-31";
  return startA <= endB && startB <= endA;
}

export function isActiveOnDate(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  date: string,
): boolean {
  return (!startDate || startDate <= date) && (!endDate || endDate >= date);
}

export function mapAgendaPeriod(
  row: any,
  language: AgendaLanguage,
  postSlugs: string[],
): AgendaPeriod {
  const desktopImageUrl =
    stringOrNull(row?.[`desktop_image_url_${language}`]) ||
    stringOrNull(row?.desktop_image_url_es) ||
    stringOrNull(row?.desktop_image_url);
  const mobileImageUrl =
    stringOrNull(row?.[`mobile_image_url_${language}`]) ||
    stringOrNull(row?.mobile_image_url_es) ||
    stringOrNull(row?.mobile_image_url);
  const title =
    stringOrNull(row?.[`title_${language}`]) ||
    stringOrNull(row?.title_es) ||
    stringOrNull(row?.label);
  const alt =
    stringOrNull(row?.[`alt_${language}`]) || stringOrNull(row?.alt_es) || title || "Agenda Cultural";
  const href =
    stringOrNull(row?.[`href_${language}`]) || stringOrNull(row?.href_es) || "/agenda-cultural";

  return {
    id: Number(row?.id),
    label: stringOrNull(row?.label),
    title,
    startDate: String(row?.period_start || ""),
    endDate: String(row?.period_end || ""),
    desktopImageUrl,
    mobileImageUrl,
    alt,
    href,
    sortOrder: Number(row?.sort_order || 0),
    postSlugs,
  };
}

export function mapAgendaFeaturedSlot(
  row: any,
  language: AgendaLanguage,
): AgendaFeaturedSlot {
  const postSlug = String(row?.post_slug || "").trim();
  const href =
    stringOrNull(row?.[`href_${language}`]) ||
    stringOrNull(row?.href_es) ||
    (postSlug ? `/${postSlug}` : "/agenda-cultural");

  return {
    id: Number(row?.id),
    postSlug,
    startDate: stringOrNull(row?.start_date),
    endDate: stringOrNull(row?.end_date),
    desktopImageUrl:
      stringOrNull(row?.[`desktop_image_url_${language}`]) ||
      stringOrNull(row?.desktop_image_url_es),
    mobileImageUrl:
      stringOrNull(row?.[`mobile_image_url_${language}`]) ||
      stringOrNull(row?.mobile_image_url_es),
    alt:
      stringOrNull(row?.[`alt_${language}`]) ||
      stringOrNull(row?.alt_es) ||
      "Evento destacado",
    href,
  };
}