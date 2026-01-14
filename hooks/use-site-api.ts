"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Hook para realizar fetch al API desde el frontend con el parámetro previewSite.
 * Lee el query parameter ?previewSite= y lo agrega automáticamente a todas las llamadas.
 */
export function useSiteApi() {
  const searchParams = useSearchParams();
  const previewSite = searchParams?.get("previewSite");

  const fetchWithSite = useCallback(
    async (url: string, options?: RequestInit) => {
      // Si hay previewSite, agregarlo a la URL
      let finalUrl = url;
      if (previewSite) {
        const separator = url.includes("?") ? "&" : "?";
        finalUrl = `${url}${separator}previewSite=${encodeURIComponent(previewSite)}`;
      }

      return fetch(finalUrl, options);
    },
    [previewSite]
  );

  return { fetchWithSite, previewSite };
}
