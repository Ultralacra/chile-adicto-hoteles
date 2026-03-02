import { NextResponse } from "next/server";
import { isPostCurrentlyPublished } from "@/lib/post-publication";
import { getCurrentSiteId } from "@/lib/site-utils";
import { ensureLegacyPostShape } from "@/lib/post-response-shape";

function envOrNull(name: string) {
  const v = process.env[name];
  return v && v.length > 0 ? v : null;
}

async function fetchFromSupabase(path: string, init?: RequestInit) {
  const base = envOrNull("NEXT_PUBLIC_SUPABASE_URL");
  const anon = envOrNull("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!base || !anon) return null;
  const url = `${base}/rest/v1${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      Prefer: "return=representation",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  return res.json();
}

function mapRowToLegacy(row: any) {
  const images = Array.isArray(row.images)
    ? row.images.slice().sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)).map((x: any) => x.url)
    : [];
  const locs = Array.isArray(row.locations)
    ? row.locations.slice().sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)).map((l: any) => ({
        label: l.label || null,
        address: l.address || null,
        hours: l.hours || null,
        website: l.website || null,
      website_display: l.website_display ?? l.websiteDisplay ?? null,
        instagram: l.instagram || null,
      instagram_display: l.instagram_display ?? l.instagramDisplay ?? null,
        reservationLink: l.reservation_link || null,
        reservationPolicy: l.reservation_policy || null,
        interestingFact: l.interesting_fact || null,
        email: l.email || null,
        phone: l.phone || null,
      }))
    : [];
  const trEs = (row.translations || []).find((t: any) => t.lang === "es") || {};
  const trEn = (row.translations || []).find((t: any) => t.lang === "en") || {};
  const useful = Array.isArray(row.useful) ? row.useful : [];
  const uEs = useful.find((u: any) => (u.lang || "").toLowerCase() === "es") || {};
  const uEn = useful.find((u: any) => (u.lang || "").toLowerCase() === "en") || {};
  const categories = Array.isArray(row.category_links)
    ? row.category_links.map((r: any) => r.category?.label_es || r.category?.slug).filter(Boolean)
    : [];
  const communes = Array.isArray(row.communes_links)
    ? row.communes_links
        .map((r: any) => {
          const label = String(r?.commune?.label || "").trim();
          const slug = String(r?.commune_slug || r?.commune?.slug || "").trim();
          return label || slug;
        })
        .filter(Boolean)
    : [];
  const websitePublic = row.website_public ?? row.websitePublic ?? null;
  return {
    slug: row.slug,
    site: row.site || null,
    publicationStatus: row.publication_status || "published",
    publishStartAt: row.publish_start_at || null,
    publishEndAt: row.publish_end_at || null,
    publicationEndsAt: row.publish_end_at || null,
    featuredImage: row.featured_image || null,
    website: row.website || null,
    websitePublic,
    websitepublic: websitePublic,
    website_public: websitePublic,
    instagram: row.instagram || null,
    website_display: row.website_display ?? row.websiteDisplay ?? null,
    instagram_display: row.instagram_display ?? row.instagramDisplay ?? null,
    email: row.email || null,
    phone: row.phone || null,
    photosCredit: row.photos_credit || null,
    address: row.address || null,
    hours: row.hours || null,
    reservationLink: row.reservation_link || null,
    reservationPolicy: row.reservation_policy || null,
    interestingFact: row.interesting_fact || null,
    images,
    locations: locs,
    es: {
      name: trEs.name || "",
      subtitle: trEs.subtitle || "",
      description: Array.isArray(trEs.description) ? trEs.description : [],
      infoHtml: trEs.info_html || null,
      infoHtmlNew: uEs.html || null,
      category: trEs.category || null,
    },
    en: {
      name: trEn.name || "",
      subtitle: trEn.subtitle || "",
      description: Array.isArray(trEn.description) ? trEn.description : [],
      infoHtml: trEn.info_html || null,
      infoHtmlNew: uEn.html || null,
      category: trEn.category || null,
    },
    categories,
    communes,
  };
}

async function fetchWithPublicationFallback(pathWithSelectBase: string) {
  try {
    return await fetchFromSupabase(pathWithSelectBase);
  } catch (err: any) {
    const msg = String(err?.message || "");
    const missingPublicationColumn =
      /Could not find the '(publication_status|publish_start_at|publish_end_at)' column/i.test(msg) ||
      /column\s+[^.]*\.?(publication_status|publish_start_at|publish_end_at)\s+does not exist/i.test(msg);
    if (!missingPublicationColumn) throw err;
    const fallback = pathWithSelectBase
      .replace("publication_status,", "")
      .replace("publish_start_at,", "")
      .replace("publish_end_at,", "")
      .replace("publication_status%2C", "")
      .replace("publish_start_at%2C", "")
      .replace("publish_end_at%2C", "");
    return await fetchFromSupabase(fallback);
  }
}

// GET /api/posts/by-category/[slug]
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const ctx = (await (params as any)) as { slug?: string };
    const categorySlug = String(ctx?.slug || "").trim();

    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const siteId = await getCurrentSiteId(req);
    const select =
      "slug,publication_status,publish_start_at,publish_end_at,featured_image,website,website_public,instagram,website_display,instagram_display,email,phone,photos_credit,address,hours,reservation_link,reservation_policy,interesting_fact,site,images:post_images(url,position),locations:post_locations(*),translations:post_translations(*),useful:post_useful_info(*),category_links:post_category_map(category:categories(slug,label_es,label_en)),communes_links:post_communes(commune_slug,commune:communes(slug,label))";
    let rows: any[] | null = await fetchWithPublicationFallback(`/posts?select=${encodeURIComponent(select)}&site=eq.${siteId}`);
    if (!rows) return NextResponse.json([], { status: 200 });

    // Filtrar por slug de categoría. Fallback: si no hay mapeo, usar category de traducciones.
    const slugTarget = categorySlug.toLowerCase().trim();
    const matchesTranslationCategory = (r: any) => {
      const translations = Array.isArray(r.translations) ? r.translations : [];
      return translations.some((t: any) => {
        if (!t?.category) return false;
        const cat = String(t.category).toLowerCase().trim();
        // Normalizar espacios a guiones para casos futuros ("Alta Cocina" -> "alta-cocina")
        const catSlug = cat.replace(/\s+/g, "-");
        return cat === slugTarget || catSlug === slugTarget;
      });
    };
    rows = rows.filter((r: any) => {
      const mapped = (r.category_links || []).some((c: any) => (c.category?.slug || "") === slugTarget);
      return mapped || matchesTranslationCategory(r);
    });

    const qc = q.trim().toLowerCase();
    if (qc) {
      rows = rows.filter((r: any) => {
        const trEs = (r.translations || []).find((t: any) => t.lang === "es") || {};
        const trEn = (r.translations || []).find((t: any) => t.lang === "en") || {};
        const fields = [r.slug, trEs.name, trEn.name, trEs.subtitle, trEn.subtitle, r.address, r.website_display, r.instagram_display]
          .filter(Boolean)
          .map((x: string) => x.toLowerCase());
        return fields.some((f: string) => f.includes(qc));
      });
    }

    const mapped = rows
      .map((row) => ensureLegacyPostShape(mapRowToLegacy(row)))
      .filter((post: any) => isPostCurrentlyPublished(post));
    return NextResponse.json(mapped, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/posts/by-category/[slug]] error", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
