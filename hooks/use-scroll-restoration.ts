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
  const savedYRef = useRef(0);

  // Guardar posición en cada cambio de scroll (throttled)
  useEffect(() => {
    if (!pathname) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          saveScrollPosition(pathname);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Guardar la posición del scroll antes de que la página cambie
  useEffect(() => {
    return () => {
      if (prevPathname.current && prevPathname.current !== pathname) {
        saveScrollPosition(prevPathname.current);
      }
    };
  }, [pathname]);

  // Guardar periódicamente como fallback
  useEffect(() => {
    if (!pathname) return;
    const interval = setInterval(() => {
      saveScrollPosition(pathname);
    }, 500);
    return () => clearInterval(interval);
  }, [pathname]);

  // Restaurar posición cuando la página se monta
  useEffect(() => {
    if (!pathname) return;
    prevPathname.current = pathname;

    if (isRestoring.current) return;

    const direction = sessionStorage.getItem("nav:direction");
    sessionStorage.removeItem("nav:direction");

    if (direction === "forward") {
      clearScrollPosition(pathname);
      return;
    }

    const saved = restoreScrollPosition(pathname);
    if (!saved || saved.y <= 0) return;

    savedYRef.current = saved.y;

    // Forzar scroll inmediato a la posición guardada antes de renderizar
    window.scrollTo(0, saved.y);

    // Esperar a que las imágenes y contenido dinámico carguen
    const restore = () => {
      isRestoring.current = true;
      // Doble rAF para esperar al siguiente frame de render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Scroll exacto sin animación para precisión absoluta
          window.scrollTo({ top: saved.y, behavior: "instant" });

          // Verificar después de 300ms por si hay imágenes lazy
          setTimeout(() => {
            window.scrollTo({ top: saved.y, behavior: "instant" });
            isRestoring.current = false;
          }, 300);
        });
      });
    };

    // Esperar a que las imágenes carguen para que el layout sea estable
    const images = document.querySelectorAll("img");
    let pendingImages = 0;
    let resolved = false;

    const checkDone = () => {
      if (resolved) return;
      if (pendingImages <= 0) {
        resolved = true;
        restore();
      }
    };

    images.forEach((img) => {
      if (!img.complete) {
        pendingImages++;
        img.addEventListener("load", () => {
          pendingImages--;
          checkDone();
        }, { once: true });
        img.addEventListener("error", () => {
          pendingImages--;
          checkDone();
        }, { once: true });
      }
    });

    // Si no hay imágenes pendientes o ya cargaron, restaurar rápido
    if (pendingImages === 0) {
      resolved = true;
      setTimeout(restore, 50);
    } else {
      // Timeout máximo de 1.5s por si las imágenes nunca cargan
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          restore();
        }
      }, 1500);
    }
  }, [pathname]);
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
