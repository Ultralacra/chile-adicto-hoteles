"use client";

import { useEffect } from "react";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";

export function ScrollRestorationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useScrollRestoration();

  // Interceptar clicks en enlaces internos para marcar la navegación como "forward"
  // Así el hook de scroll restoration no restaurará la posición al navegar hacia adelante
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Solo enlaces internos (no externos, no anchors, no javascript)
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      // Marcar como navegación hacia adelante solo si no está ya marcado como "back"
      if (sessionStorage.getItem("nav:direction") !== "back") {
        sessionStorage.setItem("nav:direction", "forward");
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return <>{children}</>;
}
