/**
 * Cache en memoria + deduplicación de requests in-flight para el frontend.
 *
 * Problema que resuelve:
 *   Varios componentes en la misma página (header, nav, footer, etc.) hacen
 *   fetch al mismo endpoint (e.g. /api/categories) de forma independiente.
 *   Cada uno genera un request HTTP separado.
 *
 * Solución:
 *   1. **Request coalescing** – Si ya hay un fetch en curso para la misma URL,
 *      devolvemos la misma Promise en vez de lanzar otro fetch.
 *   2. **TTL cache** – El JSON resultante se cachea N ms. Mientras sea válido,
 *      devolvemos el dato cacheado sin hit a la red.
 *
 * Se usa desde `useSiteApi().cachedFetch(url, ttlMs?)`.
 */

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

/** Respuestas cacheadas por URL completa */
const cache = new Map<string, CacheEntry>();

/** Requests activos (in-flight) para deduplicación */
const inflight = new Map<string, Promise<unknown>>();

/** TTL por defecto: 5 minutos (datos estables como categorías/comunas) */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/**
 * Patrones de URL con TTL personalizado.
 * Si la URL coincide, se usa ese TTL en vez del default.
 * Se evalúan en orden; el primero que haga match gana.
 */
const TTL_RULES: Array<{ pattern: RegExp; ttl: number }> = [
  // Categorías y comunas casi nunca cambian → 10 min
  { pattern: /\/api\/categories/, ttl: 10 * 60 * 1000 },
  { pattern: /\/api\/communes/,   ttl: 10 * 60 * 1000 },
  // Sliders cambian poco → 5 min
  { pattern: /\/api\/sliders\//,  ttl: 5 * 60 * 1000 },
  { pattern: /\/api\/slider-images/, ttl: 5 * 60 * 1000 },
  { pattern: /\/api\/restaurant-slider-mobile/, ttl: 5 * 60 * 1000 },
  // Posts (lista) → 2 min para mantener algo de frescura
  { pattern: /\/api\/posts(?:\?|$)/, ttl: 2 * 60 * 1000 },
];

function resolveTtl(url: string, explicitTtl?: number): number {
  if (explicitTtl !== undefined) return explicitTtl;
  for (const rule of TTL_RULES) {
    if (rule.pattern.test(url)) return rule.ttl;
  }
  return DEFAULT_TTL_MS;
}

/**
 * Fetch con cache en memoria y deduplicación de requests concurrentes.
 *
 * @param url       URL completa (ya con previewSite si aplica)
 * @param options   RequestInit estándar (se ignora para la cache key; solo se usa en el fetch subyacente)
 * @param ttlMs     TTL explícito en ms. Si no se pasa, se infiere de TTL_RULES.
 * @returns         El JSON parseado, cacheado si aún es válido.
 */
export async function cachedFetch(
  url: string,
  options?: RequestInit,
  ttlMs?: number,
): Promise<unknown> {
  const ttl = resolveTtl(url, ttlMs);

  // 1. ¿Hay respuesta cacheada vigente?
  const cached = cache.get(url);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  // 2. ¿Hay request in-flight? → coalescemos
  const existing = inflight.get(url);
  if (existing) return existing;

  // 3. Lanzar fetch real
  const promise = (async () => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) return null;
      const json = await res.json();
      // Guardar en cache
      cache.set(url, { data: json, expiresAt: Date.now() + ttl });
      return json;
    } finally {
      inflight.delete(url);
    }
  })();

  inflight.set(url, promise);
  return promise;
}

/**
 * Invalida la cache para una URL exacta, o para todas las que coincidan con un patrón.
 * Útil tras crear/editar un post (invalidar `/api/posts`), o tras cambiar de sitio.
 */
export function invalidateCache(urlOrPattern?: string | RegExp): void {
  if (!urlOrPattern) {
    // Sin argumento → limpiar todo
    cache.clear();
    return;
  }
  if (typeof urlOrPattern === "string") {
    cache.delete(urlOrPattern);
    return;
  }
  // RegExp
  for (const key of Array.from(cache.keys())) {
    if (urlOrPattern.test(key)) cache.delete(key);
  }
}
