"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CategoryNav } from "@/components/category-nav";
import { HotelDetail } from "@/components/hotel-detail";
// Dejamos de consumir data.json; consultamos al API
import { normalizeImageUrl } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { useEffect, use, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

type ResolvedParams = { slug: string };

export default function LugarPage(props: any) {
  const { language, t } = useLanguage();

  // Next.js: params es un Promise en Client Components, usar React.use() para resolverlo
  const resolvedParams = use(props.params as any) as ResolvedParams;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [resolvedParams?.slug]);

  const [arquitecturaEntry, setArquitecturaEntry] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    let cancelled = false;
    if (!resolvedParams?.slug) return;
    setLoading(true);
    fetch(`/api/posts/${encodeURIComponent(resolvedParams.slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((row) => {
        if (!cancelled) setArquitecturaEntry(row);
      })
      .catch(() => !cancelled && setArquitecturaEntry(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [resolvedParams?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto text-gray-600 flex items-center justify-center gap-2">
            <Spinner className="size-5" /> Cargando…
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
        // Mantener el ORDEN de `source.images` tal como viene desde el API (position asc en Supabase).
        // Evitar duplicados comparando por nombre de archivo (ignorando query y mayúsculas).
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
          //    - No usar numeradas como featured por fallback, para no excluir "-1" de la galería
          let derivedFeatured = String(source.featuredImage || "").trim();
          if (!derivedFeatured) {
            const portada = imgs.find((s) => isPortada(s));
            if (portada) derivedFeatured = portada;
          }

          // 3) Mantener sin featured si no hay explícita ni 'PORTADA'

          const featuredKey = normalizeImageUrl(derivedFeatured);

          // 5) Construir galería respetando el ORDEN dado por el API:
          //    - excluir featured
          //    - NO forzar ordenamiento adicional
          //    - NO filtrar sólo numeradas: el admin define el orden manualmente
          const seen = new Set<string>();
          const gallery = imgs
            .filter((img) => {
              const key = normalizeImageUrl(img);
              if (!key) return false;
              if (key === featuredKey) return false; // excluir featured
              if (seen.has(key)) return false; // evitar duplicados
              seen.add(key);
              return true;
            })
            // mantener orden tal cual
            .map((s) => s);

          // 6) Fallback: si la galería queda vacía, usar la featured para que siempre haya al menos 1 imagen
          const galleryWithFallback =
            gallery.length > 0
              ? gallery
              : derivedFeatured
              ? [derivedFeatured]
              : [];

          return {
            featuredImage: derivedFeatured,
            galleryImages: galleryWithFallback,
          };
        })(),
        categories: source[language]?.category
          ? [source[language].category]
          : source.categories || [],
      }
    : null;

  // Bloque estático de Datos Útiles para el post Ambrosía (ES/EN)
  if (
    hotel &&
    resolvedParams.slug ===
      "ambrosia-restaurante-bistro-dos-versiones-de-un-gran-concepto"
  ) {
    hotel.infoHtml =
      language === "en"
        ? [
            // Main restaurant (EN)
            "<p><strong>AMBROSÍA RESTAURANT</strong></p>",
            "<p>ADDRESS: PAMPLONA 78, VITACURA</p>",
            "<p>HOURS: LUNCH: MONDAY TO SUNDAY, 13:00–15:30 HRS</p>",
            "<p>DINNER: MONDAY TO SATURDAY, 18:30–22:30 HRS</p>",
            "<p>&nbsp;</p>",
            // Bistro (EN)
            "<p><strong>AMBROSÍA BISTRO</strong></p>",
            "<p>ADDRESS: MERCADO URBANO TOBALABA (MUT), AV. APOQUINDO 2730, 4TH FLOOR, LAS CONDES</p>",
            "<p>HOURS: MONDAY TO SATURDAY, 12:30–23:00 HRS</p>",
            "<p>SUNDAY, 12:30–16:30 HRS</p>",
            "<p>&nbsp;</p>",
            // Common (EN)
            "<p><strong>COMMON TO BOTH</strong></p>",
            '<p>WEBSITE: <a href="https://www.ambrosia.cl" target="_blank" rel="noopener noreferrer">WWW.AMBROSIA.CL</a></p>',
            '<p>SOCIAL MEDIA: <a href="https://www.instagram.com/ambrosia_rest" target="_blank" rel="noopener noreferrer">@AMBROSIA_REST</a></p>',
            "<p>RESERVATIONS: HIGHLY RECOMMENDED FOR THE MAIN RESTAURANT IN VITACURA.</p>",
            "<p>INTERESTING FACT: CHEF CAROLINA BAZÁN WAS AWARDED LATIN AMERICA’S BEST FEMALE CHEF IN 2019.</p>",
          ].join("")
        : [
            // Restaurante principal (ES)
            "<p><strong>RESTAURANTE AMBROSÍA</strong></p>",
            "<p>DIRECCIÓN: PAMPLONA 78, VITACURA</p>",
            "<p>HORARIO: ALMUERZO: LUNES A DOMINGO, 13:00-15:30 HRS</p>",
            "<p>CENA: LUNES A SÁBADO, 18:30-22:30 HRS</p>",
            "<p>&nbsp;</p>",
            // Bistró (ES)
            "<p><strong>AMBROSÍA BISTRÓ</strong></p>",
            "<p>DIRECCIÓN: MERCADO URBANO TOBALABA (MUT), AV. APOQUINDO 2730, PISO 4, LAS CONDES</p>",
            "<p>HORARIO: LUNES A SÁBADO, 12:30-23:00 HRS</p>",
            "<p>DOMINGO, 12:30-16:30 HRS</p>",
            "<p>&nbsp;</p>",
            // Común (ES)
            "<p><strong>COMÚN A AMBOS</strong></p>",
            '<p>SITIO WEB: <a href="https://www.ambrosia.cl" target="_blank" rel="noopener noreferrer">WWW.AMBROSIA.CL</a></p>',
            '<p>REDES SOCIALES: <a href="https://www.instagram.com/ambrosia_rest" target="_blank" rel="noopener noreferrer">@AMBROSIA_REST</a></p>',
            "<p>RESERVAS: ALTAMENTE RECOMENDABLES PARA EL RESTAURANTE PRINCIPAL EN VITACURA.</p>",
            "<p>DATO DE INTERÉS: LA CHEF CAROLINA BAZÁN FUE GALARDONADA COMO LA MEJOR CHEF FEMENINA DE LATINOAMÉRICA EN 2019.</p>",
          ].join("");
  }

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
