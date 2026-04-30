import { useSiteContext } from "@/contexts/site-context";
import { useCallback } from "react";

/**
 * Hook personalizado para hacer peticiones API desde el admin
 * que automáticamente agrega el sitio actual a las peticiones
 */
export function useAdminApi() {
  const { currentSite } = useSiteContext();

  const fetchWithSite = useCallback(
    async (url: string, options?: RequestInit) => {
      // Agregar el parámetro adminSite a la URL
      const urlObj = new URL(url, window.location.origin);
      urlObj.searchParams.set('adminSite', currentSite);

      // Incluir x-admin-key si está disponible
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
      const headers = new Headers((options?.headers as HeadersInit) || {});
      if (adminKey) headers.set('x-admin-key', adminKey);

      return fetch(urlObj.toString(), { ...options, headers });
    },
    [currentSite]
  );

  return { fetchWithSite, currentSite };
}
