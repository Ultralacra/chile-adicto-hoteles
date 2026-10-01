import type { SiteId } from "@/lib/sites-config";

export type BannerSlotKind = "slider" | "banner";
export type BannerSlotDevice = "desktop" | "mobile" | "responsive";

export type BannerSlotDefinition = {
  key: string;
  label: string;
  location: string;
  device: BannerSlotDevice;
  kind: BannerSlotKind;
  /** Sitios donde este slot se usa en el front. */
  sites: SiteId[];
  /** Agrupa desktop/móvil del mismo bloque visual. */
  groupId: string;
  language?: "es" | "en";
};

export type BannerSlotGroup = {
  id: string;
  label: string;
  location: string;
  kind: BannerSlotKind;
  language?: "es" | "en";
  sites: SiteId[];
  desktop?: BannerSlotDefinition;
  mobile?: BannerSlotDefinition;
  /** Un solo key para ambos dispositivos (banner responsive). */
  responsive?: BannerSlotDefinition;
};

export const BANNER_SLOT_DEFINITIONS: BannerSlotDefinition[] = [
  // --- Santiago Adicto ---
  {
    key: "home-desktop-webp",
    label: "Home desktop",
    location: "Home",
    device: "desktop",
    kind: "slider",
    sites: ["santiagoadicto"],
    groupId: "santiago-home",
  },
  {
    key: "home-mobile",
    label: "Home móvil",
    location: "Home",
    device: "mobile",
    kind: "slider",
    sites: ["santiagoadicto"],
    groupId: "santiago-home",
  },
  {
    key: "home-promo-toyota",
    label: "Home - Toyota",
    location: "Home",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-promo-toyota",
  },
  {
    key: "home-promo-cafes",
    label: "Home - cafés",
    location: "Home",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-promo-cafes",
  },
  {
    key: "home-promo-restaurantes",
    label: "Home - restaurantes",
    location: "Home",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-promo-restaurantes",
  },
  {
    key: "home-promo-hoteles",
    label: "Home - hoteles",
    location: "Home",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-promo-hoteles",
  },
  {
    key: "home-promo-monumentos",
    label: "Home - monumentos",
    location: "Home",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-promo-monumentos",
  },
  {
    key: "category-cafes",
    label: "Categoría cafés",
    location: "Categorías",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-category-cafes",
  },
  {
    key: "category-monumentos",
    label: "Categoría monumentos",
    location: "Categorías",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-category-monumentos",
  },
  {
    key: "category-iconos",
    label: "Categoría iconos",
    location: "Categorías",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-category-iconos",
  },
  {
    key: "category-parques",
    label: "Categoría parques",
    location: "Categorías",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-category-parques",
  },
  {
    key: "category-cultura",
    label: "Categoría cultura",
    location: "Categorías",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-category-cultura",
  },
  {
    key: "category-toyota",
    label: "Categoría Toyota",
    location: "Categorías",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-category-toyota",
  },
  {
    key: "category-top-restaurantes",
    label: "Categoría Top Restaurantes",
    location: "Categorías",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-category-top-restaurantes",
  },
  {
    key: "restaurants-main",
    label: "Restaurantes - bloque principal",
    location: "Restaurantes",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-restaurants-main",
  },
  {
    key: "bars-main",
    label: "Bares - bloque principal",
    location: "Bares",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-bars-main",
  },
  {
    key: "restaurants-interior",
    label: "Restaurantes - bloque interior",
    location: "Restaurantes",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-restaurants-interior",
  },
  {
    key: "bars-interior",
    label: "Bares - bloque interior",
    location: "Bares",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-bars-interior",
  },
  {
    key: "top-restaurants",
    label: "Restaurantes - 50 Best",
    location: "Restaurantes",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-top-restaurants",
  },
  {
    key: "post-toyota",
    label: "Post Toyota",
    location: "Detalle de post",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-post-toyota",
  },
  {
    key: "post-cafes",
    label: "Post cafés",
    location: "Detalle de post",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-post-cafes",
  },
  {
    key: "post-monumentos",
    label: "Post monumentos",
    location: "Detalle de post",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-post-monumentos",
  },
  {
    key: "post-iconos",
    label: "Post iconos",
    location: "Detalle de post",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-post-iconos",
  },
  {
    key: "post-parques",
    label: "Post parques",
    location: "Detalle de post",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-post-parques",
  },
  {
    key: "post-cultura",
    label: "Post cultura",
    location: "Detalle de post",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-post-cultura",
  },
  {
    key: "post-top-restaurants",
    label: "Post Top Restaurantes",
    location: "Detalle de post",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-post-top-restaurants",
  },
  {
    key: "post-restaurants",
    label: "Post restaurantes",
    location: "Detalle de post",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-post-restaurants",
  },
  {
    key: "post-bars",
    label: "Post bares",
    location: "Detalle de post",
    device: "responsive",
    kind: "banner",
    sites: ["santiagoadicto"],
    groupId: "santiago-post-bars",
  },

  // --- Chile Adicto ---
  {
    key: "home-desktop",
    label: "Home desktop ES",
    location: "Home",
    device: "desktop",
    kind: "slider",
    sites: ["chileadicto"],
    groupId: "chile-home-es",
    language: "es",
  },
  {
    key: "HOME MOVIL ESPAÑOL",
    label: "Home móvil ES",
    location: "Home",
    device: "mobile",
    kind: "slider",
    sites: ["chileadicto"],
    groupId: "chile-home-es",
    language: "es",
  },
  {
    key: "HOME INGLES DESKTOP",
    label: "Home desktop EN",
    location: "Home",
    device: "desktop",
    kind: "slider",
    sites: ["chileadicto"],
    groupId: "chile-home-en",
    language: "en",
  },
  {
    key: "HOME MOVIL INGLES",
    label: "Home móvil EN",
    location: "Home",
    device: "mobile",
    kind: "slider",
    sites: ["chileadicto"],
    groupId: "chile-home-en",
    language: "en",
  },

  // --- Compartidos (ambos sitios) ---
  {
    key: "restaurants-desktop-es",
    label: "Restaurantes desktop ES",
    location: "Restaurantes",
    device: "desktop",
    kind: "slider",
    sites: ["santiagoadicto", "chileadicto"],
    groupId: "shared-restaurants-es",
    language: "es",
  },
  {
    key: "restaurants-mobile-es",
    label: "Restaurantes móvil ES",
    location: "Restaurantes",
    device: "mobile",
    kind: "slider",
    sites: ["santiagoadicto", "chileadicto"],
    groupId: "shared-restaurants-es",
    language: "es",
  },
  {
    key: "restaurants-desktop-en",
    label: "Restaurantes desktop EN",
    location: "Restaurantes",
    device: "desktop",
    kind: "slider",
    sites: ["santiagoadicto", "chileadicto"],
    groupId: "shared-restaurants-en",
    language: "en",
  },
  {
    key: "restaurants-mobile-en",
    label: "Restaurantes móvil EN",
    location: "Restaurantes",
    device: "mobile",
    kind: "slider",
    sites: ["santiagoadicto", "chileadicto"],
    groupId: "shared-restaurants-en",
    language: "en",
  },
];

export function getBannerSlot(key: string) {
  return BANNER_SLOT_DEFINITIONS.find((slot) => slot.key === key);
}

export function getBannerSlotsForSite(siteId: SiteId) {
  return BANNER_SLOT_DEFINITIONS.filter((slot) => slot.sites.includes(siteId));
}

export function slotBelongsToSite(key: string, siteId: SiteId) {
  const slot = getBannerSlot(key);
  // Si la key está definida para otro sitio, no la muestres aquí
  if (slot) return slot.sites.includes(siteId);
  // Personalizada: solo si no choca con una key conocida de otro sitio
  return true;
}

export function buildSlotGroupsForSite(siteId: SiteId): BannerSlotGroup[] {
  const slots = getBannerSlotsForSite(siteId);
  const map = new Map<string, BannerSlotGroup>();

  for (const slot of slots) {
    const current = map.get(slot.groupId);
    if (!current) {
      map.set(slot.groupId, {
        id: slot.groupId,
        label: groupLabelFromSlot(slot),
        location: slot.location,
        kind: slot.kind,
        language: slot.language,
        sites: slot.sites,
        desktop: slot.device === "desktop" ? slot : undefined,
        mobile: slot.device === "mobile" ? slot : undefined,
        responsive: slot.device === "responsive" ? slot : undefined,
      });
      continue;
    }
    if (slot.device === "desktop") current.desktop = slot;
    if (slot.device === "mobile") current.mobile = slot;
    if (slot.device === "responsive") current.responsive = slot;
    if (!current.language && slot.language) current.language = slot.language;
  }

  return Array.from(map.values());
}

function groupLabelFromSlot(slot: BannerSlotDefinition) {
  // Quitar sufijos de dispositivo para el título del grupo
  return slot.label
    .replace(/\s+(desktop|móvil|movil)\s*(ES|EN)?$/i, "")
    .replace(/\s+ES$/i, "")
    .replace(/\s+EN$/i, "")
    .trim();
}

export function inferBannerSlotKind(key: string): BannerSlotKind {
  const slot = getBannerSlot(key);
  if (slot?.kind) return slot.kind;
  const k = String(key || "").toLowerCase();
  if (
    k.includes("promo") ||
    k.startsWith("category-") ||
    k.startsWith("post-") ||
    k.endsWith("-main") ||
    k.endsWith("-interior") ||
    k.includes("banner")
  ) {
    return "banner";
  }
  return "slider";
}

export function inferBannerSlotDevice(key: string): BannerSlotDevice {
  const slot = getBannerSlot(key);
  if (slot?.device) return slot.device;
  const k = String(key || "").toLowerCase();
  if (k.includes("movil") || k.includes("mobile") || k.includes("móvil")) {
    return "mobile";
  }
  if (k.includes("desktop") || k.includes("escritorio")) {
    return "desktop";
  }
  return "responsive";
}
