export interface HotelData {
  id: number;
  slug: string;
  es: {
    name: string;
    subtitle?: string;
    description?: string[];
    excerpt?: string;
    fullContent?: string;
    categories?: string[];
  };
  en: {
    name: string;
    subtitle?: string;
    description?: string[];
    excerpt?: string;
    fullContent?: string;
    categories?: string[];
  };
  featuredImage?: string;
  galleryImages?: string[];
  images?: string[];
  website?: string;
  instagram?: string;
  location?: string;
  rating?: string;
}

// Keep a small in-file placeholder list. The app currently primarily reads
// from `lib/arquitectura.json` for category pages; this module exists so
// older imports don't crash. If you prefer restoring the full hard-coded
// hotels list, we can rehydrate this array from backups.
export const santiagoHotelsComplete: HotelData[] = [];

export function getHotelBySlug(slug: string): HotelData | undefined {
  return santiagoHotelsComplete.find((h) => h.slug === slug);
}
