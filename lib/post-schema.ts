import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const localizedSchema = z.object({
  name: z.string().min(1, "name requerido"),
  subtitle: z.string().min(1, "subtitle requerido"),
  description: z
    .array(z.string().min(1))
    .min(1, "al menos 1 párrafo"),
  // HTML libre para el bloque "Datos útiles" (opcional)
  infoHtml: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  distance: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export const postSchema = z.object({
  slug: z.string().regex(slugRegex, "slug inválido: usa minusculas y guiones"),
  es: localizedSchema,
  en: localizedSchema,
  featuredImage: z.string().url().optional(),
  images: z.array(z.string().url({ message: "imagen debe ser URL" })).min(0),
  categories: z.array(z.string().min(1)).min(1, "al menos 1 categoría"),
  website: z.string().url().optional(),
  website_display: z.string().optional(),
  instagram: z.string().optional(),
  instagram_display: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^tel:\+?[0-9]+$/, "phone debe ser tel:+..." ).optional(),
  address: z.string().optional(),
  photosCredit: z.string().optional(),
  reservationLink: z.string().url().optional(),
  hours: z.string().optional(),
  reservationPolicy: z.string().optional(),
  interestingFact: z.string().optional(),
  locations: z
    .array(
      z.object({
        label: z.string().optional(),
        address: z.string().min(1, "address requerido en location"),
        hours: z.string().optional(),
        website: z.string().url().optional(),
        website_display: z.string().optional(),
        instagram: z.string().optional(),
        instagram_display: z.string().optional(),
        reservationLink: z.string().url().optional(),
        reservationPolicy: z.string().optional(),
        interestingFact: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().regex(/^tel:\+?[0-9]+$/, "phone debe ser tel:+...").optional(),
      })
    )
    .optional(),
});

export type PostInput = z.infer<typeof postSchema>;
