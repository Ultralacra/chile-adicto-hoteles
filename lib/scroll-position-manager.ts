/**
 * Scroll Position Manager
 * Guarda y restaura la posición de scroll en sessionStorage para mantenerla
 * al navegar hacia atrás con el botón "Volver" inteligente.
 */

const STORAGE_PREFIX = "scroll-pos:";
const STORAGE_TTL_MS = 30 * 60 * 1000; // 30 minutos

interface ScrollPositionEntry {
  y: number;
  savedAt: number;
  // Para páginas con contenido dinámico (como home con infinite scroll)
  extra?: Record<string, any>;
}

export function saveScrollPosition(
  path: string,
  extra?: Record<string, any>,
) {
  if (typeof window === "undefined") return;
  const entry: ScrollPositionEntry = {
    y: window.scrollY,
    savedAt: Date.now(),
    extra,
  };
  try {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${path}`,
      JSON.stringify(entry),
    );
  } catch {
    // Ignorar errores de quota exceeded
  }
}

export function restoreScrollPosition(path: string): {
  y: number;
  extra?: Record<string, any>;
} | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${path}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ScrollPositionEntry;
    if (Date.now() - parsed.savedAt > STORAGE_TTL_MS) {
      clearScrollPosition(path);
      return null;
    }
    return { y: parsed.y, extra: parsed.extra };
  } catch {
    clearScrollPosition(path);
    return null;
  }
}

export function clearScrollPosition(path: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${STORAGE_PREFIX}${path}`);
}

export function clearAllScrollPositions() {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach((k) => sessionStorage.removeItem(k));
}

/**
 * Detecta si la navegación actual fue un "volver atrás" (popstate) o no.
 * Usa performance.getEntriesByType("navigation") si está disponible.
 */
export function isBackNavigation(): boolean {
  if (typeof window === "undefined" || typeof performance === "undefined")
    return false;
  try {
    const entries = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (entries.length > 0) {
      return entries[0].type === "back_forward";
    }
  } catch {
    // Fallback
  }
  return false;
}

/**
 * Guarda la posición del scroll para la página actual antes de
 * que el usuario navegue a otra página.
 * Se usa en un useEffect con un cleanup que guarda la posición.
 */
export function useScrollBeforeUnload(path: string, extra?: Record<string, any>) {
  if (typeof window === "undefined") return;
  const handler = () => {
    saveScrollPosition(path, extra);
  };
  window.addEventListener("beforeunload", handler);
  // También guardar en popstate para cuando el usuario vuelve
  return () => {
    window.removeEventListener("beforeunload", handler);
  };
}
