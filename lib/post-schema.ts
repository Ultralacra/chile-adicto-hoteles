import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const localizedSchema = z.object({
  name: z.string().min(1, "name requerido"),
  subtitle: z.string().min(1, "subtitle requerido"),
  description: z
    .array(z.string().min(1))
    .min(1, "al menos 1 párrafo"),
  category: z.string().optional(),
  location: z.string().optional(),
  distance: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export const postSchema = z.object({
  slug: z.string().regex(slugRegex, "slug inválido: usa minusculas y guiones"),
  es: localizedSchema,
  en: localizedSchema,
  images: z.array(z.string().url({ message: "imagen debe ser URL" })).min(1, "al menos 1 imagen"),
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
});

export type PostInput = z.infer<typeof postSchema>;
