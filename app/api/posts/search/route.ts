import { NextResponse } from "next/server";
import { isPostCurrentlyPublished } from "@/lib/post-publication";
import { ensureLegacyPostShape } from "@/lib/post-response-shape";
import { getCurrentSiteId } from "@/lib/site-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function envOrNull(name: string) {
  const v = process.env[name];
  return v && v.length > 0 ? v : null;
}

async function anonRest(path: string) {
  const base = envOrNull("NEXT_PUBLIC_SUPABASE_URL");
  const anon = envOrNull("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!base || !anon) return null;
  const url = `${base}/rest/v1${path}`;
  const res = await fetch(url, {
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false as const, status: res.status, text };
  }
  const json = await res.json();
  return { ok: true as const, items: Array.isArray(json) ? json : [] };
}

// GET /api/posts/search?q=...&limit=30
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = String(url.searchParams.get("q") || "").trim().toLowerCase();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50) || 50, 5), 100);
  const adminSite = url.searchParams.get("adminSite");

  let siteId = "santiagoadicto";
  if (adminSite === "chileadicto" || adminSite === "santiagoadicto") {
    siteId = adminSite;
  } else {
    try {
      siteId = await getCurrentSiteId(req);
    } catch {}
  }

  const select = "slug,featured_image,publication_status,publish_start_at,publish_end_at,site,translations:post_translations(lang,name)";

  let basePath = `/posts?select=${encodeURIComponent(select)}&site=eq.${siteId}&order=slug.asc&limit=500`;

  const result = await anonRest(basePath);
  if (!result) return NextResponse.json({ items: [] }, { status: 200 });
  if (!result.ok) {
    return NextResponse.json(
      { items: [], warning: `supabase_error_${result.status}`, message: result.text },
      { status: 200 }
    );
  }

  const isAdminRequest = !!adminSite;

  const mapped = result.items
    .map((p: any) => {
      const trEs = (p.translations || []).find((t: any) => t.lang === "es") || {};
      const trEn = (p.translations || []).find((t: any) => t.lang === "en") || {};
      return {
        slug: String(p.slug || ""),
        site: p.site || null,
        featuredImage: p.featured_image || null,
        publicationStatus: p.publication_status || "published",
        publishStartAt: p.publish_start_at || null,
        publishEndAt: p.publish_end_at || null,
        publicationEndsAt: p.publish_end_at || null,
        es: {
          name: trEs.name || "",
          subtitle: "",
          description: [],
          infoHtml: null,
          infoHtmlNew: null,
          category: null,
        },
        en: {
          name: trEn.name || "",
          subtitle: "",
          description: [],
          infoHtml: null,
          infoHtmlNew: null,
          category: null,
        },
        name_es: trEs.name || "",
        name_en: trEn.name || "",
      };
    })
    .map((p: any) => ({
      ...ensureLegacyPostShape(p),
      name_es: p.name_es || "",
      name_en: p.name_en || "",
    }))
    .filter((p: any) => p.slug)
    .filter((p: any) => (isAdminRequest ? true : isPostCurrentlyPublished(p)));

  if (q && q.length >= 1) {
    const qLower = q.toLowerCase();
    const filtered = mapped.filter((p: any) => {
      const nameEs = (p.name_es || "").toLowerCase();
      const nameEn = (p.name_en || "").toLowerCase();
      const slug = (p.slug || "").toLowerCase();
      return nameEs.startsWith(qLower) || nameEn.startsWith(qLower) || slug.startsWith(qLower);
    });
    return NextResponse.json({ items: filtered.slice(0, 50) }, { status: 200 });
  }

  return NextResponse.json({ items: mapped.slice(0, 50) }, { status: 200 });
}