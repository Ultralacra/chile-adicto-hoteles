type SiteId = "santiagoadicto" | "chileadicto";
const DEFAULT_SITE: SiteId = "santiagoadicto";

export function getClientSiteId(): SiteId {
  if (typeof window === "undefined") {
    return DEFAULT_SITE;
  }

  const hostname = window.location.hostname;

  if (hostname.includes("chileadicto")) {
    return "chileadicto";
  }

  return "santiagoadicto";
}