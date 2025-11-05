"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import { HotelDetail } from "@/components/hotel-detail";
import data from "@/lib/data.json";
import { normalizeImageUrl } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { useEffect, use } from "react";

type ResolvedParams = { slug: string };

export default function LugarPage(props: any) {
  const { language, t } = useLanguage();

  // Next.js: params es un Promise en Client Components, usar React.use() para resolverlo
  const resolvedParams = use(props.params as any) as ResolvedParams;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [resolvedParams?.slug]);

  // buscar en data.json
  const a = data as unknown as any[];
  const arquitecturaEntry = a.find((x) => x.slug === resolvedParams?.slug);

  if (!arquitecturaEntry) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-[var(--color-brand-red)]">
              {t("CONTENIDO EN MIGRACIÓN", "CONTENT IN MIGRATION")}
            </h1>
            <p className="text-xl text-[var(--color-brand-gray)] mb-8">
              {t(
                "Este hotel aún está en proceso de migración. Por favor, vuelve pronto.",
                "This hotel is still being migrated. Please check back soon."
              )}
            </p>
            <a
              href="/"
              className="inline-block bg-[var(--color-brand-red)] text-white px-8 py-3 rounded-sm hover:opacity-90 transition-opacity uppercase font-semibold"
            >
              {t("VOLVER AL INICIO", "BACK TO HOME")}
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const source = arquitecturaEntry;

  const hotel = source
    ? {
        name:
          source[language]?.name || source.en?.name || source.es?.name || "",
        subtitle:
          source[language]?.subtitle ||
          source.en?.subtitle ||
          source.es?.subtitle ||
          "",
        excerpt:
          (source[language]?.description && source[language].description[0]) ||
          "",
        fullContent: (source[language]?.description || [])
          .filter(Boolean)
          .map((p: string) => `<p>${p}</p>`)
          .join(""),
        infoHtml: source[language]?.infoHtml || "",
        website: source.website || "",
        website_display: source.website_display || "",
        instagram: source.instagram || "",
        instagram_display: source.instagram_display || "",
        email: source.email || "",
        phone: source.phone || "",
        address: source.address || "",
        locations: source.locations || [],
        photosCredit: source.photosCredit || "",
        hours: source.hours || "",
        reservationLink: source.reservationLink || "",
        reservationPolicy: source.reservationPolicy || "",
        interestingFact: source.interestingFact || "",
        // Imagen destacada separada de la galería; si no viene, usamos la primera.
        // Además, evitamos duplicados comparando por nombre de archivo (ignorando query y mayúsculas).
        ...(() => {
          const imgs: string[] = Array.isArray(source.images)
            ? source.images.filter((s: string) => !!s)
            : [];

          // 1) Detectar imagen 'PORTADA' por nombre de archivo (case-insensitive)
          const isPortada = (s: string) =>
            /portada/i.test(normalizeImageUrl(s).replace(/\.[^.]+$/, ""));

          // 2) Elegir featured:
          //    - Preferir source.featuredImage si viene
          //    - Si no, buscar una imagen que tenga 'PORTADA' en el nombre
          //    - Si no, usar la primera numerada en orden; si no hay numeradas, la primera disponible
          let derivedFeatured = String(source.featuredImage || "").trim();
          if (!derivedFeatured) {
            const portada = imgs.find((s) => isPortada(s));
            if (portada) derivedFeatured = portada;
          }

          // helper para extraer índice numérico desde el nombre (para orden)
          const getIndex = (s: string) => {
            const base = normalizeImageUrl(s).replace(/\.[^.]+$/, "");
            // Busca el primer grupo de dígitos en el nombre
            const m = base.match(/(\d{1,4})/);
            return m ? parseInt(m[1], 10) : NaN;
          };

          // 3) Si aún no hay featured, intentar con la primera numerada (por índice ascendente)
          if (!derivedFeatured) {
            const numeradas = imgs
              .map((s) => ({ s, idx: getIndex(s) }))
              .filter((x) => Number.isFinite(x.idx))
              .sort((a, b) => a.idx - b.idx);
            if (numeradas.length) derivedFeatured = numeradas[0].s;
          }
          // 4) Último fallback: primera imagen
          if (!derivedFeatured && imgs.length) {
            derivedFeatured = imgs[0];
          }

          const featuredKey = normalizeImageUrl(derivedFeatured);

          // 5) Construir galería:
          //    - excluir featured
          //    - excluir cualquier imagen cuyo nombre contenga 'PORTADA'
          //    - incluir SOLO imágenes numeradas (que contengan dígitos)
          //    - ordenar por el número ascendente
          const seen = new Set<string>();
          const gallery = imgs
            .filter((img) => {
              const key = normalizeImageUrl(img);
              if (!key) return false;
              if (key === featuredKey) return false; // excluir featured
              if (/portada/i.test(key)) return false; // excluir PORTADA en galería
              const idx = getIndex(img);
              if (!Number.isFinite(idx)) return false; // solo numeradas
              if (seen.has(key)) return false; // evitar duplicados
              seen.add(key);
              return true;
            })
            .map((s) => ({ s, idx: getIndex(s) }))
            .sort((a, b) => a.idx - b.idx)
            .map((x) => x.s);

          return {
            featuredImage: derivedFeatured,
            galleryImages: gallery,
          };
        })(),
        categories: source[language]?.category
          ? [source[language].category]
          : source.categories || [],
      }
    : null;

  if (!hotel) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-[var(--color-brand-red)]">
              {t("CONTENIDO EN MIGRACIÓN", "CONTENT IN MIGRATION")}
            </h1>
            <p className="text-xl text-[var(--color-brand-gray)] mb-8">
              {t(
                "Este hotel aún está en proceso de migración. Por favor, vuelve pronto.",
                "This hotel is still being migrated. Please check back soon."
              )}
            </p>
            <a
              href="/"
              className="inline-block bg-[var(--color-brand-red)] text-white px-8 py-3 rounded-sm hover:opacity-90 transition-opacity uppercase font-semibold"
            >
              {t("VOLVER AL INICIO", "BACK TO HOME")}
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Derivar la categoría activa (slug) para marcar menú y footer
  function categoryToSlug(cat: string) {
    if (!cat) return "todos";
    const c = String(cat).toLowerCase();
    if (c === "all" || c === "todos") return "todos";
    if (c.includes("architect")) return "arquitectura";
    if (c.includes("cultura") || c.includes("culture")) return "museos";
    if (c.includes("restaurant")) return "restaurantes";
    if (
      c.includes("fuera de stgo") ||
      c.includes("outside stgo") ||
      c.includes("outside santiago") ||
      c.includes("paseos fuera de santiago")
    )
      return "paseos-fuera-de-santiago";
    return c.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  const activeCategorySlug = categoryToSlug(
    (hotel?.categories && hotel.categories[0]) || "todos"
  );
  const isRestaurantPost = activeCategorySlug === "restaurantes";

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Menú de categorías normal para posts que NO son restaurantes (coincide con el contenedor de otras páginas) */}
      {!isRestaurantPost && (
        <div className="mx-auto px-4 py-2 max-w-[1200px] hidden lg:block">
          <CategoryNav activeCategory={activeCategorySlug} compact />
        </div>
      )}
      <HotelDetail hotel={hotel as any} />
      <Footer activeCategory={activeCategorySlug} />
    </div>
  );
}
