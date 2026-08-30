"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSiteApi } from "@/hooks/use-site-api";
import { getStorageImageUrl } from "@/lib/supabase-storage";

type ManagedBannerProps = {
  desktopKey?: string;
  mobileKey?: string;
  href?: string;
  src: string;
  mobileSrc?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
};

type BannerItem = {
  image_url?: string;
  href?: string | null;
  active?: boolean;
};

export function ManagedBanner({
  desktopKey,
  mobileKey,
  href = "#",
  src,
  mobileSrc,
  alt,
  className,
  imageClassName = "block w-full h-auto",
}: ManagedBannerProps) {
  const { fetchWithSite } = useSiteApi();
  const [desktop, setDesktop] = useState({ src, href });
  const [mobile, setMobile] = useState({ src: mobileSrc || src, href });

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
        const desktopItem = desktopValue?.[0];
        const mobileItem = mobileValue?.[0] || desktopValue?.[1] || desktopItem;
        if (desktopItem) setDesktop(desktopItem);
        if (mobileItem) setMobile(mobileItem);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [fetchWithSite, desktopKey, href, mobileKey, mobileSrc, src]);

  const resolvedHref = desktop.href || mobile.href;
  const desktopImage = getStorageImageUrl(desktop.src, 960);
  const mobileImage = getStorageImageUrl(mobile.src, 768);

  return (
    <Link href={resolvedHref} className={className || "block w-full"}>
      {mobileSrc || mobileKey ? (
        <picture>
          <source media="(max-width: 767px)" srcSet={mobileImage} />
          <img
            src={desktopImage}
            alt={alt}
            className={imageClassName}
            loading="lazy"
          />
        </picture>
      ) : (
        <img
          src={desktopImage}
          alt={alt}
          className={imageClassName}
          loading="lazy"
        />
      )}
    </Link>
  );
}
