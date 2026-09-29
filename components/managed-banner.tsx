"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSiteApi } from "@/hooks/use-site-api";

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
  hideFallbackWhileLoading = false,
  openInNewTab = false,
}: ManagedBannerProps) {
  const { fetchWithSite } = useSiteApi();
  const [desktop, setDesktop] = useState({ src, href });
  const [mobile, setMobile] = useState({ src: mobileSrc || src, href });
  const [isLoading, setIsLoading] = useState(
    hideFallbackWhileLoading && Boolean(desktopKey || mobileKey),
  );
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
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
        const desktopItem = desktopValue?.[itemIndex];
        const mobileFromKey = mobileKey
          ? mobileValue?.[itemIndex]
          : undefined;

        if (desktopItem) setDesktop(desktopItem);

        if (mobileFromKey) {
          setMobile(mobileFromKey);
        } else if (mobileSrc) {
          // Mantener la imagen móvil local; solo sincronizar href del back
          if (desktopItem?.href) {
            setMobile((prev) => ({ ...prev, href: desktopItem.href }));
          }
        } else if (desktopItem) {
          setMobile(desktopItem);
        }

        if (
          hideFallbackWhileLoading &&
          !desktopItem &&
          !mobileFromKey &&
          itemIndex > 0
        ) {
          setMissing(true);
        }
        setIsLoading(false);
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
    hideFallbackWhileLoading,
  ]);

  if (isLoading || missing) return null;

  const resolvedHref = desktop.href || mobile.href;
  const images =
    mobileSrc || mobileKey ? (
      <>
        <img
          src={mobile.src}
          alt={alt}
          className={`${imageClassName} md:hidden`}
          loading="lazy"
        />
        <img
          src={desktop.src}
          alt={alt}
          className={`${imageClassName} hidden md:block`}
          loading="lazy"
        />
      </>
    ) : (
      <img
        src={desktop.src}
        alt={alt}
        className={imageClassName}
        loading="lazy"
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
