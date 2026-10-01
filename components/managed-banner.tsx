"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSiteApi } from "@/hooks/use-site-api";
import { getResizedBannerSrc } from "@/lib/banner-image";

type ManagedBannerProps = {
  desktopKey?: string;
  mobileKey?: string;
  itemIndex?: number;
  href?: string;
  src: string;
  mobileSrc?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  hideFallbackWhileLoading?: boolean;
  openInNewTab?: boolean;
  priority?: boolean;
  waitForApi?: boolean;
  skeletonClassName?: string;
  /** Si se define, sirve la imagen vía /api/media/resize (WebP más liviano). */
  optimizeWidth?: number;
  optimizeQuality?: number;
  sizes?: string;
  width?: number;
  height?: number;
};

type BannerItem = {
  image_url?: string;
  href?: string | null;
  active?: boolean;
};

export function ManagedBanner({
  desktopKey,
  mobileKey,
  itemIndex = 0,
  href = "#",
  src,
  mobileSrc,
  alt,
  className,
  imageClassName = "block w-full h-auto",
  openInNewTab = false,
  priority = false,
  optimizeWidth,
  optimizeQuality = 72,
  sizes,
  width,
  height,
}: ManagedBannerProps) {
  const { fetchWithSite } = useSiteApi();
  const hasApiKey = Boolean(desktopKey || mobileKey);

  const [desktop, setDesktop] = useState<{ src: string; href: string } | null>(
    hasApiKey ? null : { src, href },
  );
  const [mobile, setMobile] = useState<{ src: string; href: string } | null>(
    hasApiKey ? null : { src: mobileSrc || src, href },
  );
  const [ready, setReady] = useState(!hasApiKey);

  useEffect(() => {
    let cancelled = false;

    if (!hasApiKey) {
      setDesktop({ src, href });
      setMobile({ src: mobileSrc || src, href });
      setReady(true);
      return;
    }

    // Reset: no mostrar nada hasta la respuesta del API
    setReady(false);
    setDesktop(null);
    setMobile(null);

    const load = async (key: string | undefined) => {
      if (!key) return null;
      try {
        const response = await fetchWithSite(
          `/api/sliders/${encodeURIComponent(key)}`,
          { cache: "no-store" },
        );
        const data = (response.ok ? await response.json() : null) as {
          items?: BannerItem[];
        } | null;
        const items = (Array.isArray(data?.items) ? data.items : []).filter(
          (entry) => entry?.active !== false && entry?.image_url,
        );
        if (items.length === 0 || cancelled) return null;
        return items.map((item) => ({
          src: String(item.image_url),
          href: String(item.href || href),
        }));
      } catch {
        return null;
      }
    };

    Promise.all([load(desktopKey), load(mobileKey)]).then(
      ([desktopValue, mobileValue]) => {
        if (cancelled) return;

        const desktopItem = desktopValue?.[itemIndex] || null;
        const mobileFromKey = mobileKey
          ? mobileValue?.[itemIndex] || null
          : null;

        if (desktopItem) {
          setDesktop(desktopItem);
        }

        if (mobileFromKey) {
          setMobile(mobileFromKey);
        } else if (mobileSrc) {
          // Imagen móvil fija local (ej. monumentos), href del API si existe
          setMobile({
            src: mobileSrc,
            href: desktopItem?.href || href,
          });
        } else if (desktopItem) {
          setMobile(desktopItem);
        }

        setReady(true);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [
    fetchWithSite,
    desktopKey,
    href,
    mobileKey,
    mobileSrc,
    src,
    itemIndex,
    hasApiKey,
  ]);

  // Sin imagen del API todavía → no renderizar (evita flash de imagen incorrecta)
  if (!ready || !desktop) return null;

  const resolvedHref = desktop.href || mobile?.href || href;
  const imgLoading = priority ? "eager" : "lazy";
  const imgFetchPriority = priority ? "high" : undefined;
  const showMobileSplit = Boolean(mobileSrc || mobileKey);
  const mobileSrcFinal = mobile?.src || desktop.src;

  const resolveSrc = (raw: string, targetWidth?: number) => {
    if (!optimizeWidth) return raw;
    return getResizedBannerSrc(raw, {
      width: targetWidth || optimizeWidth,
      quality: optimizeQuality,
    });
  };

  const desktopSrc = resolveSrc(desktop.src, optimizeWidth);
  const mobileResolved = resolveSrc(
    mobileSrcFinal,
    optimizeWidth ? Math.min(optimizeWidth, 720) : undefined,
  );

  const desktopSrcSet =
    optimizeWidth && optimizeWidth >= 960
      ? `${resolveSrc(desktop.src, Math.round(optimizeWidth / 2))} ${Math.round(
          optimizeWidth / 2,
        )}w, ${desktopSrc} ${optimizeWidth}w`
      : undefined;

  const commonImgProps = {
    alt,
    loading: imgLoading as "eager" | "lazy",
    decoding: "async" as const,
    fetchPriority: imgFetchPriority as "high" | undefined,
    sizes,
    width,
    height,
  };

  const images = showMobileSplit ? (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mobileResolved}
        className={`${imageClassName} md:hidden`}
        {...commonImgProps}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={desktopSrc}
        srcSet={desktopSrcSet}
        className={`${imageClassName} hidden md:block`}
        {...commonImgProps}
      />
    </>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={desktopSrc}
      srcSet={desktopSrcSet}
      className={imageClassName}
      {...commonImgProps}
    />
  );

  if (openInNewTab) {
    return (
      <a
        href={resolvedHref}
        target="_blank"
        rel="noopener noreferrer"
        className={className || "block w-full"}
      >
        {images}
      </a>
    );
  }

  return (
    <Link href={resolvedHref} className={className || "block w-full"}>
      {images}
    </Link>
  );
}
