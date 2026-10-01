import { NextResponse } from "next/server";
import { adminAuthResponse, requireSuperadmin } from "@/lib/server-auth";
import { getCurrentSiteId } from "@/lib/site-utils";
import {
  getMediaListCache,
  invalidateMediaListCache,
  MEDIA_CACHE_MS,
  setMediaListCache,
  sortMediaUrlsNewestFirst,
} from "@/lib/media-list-cache";

export const runtime = "nodejs";

function envOrNull(name: string) {
  const v = process.env[name];
  return v && v.length > 0 ? v : null;
}

function canUseAnon() {
  return (
    !!envOrNull("NEXT_PUBLIC_SUPABASE_URL") &&
    !!envOrNull("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

function canUseService() {
  return (
    !!envOrNull("NEXT_PUBLIC_SUPABASE_URL") &&
    !!envOrNull("SUPABASE_SERVICE_ROLE_KEY")
  );
}

async function supabaseRest(
  path: string,
  init?: RequestInit,
  mode: "anon" | "service" = "anon",
) {
  const base = envOrNull("NEXT_PUBLIC_SUPABASE_URL");
  const anon = envOrNull("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const service = envOrNull("SUPABASE_SERVICE_ROLE_KEY");
  if (!base) throw new Error("NEXT_PUBLIC_SUPABASE_URL no configurado");

  const token = mode === "service" ? service : anon;
  if (!token) {
    throw new Error(
      mode === "service"
        ? "SUPABASE_SERVICE_ROLE_KEY no configurado"
        : "NEXT_PUBLIC_SUPABASE_ANON_KEY no configurado",
    );
  }

  const url = `${base}/rest/v1${path}`;
  const method = (init?.method || "GET").toUpperCase();
  const hasBody = !!init?.body;
  const userHeaders = { ...(init?.headers || {}) } as Record<string, string>;
  const hasContentType = Object.keys(userHeaders).some(
    (h) => h.toLowerCase() === "content-type",
  );
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

function clampInt(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
) {
  const n = value == null ? NaN : Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function getMediaName(url: string) {
  const clean = String(url || "").split("#")[0].split("?")[0];
  const last = clean.split("/").pop() || clean;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

function encodeStoragePath(path: string) {
  return String(path || "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function getStorageObjectFromUrl(rawUrl: string) {
  try {
    const u = new URL(String(rawUrl || "").trim());
    const parts = u.pathname.split("/").filter(Boolean);
    const objectIndex = parts.findIndex((p) => p === "object");
    if (objectIndex < 0) return null;
    const mode = parts[objectIndex + 1];
    const bucketIndex = ["public", "authenticated", "sign"].includes(mode)
      ? objectIndex + 2
      : objectIndex + 1;
    const bucket = parts[bucketIndex];
    const pathParts = parts.slice(bucketIndex + 1);
    if (!bucket || pathParts.length === 0) return null;
    return { bucket, path: pathParts.map(decodeURIComponent).join("/") };
  } catch {
    return null;
  }
}

async function deleteStorageObject(bucket: string, path: string) {
  const base = envOrNull("NEXT_PUBLIC_SUPABASE_URL");
  const service = envOrNull("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !service) return false;
  const res = await fetch(
    `${base}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`,
    {
      method: "DELETE",
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
      },
      cache: "no-store",
    },
  );
  if (res.status === 404) return false;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storage delete error ${res.status}: ${text}`);
  }
  return true;
}

function chunkArray<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function buildMediaUrlList(siteId: string, mode: "anon" | "service") {
  const now = Date.now();
  const cached = getMediaListCache(siteId);
  if (cached && now - cached.ts < MEDIA_CACHE_MS) {
    return cached.urls;
  }

  const createdAtByUrl = new Map<string, string>();
  const urls = new Set<string>();

  const posts: any[] =
    (await supabaseRest(
      `/posts?site=eq.${encodeURIComponent(siteId)}&select=id,featured_image&limit=5000`,
      undefined,
      mode,
    ).catch(() => [])) || [];

  for (const p of Array.isArray(posts) ? posts : []) {
    const u = String(p?.featured_image || "").trim();
    if (u) urls.add(u);
  }

  const postIds = (Array.isArray(posts) ? posts : [])
    .map((p) => p?.id)
    .filter((id) => id != null);
  for (const chunk of chunkArray(postIds, 80)) {
    if (chunk.length === 0) continue;
    const inList = chunk.join(",");
    const rows: any[] =
      (await supabaseRest(
        `/post_images?post_id=in.(${inList})&select=url&limit=10000`,
        undefined,
        mode,
      ).catch(() => [])) || [];
    for (const r of Array.isArray(rows) ? rows : []) {
      const u = String(r?.url || "").trim();
      if (u) urls.add(u);
    }
  }

  const sliders: any[] =
    (await supabaseRest(
      `/sliders?site=eq.${encodeURIComponent(siteId)}&select=image_url&limit=10000`,
      undefined,
      mode,
    ).catch(() => [])) || [];
  for (const r of Array.isArray(sliders) ? sliders : []) {
    const u = String(r?.image_url || "").trim();
    if (u) urls.add(u);
  }

  // Tabla media filtrada por sitio (si existe columna site)
  try {
    const mediaTable: any[] =
      (await supabaseRest(
        `/media?site=eq.${encodeURIComponent(siteId)}&select=url,created_at&order=created_at.desc&limit=10000`,
        undefined,
        mode,
      )) || [];
    for (const r of Array.isArray(mediaTable) ? mediaTable : []) {
      const u = String(r?.url || "").trim();
      if (!u) continue;
      urls.add(u);
      if (r?.created_at) createdAtByUrl.set(u, String(r.created_at));
    }
  } catch {
    // Sin columna site: incluir solo URLs con path del sitio
    try {
      const mediaTable: any[] =
        (await supabaseRest(
          `/media?select=url,created_at&order=created_at.desc&limit=10000`,
          undefined,
          mode,
        )) || [];
      for (const r of Array.isArray(mediaTable) ? mediaTable : []) {
        const u = String(r?.url || "").trim();
        if (!u) continue;
        if (
          !u.includes(`/uploads/${siteId}/`) &&
          !u.includes(`/banners/${siteId}/`)
        ) {
          continue;
        }
        urls.add(u);
        if (r?.created_at) createdAtByUrl.set(u, String(r.created_at));
      }
    } catch {
      // sin tabla media
    }
  }

  const list = sortMediaUrlsNewestFirst(Array.from(urls), createdAtByUrl);
  setMediaListCache(siteId, list);
  return list;
}

type UsageItem = {
  url: string;
  posts: Array<{ slug: string; name?: string | null }>;
  sliders: Array<{ set_key: string; lang?: string | null }>;
};

async function getUsageForUrls(
  siteId: string,
  urls: string[],
  mode: "anon" | "service",
): Promise<UsageItem[]> {
  const cleanUrls = Array.from(
    new Set(urls.map((u) => String(u || "").trim()).filter(Boolean)),
  );
  if (cleanUrls.length === 0) return [];

  const results: UsageItem[] = cleanUrls.map((url) => ({
    url,
    posts: [],
    sliders: [],
  }));
  const byUrl = new Map(results.map((r) => [r.url, r]));

  for (const chunk of chunkArray(cleanUrls, 40)) {
    const inList = chunk.map((u) => `"${u.replace(/"/g, '\\"')}"`).join(",");

    const [featuredRows, imageRows, sliderRows] = await Promise.all([
      supabaseRest(
        `/posts?site=eq.${encodeURIComponent(siteId)}&featured_image=in.(${inList})&select=slug,featured_image,translations:post_translations(lang,name)`,
        undefined,
        mode,
      ).catch(() => []),
      supabaseRest(
        `/post_images?url=in.(${inList})&select=url,post:posts!inner(slug,site,translations:post_translations(lang,name))`,
        undefined,
        mode,
      ).catch(() => []),
      supabaseRest(
        `/sliders?site=eq.${encodeURIComponent(siteId)}&image_url=in.(${inList})&select=image_url,set_key,lang`,
        undefined,
        mode,
      ).catch(() => []),
    ]);

    for (const row of Array.isArray(featuredRows) ? featuredRows : []) {
      const url = String(row?.featured_image || "").trim();
      const item = byUrl.get(url);
      if (!item) continue;
      const slug = String(row?.slug || "").trim();
      if (!slug) continue;
      const tr = Array.isArray(row?.translations) ? row.translations : [];
      const es = tr.find((t: any) => t?.lang === "es");
      const name = String(es?.name || tr[0]?.name || slug);
      if (!item.posts.some((p) => p.slug === slug)) {
        item.posts.push({ slug, name });
      }
    }

    for (const row of Array.isArray(imageRows) ? imageRows : []) {
      const url = String(row?.url || "").trim();
      const item = byUrl.get(url);
      if (!item) continue;
      const post = row?.post;
      if (!post || String(post.site || "") !== siteId) continue;
      const slug = String(post.slug || "").trim();
      if (!slug) continue;
      const tr = Array.isArray(post.translations) ? post.translations : [];
      const es = tr.find((t: any) => t?.lang === "es");
      const name = String(es?.name || tr[0]?.name || slug);
      if (!item.posts.some((p) => p.slug === slug)) {
        item.posts.push({ slug, name });
      }
    }

    for (const row of Array.isArray(sliderRows) ? sliderRows : []) {
      const url = String(row?.image_url || "").trim();
      const item = byUrl.get(url);
      if (!item) continue;
      const setKey = String(row?.set_key || "").trim();
      if (!setKey) continue;
      if (!item.sliders.some((s) => s.set_key === setKey && s.lang === row?.lang)) {
        item.sliders.push({
          set_key: setKey,
          lang: row?.lang ? String(row.lang) : null,
        });
      }
    }
  }

  return results;
}

export async function GET(req: Request) {
  try {
    if (!canUseAnon() && !canUseService()) {
      return NextResponse.json(
        { urls: [], total: 0, warning: "supabase_not_configured" },
        { status: 200 },
      );
    }

    const siteId = await getCurrentSiteId(req);
    const url = new URL(req.url);
    if (url.searchParams.get("refresh") === "1") {
      invalidateMediaListCache(siteId);
    }
    const hasPagination =
      url.searchParams.has("limit") || url.searchParams.has("offset");
    const limit = clampInt(url.searchParams.get("limit"), 120, 20, 500);
    const offset = clampInt(url.searchParams.get("offset"), 0, 0, 1_000_000);

    const mode: "anon" | "service" = canUseService() ? "service" : "anon";
    const full = await buildMediaUrlList(siteId, mode);

    const q = String(url.searchParams.get("q") || "")
      .trim()
      .toLowerCase();
    const list = !q
      ? full
      : full.filter((u) => {
          const urlLower = String(u || "").toLowerCase();
          const nameLower = getMediaName(u).toLowerCase();
          return urlLower.includes(q) || nameLower.includes(q);
        });

    const total = list.length;
    if (!hasPagination) {
      return NextResponse.json(
        {
          urls: list,
          total,
          site: siteId,
          limit: total,
          offset: 0,
          nextOffset: null,
        },
        { status: 200 },
      );
    }

    const page = list.slice(offset, offset + limit);
    return NextResponse.json(
      {
        urls: page,
        total,
        site: siteId,
        limit,
        offset,
        nextOffset: offset + page.length < total ? offset + page.length : null,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        urls: [],
        total: 0,
        error: "internal_error",
        message: String(err?.message || err),
      },
      { status: 200 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperadmin(req);
    const siteId = await getCurrentSiteId(req);
    const body = await req.json();

    // Preview de asociaciones antes de borrar
    if (body?.action === "usage") {
      const urls = Array.isArray(body?.urls)
        ? body.urls.map((u: any) => String(u).trim()).filter(Boolean)
        : [];
      const mode: "anon" | "service" = canUseService() ? "service" : "anon";
      const items = await getUsageForUrls(siteId, urls, mode);
      return NextResponse.json({ ok: true, site: siteId, items }, { status: 200 });
    }

    const single = body?.url ? [String(body.url).trim()] : [];
    const many = Array.isArray(body?.urls)
      ? body.urls.map((u: any) => String(u).trim())
      : [];
    const urls = [...single, ...many].filter(Boolean);
    if (urls.length === 0) {
      return NextResponse.json(
        { ok: false, error: "url_requerida" },
        { status: 400 },
      );
    }

    if (!canUseService()) {
      return NextResponse.json(
        { ok: true, urls, warning: "service_role_missing" },
        { status: 201 },
      );
    }

    try {
      const payload = urls.map((u) => ({ url: u, site: siteId }));
      await supabaseRest(
        `/media?on_conflict=url`,
        {
          method: "POST",
          headers: {
            Prefer: "return=representation,resolution=merge-duplicates",
          },
          body: JSON.stringify(payload),
        },
        "service",
      );
    } catch {
      try {
        const payload = urls.map((u) => ({ url: u }));
        await supabaseRest(
          `/media?on_conflict=url`,
          {
            method: "POST",
            headers: {
              Prefer: "return=representation,resolution=merge-duplicates",
            },
            body: JSON.stringify(payload),
          },
          "service",
        );
      } catch {
        // tabla no existe: no bloqueamos
      }
    }

    invalidateMediaListCache(siteId);
    return NextResponse.json({ ok: true, urls, site: siteId }, { status: 201 });
  } catch (err: any) {
    const authResponse = adminAuthResponse(err);
    if (authResponse) return authResponse;
    console.error("[POST /api/media] error", err);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireSuperadmin(req);
    if (!canUseService()) {
      return NextResponse.json(
        { ok: false, error: "service_role_missing" },
        { status: 500 },
      );
    }

    const siteId = await getCurrentSiteId(req);
    const body = await req.json().catch(() => ({}));
    const urls = Array.isArray(body?.urls)
      ? body.urls.map((u: any) => String(u).trim()).filter(Boolean)
      : [];
    if (urls.length === 0) {
      return NextResponse.json(
        { ok: false, error: "urls_requeridas" },
        { status: 400 },
      );
    }

    const usage = await getUsageForUrls(siteId, urls, "service");
    const deleted: string[] = [];
    const errors: Array<{ url: string; message: string }> = [];

    for (const url of urls) {
      try {
        const storage = getStorageObjectFromUrl(url);
        if (storage) {
          await deleteStorageObject(storage.bucket, storage.path);
        }

        // Quitar de catálogo media (por sitio si se puede)
        try {
          await supabaseRest(
            `/media?url=eq.${encodeURIComponent(url)}&site=eq.${encodeURIComponent(siteId)}`,
            { method: "DELETE", headers: { Prefer: "return=minimal" } },
            "service",
          );
        } catch {
          await supabaseRest(
            `/media?url=eq.${encodeURIComponent(url)}`,
            { method: "DELETE", headers: { Prefer: "return=minimal" } },
            "service",
          ).catch(() => null);
        }

        // Limpiar referencias del sitio
        await supabaseRest(
          `/posts?site=eq.${encodeURIComponent(siteId)}&featured_image=eq.${encodeURIComponent(url)}`,
          {
            method: "PATCH",
            body: JSON.stringify({ featured_image: null }),
            headers: { Prefer: "return=minimal" },
          },
          "service",
        ).catch(() => null);

        // post_images: borrar filas cuyo post es del sitio
        const imageRows: any[] =
          (await supabaseRest(
            `/post_images?url=eq.${encodeURIComponent(url)}&select=id,post_id,post:posts!inner(site)`,
            undefined,
            "service",
          ).catch(() => [])) || [];
        const idsToDelete = (Array.isArray(imageRows) ? imageRows : [])
          .filter((r) => String(r?.post?.site || "") === siteId)
          .map((r) => r.id)
          .filter(Boolean);
        for (const chunk of chunkArray(idsToDelete, 50)) {
          if (!chunk.length) continue;
          await supabaseRest(
            `/post_images?id=in.(${chunk.join(",")})`,
            { method: "DELETE", headers: { Prefer: "return=minimal" } },
            "service",
          ).catch(() => null);
        }

        await supabaseRest(
          `/sliders?site=eq.${encodeURIComponent(siteId)}&image_url=eq.${encodeURIComponent(url)}`,
          { method: "DELETE", headers: { Prefer: "return=minimal" } },
          "service",
        ).catch(() => null);

        deleted.push(url);
      } catch (e: any) {
        errors.push({ url, message: String(e?.message || e) });
      }
    }

    invalidateMediaListCache(siteId);
    return NextResponse.json(
      {
        ok: errors.length === 0,
        site: siteId,
        deleted,
        errors,
        usage,
      },
      { status: 200 },
    );
  } catch (err: any) {
    const authResponse = adminAuthResponse(err);
    if (authResponse) return authResponse;
    console.error("[DELETE /api/media] error", err);
    return NextResponse.json(
      { ok: false, error: "internal_error", message: String(err?.message || err) },
      { status: 500 },
    );
  }
}
