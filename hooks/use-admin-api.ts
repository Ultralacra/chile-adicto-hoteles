import { useSiteContext } from "@/contexts/site-context";
import { useCallback } from "react";
import { supabase } from "@/lib/supabase-client";
import { dispatchAdminAuthError } from "@/lib/admin-auth-events";

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
      if (!urlObj.searchParams.has('adminSite')) {
        urlObj.searchParams.set('adminSite', currentSite);
      }

      const headers = new Headers((options?.headers as HeadersInit) || {});
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
      }

      const response = await fetch(urlObj.toString(), { ...options, headers });
      if (response.status === 401 || response.status === 403) {
        dispatchAdminAuthError(response.status);
      }
      return response;
    },
    [currentSite]
  );

  return { fetchWithSite, currentSite };
}
