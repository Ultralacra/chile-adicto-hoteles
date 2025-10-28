export type Lang = "es" | "en";

export interface LocalizedContent {
  name: string;
  subtitle: string;
  // Array de párrafos (HTML permitido). Mantener orden.
  description: string[];
  // Campos opcionales por idioma si en algún momento se requieren
  category?: string;
  location?: string;
  distance?: string;
  amenities?: string[];
}

export interface PostContact {
  website?: string; // URL completa
  website_display?: string; // Texto a mostrar
  instagram?: string; // URL completa o @handle
  instagram_display?: string; // Texto a mostrar
  email?: string; // correo@dominio
  phone?: string; // normalizado a "tel:+..." si aplica
  address?: string; // multilinea permitida
  photosCredit?: string; // crédito de fotos
  reservationLink?: string; // URL de reserva
}

export interface PostBase {
  slug: string;
  es: LocalizedContent;
  en: LocalizedContent;
  images: string[]; // destacada en índice 0
  categories: string[]; // etiquetas superiores (ALL/TODOS, NORTE, etc.)
}

export type Post = PostBase & PostContact;

// Resultado de validación para UI
export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues?: ValidationIssue[];
}
