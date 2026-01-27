import { NextResponse } from "next/server";
import { getCurrentSiteId } from "@/lib/site-utils";

function envOrNull(name: string) {
  const v = process.env[name];
  return v && v.length > 0 ? v : null;
}

function canUseAnon() {
  return !!envOrNull("NEXT_PUBLIC_SUPABASE_URL") && !!envOrNull("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

function canUseService() {
  return !!envOrNull("NEXT_PUBLIC_SUPABASE_URL") && !!envOrNull("SUPABASE_SERVICE_ROLE_KEY");
}

async function supabaseRest(path: string, init?: RequestInit, mode: "anon" | "service" = "anon") {
  const base = envOrNull("NEXT_PUBLIC_SUPABASE_URL");
  const anon = envOrNull("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const service = envOrNull("SUPABASE_SERVICE_ROLE_KEY");
  if (!base) throw new Error("NEXT_PUBLIC_SUPABASE_URL no configurado");

  const token = mode === "service" ? service : anon;
  if (!token) {
    throw new Error(
      mode === "service"
        ? "SUPABASE_SERVICE_ROLE_KEY no configurado"
        : "NEXT_PUBLIC_SUPABASE_ANON_KEY no configurado"
    );
  }

  const url = `${base}/rest/v1${path}`;
  const method = (init?.method || "GET").toUpperCase();
  const hasBody = !!init?.body;
  const userHeaders = { ...(init?.headers || {}) } as Record<string, string>;
  const hasContentType = Object.keys(userHeaders).some((h) => h.toLowerCase() === "content-type");
  const headers: Record<string, string> = {
    apikey: token,
    Authorization: `Bearer ${token}`,
    Prefer: "return=representation",
    ...userHeaders,
  };
  if (hasBody && method !== "GET" && !hasContentType) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function GET(req: Request) {
  try {
    const siteId = await getCurrentSiteId(req);

    if (!canUseAnon() && !canUseService()) {
      return NextResponse.json({ sets: [] }, { status: 200 });
    }

    const rows = (await supabaseRest(
      `/sliders?site=eq.${encodeURIComponent(siteId)}&select=set_key,image_url,href,position,active,lang`,
      undefined,
      canUseService() ? "service" : "anon"
    )) as any[];

    const map = new Map();
    for (const r of Array.isArray(rows) ? rows : []) {
      const key = String(r.set_key || "").trim();
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }

    const sets = Array.from(map.entries()).map(([key, items]) => ({
      key,
      count: Array.isArray(items) ? items.length : 0,
      sample: Array.isArray(items) ? items.find((it: any) => it.image_url)?.image_url || null : null,
    }));

    return NextResponse.json({ sets }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ sets: [], error: String(err?.message || err) }, { status: 500 });
  }
}
