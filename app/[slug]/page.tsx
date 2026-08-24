import { redirect } from "next/navigation";

type Params = { slug: string };

// Esta ruta existe para compatibilidad: mantiene URLs "bonitas" sin depender
// estrictamente de rewrites, y evita un archivo vacío que rompe el routing.
export default function SlugCompatPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const slug = String(params?.slug || "").trim();
  if (!slug) redirect("/");

  const query = new URLSearchParams();
  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (typeof value === "string") {
      query.set(key, value);
    }
  });
  const querySuffix = query.toString() ? `?${query.toString()}` : "";

  const categorySlugs = new Set([
    "iconos",
    "ninos",
    "arquitectura",
    "barrios",
    "mercados",
    "miradores",
    "museos",
    "palacios",
    "parques",
    "paseos-fuera-de-santiago",
    "restaurantes",
    "monumentos-nacionales",
    "cafes",
  ]);

  if (categorySlugs.has(slug)) {
    redirect(`/categoria/${slug}${querySuffix}`);
  }

  redirect(`/lugar/${slug}${querySuffix}`);
}
