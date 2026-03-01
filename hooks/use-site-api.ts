"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cachedFetch, invalidateCache } from "@/lib/api-cache";

/**
 * Construye la URL final inyectando ?previewSite= si corresponde.
 */
function buildUrl(url: string, previewSite: string | null | undefined): string {
  if (!previewSite) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}previewSite=${encodeURIComponent(previewSite)}`;
}

/**
 * Hook para realizar fetch al API desde el frontend con el parámetro previewSite.
 *
 * Expone dos funciones:
 *   - `fetchWithSite(url, opts?)` → fetch normal (sin cache), para escrituras o cuando necesitas frescura total.
 *   - `cachedFetchWithSite(url, opts?, ttlMs?)` → fetch con cache en memoria + deduplicación.
 *     Ideal para datos estables (categorías, comunas, sliders).
 *   - `invalidate(urlOrPattern?)` → limpia la cache (tras crear/editar post, cambiar sitio, etc.)
 */
export function useSiteApi() {
  const searchParams = useSearchParams();
  const previewSite = searchParams?.get("previewSite");

  /** Fetch sin cache (comportamiento original) */
  const fetchWithSite = useCallback(
    async (url: string, options?: RequestInit) => {
      return fetch(buildUrl(url, previewSite), options);
    },
    [previewSite]
  );

  /**
   * Fetch con cache en memoria + deduplicación de requests concurrentes.
   * El resultado se devuelve ya parseado como JSON (no como Response).
   *
   * @param url     Ruta relativa, e.g. "/api/categories?full=1&nav=1"
   * @param options RequestInit (solo se usa si no hay cache hit)
   * @param ttlMs   TTL explícito; si no se pasa, se infiere automáticamente
   */
  const cachedFetchWithSite = useCallback(
    async (url: string, options?: RequestInit, ttlMs?: number): Promise<unknown> => {
      return cachedFetch(buildUrl(url, previewSite), options, ttlMs);
    },
    [previewSite]
  );

  /** Invalida entradas de cache. Sin argumento → limpia todo. */
  const invalidate = useCallback(
    (urlOrPattern?: string | RegExp) => invalidateCache(urlOrPattern),
    []
  );

  return { fetchWithSite, cachedFetchWithSite, invalidate, previewSite };
}
