import { hotelsData, type Hotel } from "./hotels-data"
import data from "./data.json"

// Map arquitectura.json entries to the Hotel shape (best-effort)
function mapArquitecturaEntry(entry: any): Hotel {
  const es = entry.es || {}
  const en = entry.en || {}

  return {
    slug: entry.slug,
    es: {
      name: es.name || en.name || "",
      subtitle: es.subtitle || en.subtitle || "",
      description: Array.isArray(es.description) ? es.description : (es.description ? [es.description] : []),
      category: es.category || en.category || "",
      location: es.location || "",
      distance: "",
      amenities: [],
    },
    en: {
      name: en.name || es.name || "",
      subtitle: en.subtitle || es.subtitle || "",
      description: Array.isArray(en.description) ? en.description : (en.description ? [en.description] : []),
      category: en.category || es.category || "",
      location: en.location || "",
      distance: "",
      amenities: [],
    },
    website: entry.website || "",
    instagram: entry.instagram || "",
    images: Array.isArray(entry.images) ? entry.images : [],
    categories: Array.isArray(entry.categories) ? entry.categories : ["TODOS"],
  }
}

export const postsData: Hotel[] = [
  ...hotelsData,
  ...(Array.isArray(data) ? (data as any[]).map(mapArquitecturaEntry) : []),
]

export function getPostBySlug(slug: string): Hotel | undefined {
  return postsData.find((p) => p.slug === slug)
}

export function getPostsByCategory(category: string): Hotel[] {
  if (category === "TODOS") return postsData
  return postsData.filter((p) => p.categories.includes(category))
}
