"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  saveScrollPosition,
  restoreScrollPosition,
  clearScrollPosition,
} from "@/lib/scroll-position-manager";

export function useScrollRestoration() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const isRestoring = useRef(false);

  // Guardar la posición del scroll antes de que la página cambie
  useEffect(() => {
    return () => {
      if (prevPathname.current && prevPathname.current !== pathname) {
        saveScrollPosition(prevPathname.current);
      }
    };
  }, [pathname]);

  // Guardar periódicamente mientras el usuario está en la página
  useEffect(() => {
    if (!pathname) return;
    const interval = setInterval(() => {
      saveScrollPosition(pathname);
    }, 2000);
    return () => clearInterval(interval);
  }, [pathname]);

  // Restaurar posición cuando la página se monta
  useEffect(() => {
    if (!pathname) return;
    prevPathname.current = pathname;

    // Evitar múltiples restauraciones simultáneas
    if (isRestoring.current) return;

    // Verificar si la navegación fue hacia atrás (botón Volver)
    const direction = sessionStorage.getItem("nav:direction");
    sessionStorage.removeItem("nav:direction");

    // Si la dirección es "forward" (navegación normal hacia adelante),
    // limpiar cualquier posición guardada para esta página
    if (direction === "forward") {
      clearScrollPosition(pathname);
      return;
    }

    const saved = restoreScrollPosition(pathname);
    if (!saved || saved.y <= 0) return;

    // Esperar a que la página esté completamente renderizada
    const timer = setTimeout(() => {
      isRestoring.current = true;
      smoothScrollTo(saved.y, 400, () => {
        isRestoring.current = false;
      });
    }, 80);

    return () => clearTimeout(timer);
  }, [pathname]);

  /**
   * Animación de scroll suave manual con requestAnimationFrame.
   * Más confiable que window.scrollTo({ behavior: "smooth" }) durante la carga de página.
   */
  function smoothScrollTo(
    targetY: number,
    duration: number = 400,
    onComplete?: () => void,
  ) {
    const startY = window.scrollY;
    const deltaY = targetY - startY;
    const startTime = performance.now();

    // Si ya estamos cerca, no animar
    if (Math.abs(deltaY) < 5) {
      onComplete?.();
      return;
    }

    function easeInOutCubic(t: number): number {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function tick(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startY + deltaY * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Asegurar posición final exacta
        window.scrollTo(0, targetY);
        onComplete?.();
      }
    }

    requestAnimationFrame(tick);
  }
}

export function useScrollRestorationForElement(
  elementRef: React.RefObject<HTMLElement | null>,
  key: string,
) {
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const saved = restoreScrollPosition(key);
    if (saved && saved.y > 0) {
      el.scrollTop = saved.y;
    }

    return () => {
      saveScrollPosition(key, { scrollTop: el.scrollTop });
    };
  }, [elementRef, key]);
}
