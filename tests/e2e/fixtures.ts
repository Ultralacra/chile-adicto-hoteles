import type { APIRequestContext } from "@playwright/test";

type AuthCredentials = {
  email: string;
  password: string;
};

export function getSupabaseCredentials(prefix: string): AuthCredentials | null {
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  return email && password ? { email, password } : null;
}

export async function getSupabaseAccessToken(
  request: APIRequestContext,
  credentials: AuthCredentials,
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para E2E.",
    );
  }

  const response = await request.post(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      data: credentials,
    },
  );
  if (!response.ok()) {
    throw new Error(`No fue posible autenticar el fixture E2E: ${response.status()}`);
  }

  const body = await response.json();
  if (!body.access_token) throw new Error("Supabase no devolvió access_token.");
  return String(body.access_token);
}

export function bearer(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const protectedRequests = [
  { method: "POST", path: "/api/agenda-cultural" },
  { method: "POST", path: "/api/categories" },
  { method: "POST", path: "/api/communes" },
  { method: "POST", path: "/api/communes/test-e2e" },
  { method: "PUT", path: "/api/imagenes-slider/manifest" },
  { method: "POST", path: "/api/media" },
  { method: "POST", path: "/api/media/upload" },
  { method: "POST", path: "/api/posts" },
  { method: "PUT", path: "/api/posts/test-e2e" },
  { method: "DELETE", path: "/api/posts/test-e2e" },
  { method: "POST", path: "/api/posts/test-e2e/images" },
  { method: "PUT", path: "/api/restaurant-slider-mobile" },
  { method: "PUT", path: "/api/slider-destinations" },
  { method: "PUT", path: "/api/slider-images" },
  { method: "PUT", path: "/api/sliders/test-e2e" },
  { method: "POST", path: "/api/sliders/sync" },
] as const;

export const sensitiveReads = [
  "/api/posts?adminSite=santiagoadicto",
  "/api/posts/test-e2e?adminSite=santiagoadicto",
  "/api/posts/search?q=test&adminSite=santiagoadicto",
  "/api/categories?includeHidden=1",
  "/api/communes?includeHidden=1",
  "/api/agenda-cultural?adminSite=santiagoadicto&all=1",
  "/api/sliders/test-e2e?all=1",
] as const;