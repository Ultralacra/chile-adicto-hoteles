"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HotelDetail } from "@/components/hotel-detail";
import data from "@/lib/data.json";
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
        featuredImage:
          source.featuredImage || (source.images && source.images[0]) || "",
        galleryImages: Array.isArray(source.images)
          ? source.featuredImage
            ? source.images.filter(
                (img: string) => img !== source.featuredImage
              )
            : source.images
          : [],
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HotelDetail hotel={hotel as any} />
      <Footer activeCategory={activeCategorySlug} />
    </div>
  );
}
