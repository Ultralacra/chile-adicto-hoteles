export type BannerSlotDefinition = {
  key: string;
  label: string;
  location: string;
  device: "desktop" | "mobile" | "responsive";
  language?: "es" | "en";
};

export const BANNER_SLOT_DEFINITIONS: BannerSlotDefinition[] = [
  { key: "home-desktop", label: "Home - carrusel desktop", location: "Home", device: "desktop" },
  { key: "home-mobile", label: "Home - carrusel móvil", location: "Home", device: "mobile" },
  { key: "home-promo-toyota", label: "Home - promoción Toyota", location: "Home", device: "responsive" },
  { key: "home-promo-cafes", label: "Home - promoción cafés", location: "Home", device: "responsive" },
  { key: "home-promo-restaurantes", label: "Home - promoción restaurantes", location: "Home", device: "responsive" },
  { key: "home-promo-monumentos", label: "Home - promoción monumentos", location: "Home", device: "responsive" },
  { key: "category-cafes", label: "Categoría - cafés", location: "Categorías", device: "responsive" },
  { key: "category-monumentos", label: "Categoría - monumentos", location: "Categorías", device: "responsive" },
  { key: "category-iconos", label: "Categoría - iconos", location: "Categorías", device: "responsive" },
  { key: "category-parques", label: "Categoría - parques", location: "Categorías", device: "responsive" },
  { key: "category-toyota", label: "Categoría - Ruta Toyota", location: "Categorías", device: "responsive" },
  { key: "category-top-restaurantes", label: "Categoría - Top Restaurantes", location: "Categorías", device: "responsive" },
  { key: "restaurants-main", label: "Restaurantes - 50 restaurantes", location: "Restaurantes", device: "responsive" },
  { key: "bars-main", label: "Bares - 50 bares", location: "Bares", device: "responsive" },
  { key: "restaurants-interior", label: "Restaurantes - bloque interior", location: "Restaurantes", device: "responsive" },
  { key: "bars-interior", label: "Bares - bloque interior", location: "Bares", device: "responsive" },
  { key: "top-restaurants", label: "Restaurantes - 50 Best", location: "Restaurantes", device: "responsive" },
  { key: "post-toyota", label: "Posts - Ruta Toyota", location: "Detalle de post", device: "responsive" },
  { key: "post-cafes", label: "Posts - cafés", location: "Detalle de post", device: "responsive" },
  { key: "post-monumentos", label: "Posts - monumentos", location: "Detalle de post", device: "responsive" },
  { key: "post-iconos", label: "Posts - iconos", location: "Detalle de post", device: "responsive" },
  { key: "post-parques", label: "Posts - parques", location: "Detalle de post", device: "responsive" },
  { key: "post-top-restaurants", label: "Posts - Top Restaurantes", location: "Detalle de post", device: "responsive" },
  { key: "post-restaurants", label: "Posts - restaurantes", location: "Detalle de post", device: "responsive" },
  { key: "post-bars", label: "Posts - bares", location: "Detalle de post", device: "responsive" },
  { key: "restaurants-desktop-es", label: "Restaurantes - carrusel desktop ES", location: "Restaurantes", device: "desktop", language: "es" },
  { key: "restaurants-desktop-en", label: "Restaurantes - carrusel desktop EN", location: "Restaurantes", device: "desktop", language: "en" },
  { key: "restaurants-mobile-es", label: "Restaurantes - carrusel móvil ES", location: "Restaurantes", device: "mobile", language: "es" },
  { key: "restaurants-mobile-en", label: "Restaurantes - carrusel móvil EN", location: "Restaurantes", device: "mobile", language: "en" },
];

export function getBannerSlot(key: string) {
  return BANNER_SLOT_DEFINITIONS.find((slot) => slot.key === key);
}