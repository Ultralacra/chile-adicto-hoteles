"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HotelDetail } from "@/components/hotel-detail";
import { santiagoHotelsComplete } from "@/lib/santiago-hotels-complete";
import { useLanguage } from "@/contexts/language-context";
import { useEffect, use } from "react";

type ResolvedParams = { slug: string };

export default function HotelPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const { language, t } = useLanguage();

  // React.use is the recommended way in this Next.js version to unwrap params if it's a Promise
  const resolvedParams = use(params as any) as ResolvedParams;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [resolvedParams?.slug]);

  const hotelData = santiagoHotelsComplete.find(
    (h) => h.slug === resolvedParams?.slug
  );

  if (!hotelData) {
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

  const hotel = {
    name: hotelData[language].name,
    subtitle: hotelData[language].subtitle,
    excerpt: hotelData[language].excerpt,
    fullContent: hotelData[language].fullContent,
    website: hotelData.website,
    instagram: hotelData.instagram,
    featuredImage: hotelData.featuredImage,
    galleryImages: hotelData.galleryImages,
    categories: hotelData[language].categories,
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HotelDetail hotel={hotel} />
      <Footer />
    </div>
  );
}
