import { NextResponse } from "next/server";
import { postSchema } from "@/lib/post-schema";
import { normalizePost } from "@/lib/post-normalize";
import { getCurrentSiteId } from "@/lib/site-utils";
import {
  ensureLegacyPostShape,
  mergeLegacyPostMissingValues,
} from "@/lib/post-response-shape";
import {
  getCachedServerData,
  invalidateServerDataCache,
} from "@/lib/server-read-cache";

const POST_DETAIL_CACHE_TTL_MS = 5 * 60 * 1000;

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

async function serviceRest(path: string, init?: RequestInit) {
  const base = envOrNull("NEXT_PUBLIC_SUPABASE_URL");
  const service = envOrNull("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !service) throw new Error("Supabase Service Role no configurado");
  const url = `${base}/rest/v1${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      apikey: service,
      Authorization: `Bearer ${service}`,
      Prefer: "return=representation",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase write error ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function encodeStoragePath(path: string) {
  return String(path || "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function getStorageObjectFromUrl(rawUrl: string) {
  const base = envOrNull("NEXT_PUBLIC_SUPABASE_URL");

  try {
    const parsedBase = base ? new URL(base) : null;
    const parsedUrl = new URL(rawUrl);
    if (parsedBase && parsedUrl.host !== parsedBase.host) return null;

    const parts = parsedUrl.pathname
      .split("/")
      .map((segment) => decodeURIComponent(segment))
      .filter(Boolean);
    const objectIndex = parts.findIndex(
      (segment, index) => segment === "object" && parts[index - 1] === "v1"
    );

    if (objectIndex < 0) return null;

    const mode = parts[objectIndex + 1];
    const bucketIndex = ["public", "authenticated", "sign"].includes(mode)
      ? objectIndex + 2
      : objectIndex + 1;
    const bucket = parts[bucketIndex];
    const pathParts = parts.slice(bucketIndex + 1);

    if (!bucket || pathParts.length === 0) return null;

    return {
      bucket,
      path: pathParts.join("/"),
    };
  } catch {
    return null;
  }
}

async function deleteStorageObject(bucket: string, path: string) {
  const base = envOrNull("NEXT_PUBLIC_SUPABASE_URL");
  const service = envOrNull("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !service) throw new Error("Supabase Service Role no configurado");

  const res = await fetch(
    `${base}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`,
    {
      method: "DELETE",
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
      },
      cache: "no-store",
    }
  );

  if (res.status === 404) return false;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storage delete error ${res.status}: ${text}`);
  }

  return true;
}

function normalizeCommuneKey(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

async function resolveCommuneSlugs(siteId: string, communesInput: unknown) {
  const rawList = Array.isArray(communesInput) ? communesInput : [];
  const requested = Array.from(
    new Set(rawList.map((x: any) => String(x || "").trim()).filter(Boolean))
  );
  if (requested.length === 0) return [] as string[];

  const rows: any[] =
    (await serviceRest(
      `/communes?site=eq.${siteId}&select=slug,label`
    )) || [];

  const dict = new Map<string, string>();
  for (const row of Array.isArray(rows) ? rows : []) {
    const slug = String(row?.slug || "").trim();
    const label = String(row?.label || "").trim();
    if (!slug) continue;
    dict.set(normalizeCommuneKey(slug), slug);
    if (label) dict.set(normalizeCommuneKey(label), slug);
  }

  const slugs: string[] = [];
  for (const item of requested) {
    const found = dict.get(normalizeCommuneKey(item));
    if (found && !slugs.includes(found)) slugs.push(found);
  }
  return slugs;
}

async function replacePostCommunes(
  postId: string,
  siteId: string,
  communesInput: unknown
) {
  const slugs = await resolveCommuneSlugs(siteId, communesInput);
  await serviceRest(`/post_communes?post_id=eq.${encodeURIComponent(postId)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });

  if (slugs.length === 0) return;

  await serviceRest(`/post_communes?on_conflict=post_id,commune_slug`, {
    method: "POST",
    headers: { Prefer: "return=representation,resolution=merge-duplicates" },
    body: JSON.stringify(
      slugs.map((communeSlug) => ({
        post_id: postId,
        commune_slug: communeSlug,
      }))
    ),
  });
}

function mapRowToLegacy(row: any) {
  let images = Array.isArray(row.images)
    ? row.images
        .slice()
        .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
        .map((x: any) => x.url)
    : [];
  // Fallback: si no hay post_images, exponer al menos la featured_image como galería
  if ((!images || images.length === 0) && row.featured_image) {
    images = [row.featured_image];
  }
  const locs = Array.isArray(row.locations)
    ? row.locations
        .slice()
        .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
        .map((l: any) => ({
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
  const categoryFeaturedImages: Record<string, string> = {};
  if (Array.isArray(row.category_links)) {
    for (const link of row.category_links) {
      const catSlug = String(link?.category?.slug || "").trim().toLowerCase();
      const img = String(link?.featured_image || "").trim();
      if (catSlug && img) categoryFeaturedImages[catSlug] = img;
    }
  }
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
    categoryFeaturedImages,
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

async function fetchSinglePostBySlugAnySite(slug: string, select: string) {
  const rows: any[] | null = await fetchWithPublicationFallback(
    `/posts?slug=eq.${encodeURIComponent(slug)}&select=${encodeURIComponent(select)}`
  );
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0];
}

// GET /api/posts/[slug]
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const url = new URL(_req.url);
    const isAdminRequest = !!url.searchParams.get("adminSite");
    const siteId = await getCurrentSiteId(_req);
    const ctx = (await (params as any)) as { slug?: string };
    const slug = String(ctx?.slug || "").trim();
    if (!slug) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const result = await getCachedServerData(
      `post:${siteId}:${slug}:${isAdminRequest ? "admin" : "public"}`,
      POST_DETAIL_CACHE_TTL_MS,
      async () => {
        const select =
          "slug,publication_status,publish_start_at,publish_end_at,featured_image,website,website_public,instagram,website_display,instagram_display,email,phone,photos_credit,address,hours,reservation_link,reservation_policy,interesting_fact,site,images:post_images(url,position),locations:post_locations(*),translations:post_translations(*),useful:post_useful_info(*),category_links:post_category_map(featured_image,category:categories(slug,label_es,label_en)),communes_links:post_communes(commune_slug,commune:communes(slug,label))";
        const rows: any[] | null = await fetchWithPublicationFallback(
          `/posts?slug=eq.${encodeURIComponent(slug)}&site=eq.${siteId}&select=${encodeURIComponent(select)}`
        );
        if (rows && rows.length > 0) {
          console.log(
            "[GET /api/posts/[slug]] raw category_links for",
            slug,
            "=",
            JSON.stringify(
              (rows[0] as any)?.category_links?.map((l: any) => ({
                featured_image: l?.featured_image,
                cat: l?.category?.slug,
              })) || [],
            ),
          );
          let mapped = ensureLegacyPostShape(mapRowToLegacy(rows[0]));

          const fallbackRow = await fetchSinglePostBySlugAnySite(slug, select);
          if (fallbackRow) {
            const fallbackMapped = ensureLegacyPostShape(mapRowToLegacy(fallbackRow));
            mapped = mergeLegacyPostMissingValues(mapped, fallbackMapped);
          }

          const status = String(mapped?.publicationStatus || "published")
            .trim()
            .toLowerCase();
          if (!isAdminRequest && status === "unpublished") {
            return { status: 404, body: { error: "not_found" } };
          }
          return { status: 200, body: mapped };
        }

        return { status: 404, body: { error: "not_found" } };
      },
    );

    return NextResponse.json(result.body, { status: result.status });
  } catch (err: any) {
    console.error("[GET /api/posts/[slug]] error", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// PUT /api/posts/[slug]
export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {
  let step = "start";
  try {
    const siteId = await getCurrentSiteId(req);
    const ctx = (await (params as any)) as { slug?: string };
    const slugParam = String(ctx?.slug || "").trim();

    const body = await req.json();
    console.log("[PUT posts] step=start body keys", Object.keys(body || {}));
    const normalized = normalizePost(body);
    step = "normalized";
    console.log("[PUT posts] step=normalized slug", normalized.slug);
    const parsed = postSchema.safeParse(normalized);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, issues: parsed.error.issues },
        { status: 400 }
      );
    }
    // Conjunto de campos explícitamente provistos (para actualizaciones parciales seguras)
    const provided = new Set<string>(Object.keys(body || {}));
    // 1) Obtener post.id por slug y site
    step = "fetch_post_id";
    const rows: any[] = await serviceRest(`/posts?slug=eq.${encodeURIComponent(slugParam)}&site=eq.${siteId}&select=id`);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const postId = rows[0].id;
    console.log("[PUT posts] step=fetch_post_id id", postId);

    // 2) Cambiar slug si se proporcionó y es distinto
    if (provided.has("slug") && normalized.slug && normalized.slug !== slugParam) {
      step = "check_slug_unique";
      const exists: any[] = await serviceRest(
        `/posts?slug=eq.${encodeURIComponent(normalized.slug)}&site=eq.${siteId}&select=id`
      );
      if (Array.isArray(exists) && exists.length > 0) {
        return NextResponse.json(
          { ok: false, error: "slug_exists" },
          { status: 409 }
        );
      }
      step = "patch_slug";
      await serviceRest(`/posts?id=eq.${postId}`, {
        method: "PATCH",
        body: JSON.stringify({ slug: normalized.slug }),
      });
    }

    // 3) Actualizar tabla posts (campos top-level) solo para claves provistas
    {
      const patchData: Record<string, any> = {};
      const setIfProvided = (key: string, value: any) => {
        if (provided.has(key)) {
          patchData[
            key === "featuredImage"
              ? "featured_image"
              : key === "website_display"
              ? "website_display"
              : key === "instagram_display"
              ? "instagram_display"
              : key === "photosCredit"
              ? "photos_credit"
              : key === "reservationLink"
              ? "reservation_link"
              : key === "reservationPolicy"
              ? "reservation_policy"
              : key === "websitePublic"
              ? "website_public"
              : key === "interestingFact"
              ? "interesting_fact"
              : key === "publicationStatus"
              ? "publication_status"
              : key === "publishStartAt"
              ? "publish_start_at"
              : key === "publishEndAt"
              ? "publish_end_at"
              : key
          ] = value ?? null;
        }
      };
      setIfProvided("featuredImage", normalized.featuredImage);
      setIfProvided("website", normalized.website);
      setIfProvided("website_display", normalized.website_display);
      setIfProvided("instagram", normalized.instagram);
      setIfProvided("instagram_display", normalized.instagram_display);
      setIfProvided("email", normalized.email);
      setIfProvided("phone", normalized.phone);
      setIfProvided("address", normalized.address);
      setIfProvided("photosCredit", normalized.photosCredit);
      setIfProvided("hours", normalized.hours);
      setIfProvided("reservationLink", normalized.reservationLink);
      setIfProvided("reservationPolicy", normalized.reservationPolicy);
      setIfProvided("websitePublic", normalized.websitePublic);
      setIfProvided("interestingFact", normalized.interestingFact);
      setIfProvided("publicationStatus", normalized.publicationStatus);
      setIfProvided("publishStartAt", normalized.publishStartAt);
      setIfProvided("publishEndAt", normalized.publishEndAt);

      if (Object.keys(patchData).length > 0) {
        const tryPatch = async () => {
          step = "patch_posts";
          await serviceRest(`/posts?id=eq.${postId}`, {
            method: "PATCH",
            body: JSON.stringify(patchData),
          });
        };
        try {
          await tryPatch();
        } catch (e: any) {
          // Si falta alguna columna, eliminarla y reintentar hasta 8 veces
          let attempts = 0;
          let lastErr = e;
          while (attempts < 8) {
            const msg = String(lastErr?.message || "");
            const m = msg.match(/column\s+[^.]*\.?([a-zA-Z0-9_]+)\s+does not exist/i);
            if (!m) break;
            const col = m[1];
            for (const k of Object.keys(patchData)) {
              if (k === col || k.endsWith(`.${col}`) || col === k) {
                delete patchData[k];
                break;
              }
            }
            attempts++;
            try {
              await tryPatch();
              lastErr = null;
              break;
            } catch (err2: any) {
              lastErr = err2;
            }
          }
          if (lastErr) throw lastErr;
        }
      }
    }

    // 4) Reemplazar traducciones: PostgREST exige que todos los objetos de un bulk insert tengan las mismas claves.
    // Unificamos claves (name, subtitle, description, info_html, category) siempre presentes.
    const esT = normalized.es || {} as any;
    const enT = normalized.en || {} as any;
    const unifiedTranslations = [
      {
        post_id: postId,
        lang: "es",
        name: esT.name ? String(esT.name).trim() : null,
        subtitle: esT.subtitle ? String(esT.subtitle).trim() : null,
        description: Array.isArray(esT.description) ? esT.description : [],
        info_html: null,
        category: esT.category ? String(esT.category).trim() : null,
      },
      {
        post_id: postId,
        lang: "en",
        name: enT.name ? String(enT.name).trim() : null,
        subtitle: enT.subtitle ? String(enT.subtitle).trim() : null,
        description: Array.isArray(enT.description) ? enT.description : [],
        info_html: null,
        category: enT.category ? String(enT.category).trim() : null,
      },
    ];
    // Decidimos insertar solo si al menos un idioma tiene algún campo no nulo o descripción no vacía
    const shouldWrite = unifiedTranslations.some(t => (t.name||t.subtitle||t.info_html||t.category|| (Array.isArray(t.description) && t.description.length>0)));
    if (shouldWrite) {
      step = "delete_translations";
      await serviceRest(`/post_translations?post_id=eq.${postId}`, { method: "DELETE" });
      step = "post_translations";
      try {
        await serviceRest(`/post_translations`, { method: "POST", body: JSON.stringify(unifiedTranslations) });
      } catch (e: any) {
        const firstMsg = String(e?.message || "");
        // Fallback: eliminar columnas inexistentes manteniendo uniformidad
        let errCurr: any = e;
        const prune = new Set<string>();
        for (const m of firstMsg.matchAll(/Could not find the '([a-zA-Z0-9_]+)' column/gi)) prune.add(m[1]);
        if (prune.size>0) {
          const payload = unifiedTranslations.map(t => {
            const c: any = { ...t };
            for (const col of prune) delete c[col];
            return c;
          });
          try {
            await serviceRest(`/post_translations`, { method: "POST", body: JSON.stringify(payload) });
            console.warn("[PUT posts] degradado traducciones columnas faltantes", Array.from(prune));
            errCurr = null;
          } catch (e2:any){ errCurr = e2; }
        }
        if (errCurr) {
          for (let i=0;i<5 && errCurr;i++) {
            const msg = String(errCurr?.message||"");
            const m = msg.match(/column\s+[^.]*\.?([a-zA-Z0-9_]+)\s+does not exist/i);
            if(!m) break;
            prune.add(m[1]);
            const payload = unifiedTranslations.map(t=>{
              const c:any={...t};
              for(const col of prune) delete c[col];
              return c;
            });
            try { await serviceRest(`/post_translations`,{method:"POST",body:JSON.stringify(payload)}); errCurr=null; break; } catch(e3:any){ errCurr=e3; }
          }
        }
        if (errCurr) throw errCurr;
      }
    }

    // 4b) Upsert de post_useful_info si se proporcionaron bloques HTML
    {
      const useful: any[] = [];
      const providedEs = provided.has("es") && typeof (body?.es?.infoHtml) !== "undefined";
      const providedEn = provided.has("en") && typeof (body?.en?.infoHtml) !== "undefined";
      if (providedEs && esT.infoHtml && String(esT.infoHtml).trim() !== "") {
        useful.push({ post_id: postId, lang: "es", html: String(esT.infoHtml).trim() });
      }
      if (providedEn && enT.infoHtml && String(enT.infoHtml).trim() !== "") {
        useful.push({ post_id: postId, lang: "en", html: String(enT.infoHtml).trim() });
      }
      if (useful.length > 0) {
        await serviceRest(`/post_useful_info`, {
          method: "POST",
          body: JSON.stringify(useful),
          headers: { Prefer: "return=representation,resolution=merge-duplicates" },
        });
      }
    }

    // 5) Reemplazar imágenes SOLO si se proporcionó el campo 'images'
    if (provided.has("images")) {
      await serviceRest(`/post_images?post_id=eq.${postId}`, { method: "DELETE" });
      step = "delete_images";
      const imagesPayload = (normalized.images || []).map((url, idx) => ({
        post_id: postId,
        url,
        position: idx,
      }));
      if (imagesPayload.length > 0) {
        step = "insert_images";
        await serviceRest(`/post_images`, {
          method: "POST",
          body: JSON.stringify(imagesPayload),
        });
      }
    }

    // 6) Reemplazar categorías (mapear por label_es o slug) SOLO si se proporcionó 'categories'
    if (provided.has("categories")) {
      try {
        const cats: any[] = await serviceRest(`/categories?select=id,slug,label_es,label_en`);
        const wanted = new Set((normalized.categories || []).map((c) => String(c).toUpperCase()));
        const picked = cats.filter((r: any) => wanted.has(String(r.label_es || r.slug || "").toUpperCase()));
        const catIds = picked.map((r: any) => r.id);
        await serviceRest(`/post_category_map?post_id=eq.${postId}`, { method: "DELETE" });
        step = "delete_category_map";
        if (catIds.length > 0) {
          step = "insert_category_map";
          const catFeatMap = ((normalized as any).categoryFeaturedImages || {}) as Record<string, string | null>;
          console.log("[PUT posts] insert_category_map postId=%s catIds=%o wanted=%o catFeatMap=%o", postId, catIds, Array.from(wanted), catFeatMap);
          await serviceRest(`/post_category_map`, {
            method: "POST",
            body: JSON.stringify(picked.map((r: any) => {
              const slugKey = String(r.slug || "").trim().toLowerCase();
              const override = catFeatMap[slugKey];
              return {
                post_id: postId,
                category_id: r.id,
                featured_image: override ? String(override) : null,
              };
            })),
          });
        } else {
          console.warn("[PUT posts] No category IDs matched for provided categories", Array.from(wanted));
        }
      } catch (e) {
        console.warn("[PUT posts] Categorías: continuidad tras fallo en mapeo", e);
      }
    } else if (provided.has("categoryFeaturedImages")) {
      // Actualización parcial: solo cambia el override de imagen destacada por categoría
      try {
        const catFeatMap = ((normalized as any).categoryFeaturedImages || {}) as Record<string, string | null>;
        const cats: any[] = await serviceRest(`/categories?select=id,slug`);
        const slugToId = new Map<string, number>();
        for (const r of cats || []) {
          const s = String(r?.slug || "").trim().toLowerCase();
          if (s) slugToId.set(s, r.id);
        }
        const existing: any[] =
          (await serviceRest(
            `/post_category_map?post_id=eq.${postId}&select=category_id`,
          )) || [];
        const existingIds = new Set(
          existing.map((r: any) => Number(r.category_id)).filter((n) => Number.isFinite(n)),
        );
        for (const [slugKey, raw] of Object.entries(catFeatMap)) {
          const id = slugToId.get(String(slugKey).trim().toLowerCase());
          if (!id || !existingIds.has(id)) continue;
          const override = raw ? String(raw) : null;
          await serviceRest(
            `/post_category_map?post_id=eq.${postId}&category_id=eq.${id}`,
            {
              method: "PATCH",
              body: JSON.stringify({ featured_image: override }),
            },
          );
        }
      } catch (e) {
        console.warn("[PUT posts] categoryFeaturedImages: fallo parcial", e);
      }
    }

    if (provided.has("communes")) {
      step = "replace_communes";
      await replacePostCommunes(postId, siteId, (normalized as any).communes);
    }

    invalidateServerDataCache(new RegExp(`^posts:${siteId}:`));
    invalidateServerDataCache(new RegExp(`^post:${siteId}:`));
    return NextResponse.json({ ok: true, slug: normalized.slug || slugParam }, { status: 200 });
  } catch (err: any) {
    console.error("[PUT /api/posts/[slug]] error final", err);
    const msg = String(err?.message || "bad_request");
    // Incluir paso si está disponible para depurar
    const payload: any = { error: "internal_error", message: msg, step };
    // Diferenciar 400 vs 500 por mensaje
    const isSupabaseClientErr = /Supabase write error 400/i.test(msg) || /bad_request/i.test(msg);
    const status = isSupabaseClientErr ? 400 : 500;
    payload.error = status === 400 ? "bad_request" : "internal_error";
    return NextResponse.json(payload, { status });
  }
}

// DELETE /api/posts/[slug]
export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const siteId = await getCurrentSiteId(_req);
    const ctx = (await (params as any)) as { slug?: string };
    const slug = String(ctx?.slug || "").trim();
    console.log("[DELETE POST]", slug, "site:", siteId);
    
    // Verificar que el post exista y pertenezca al sitio actual
    const rows: any[] = await serviceRest(
      `/posts?slug=eq.${encodeURIComponent(slug)}&site=eq.${siteId}&select=id,slug,site,featured_image`
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const postRow = rows[0];
    const postId = postRow.id;

    const [categoryRows, communeRows, locationRows, imageRows, translationRows, usefulRows] =
      await Promise.all([
        serviceRest(`/post_category_map?post_id=eq.${postId}&select=*`).catch(() => []),
        serviceRest(`/post_communes?post_id=eq.${postId}&select=*`).catch(() => []),
        serviceRest(`/post_locations?post_id=eq.${postId}&select=*`).catch(() => []),
        serviceRest(`/post_images?post_id=eq.${postId}&select=*`).catch(() => []),
        serviceRest(`/post_translations?post_id=eq.${postId}&select=*`).catch(() => []),
        serviceRest(`/post_useful_info?post_id=eq.${postId}&select=*`).catch(() => []),
      ]);

    const imageUrls = Array.from(
      new Set(
        [
          String(postRow?.featured_image || "").trim(),
          ...((Array.isArray(imageRows) ? imageRows : []).map((row: any) =>
            String(row?.url || "").trim()
          )),
        ].filter(Boolean)
      )
    );

    const imageDeletionPlan = await Promise.all(
      imageUrls.map(async (url) => {
        const storageObject = getStorageObjectFromUrl(url);
        const [otherPostImageRefs, otherFeaturedRefs, sliderRefs] = await Promise.all([
          serviceRest(
            `/post_images?url=eq.${encodeURIComponent(url)}&post_id=neq.${postId}&select=post_id,url`
          ).catch(() => []),
          serviceRest(
            `/posts?featured_image=eq.${encodeURIComponent(url)}&id=neq.${postId}&select=id,slug,site`
          ).catch(() => []),
          serviceRest(
            `/sliders?image_url=eq.${encodeURIComponent(url)}&select=id,set_key,site,lang,position`
          ).catch(() => []),
        ]);

        const referencedElsewhere =
          (Array.isArray(otherPostImageRefs) ? otherPostImageRefs.length : 0) > 0 ||
          (Array.isArray(otherFeaturedRefs) ? otherFeaturedRefs.length : 0) > 0 ||
          (Array.isArray(sliderRefs) ? sliderRefs.length : 0) > 0;

        return {
          url,
          storageObject,
          canDeleteFromStorage: !!storageObject && !referencedElsewhere,
          skipReason: !storageObject
            ? "url_not_in_supabase_storage"
            : referencedElsewhere
              ? "referenced_elsewhere"
              : null,
          references: {
            postImages: Array.isArray(otherPostImageRefs) ? otherPostImageRefs : [],
            featuredPosts: Array.isArray(otherFeaturedRefs) ? otherFeaturedRefs : [],
            sliders: Array.isArray(sliderRefs) ? sliderRefs : [],
          },
        };
      })
    );

    console.log(
      "[DELETE POST] plan previo de borrado:\n" +
        JSON.stringify(
          {
            post: postRow,
            related: {
              categories: categoryRows,
              communes: communeRows,
              locations: locationRows,
              images: imageRows,
              translations: translationRows,
              usefulInfo: usefulRows,
            },
            imagesToEvaluate: imageDeletionPlan,
          },
          null,
          2
        )
    );

    const deletedStorageObjects: Array<{ url: string; bucket: string; path: string }> = [];
    for (const item of imageDeletionPlan) {
      if (!item.canDeleteFromStorage || !item.storageObject) continue;
      await deleteStorageObject(item.storageObject.bucket, item.storageObject.path);
      deletedStorageObjects.push({
        url: item.url,
        bucket: item.storageObject.bucket,
        path: item.storageObject.path,
      });
    }

    // Eliminar todo lo relacionado a este post (defensivo, sin depender de cascadas)
    const delOpts = { method: "DELETE", headers: { Prefer: "return=minimal" } } as const;
    await serviceRest(`/post_category_map?post_id=eq.${postId}`, delOpts);
    await serviceRest(`/post_communes?post_id=eq.${postId}`, delOpts);
    await serviceRest(`/post_locations?post_id=eq.${postId}`, delOpts);
    await serviceRest(`/post_images?post_id=eq.${postId}`, delOpts);
    await serviceRest(`/post_translations?post_id=eq.${postId}`, delOpts);
    await serviceRest(`/post_useful_info?post_id=eq.${postId}`, delOpts);

    for (const item of deletedStorageObjects) {
      await serviceRest(`/media?url=eq.${encodeURIComponent(item.url)}`, delOpts).catch(
        () => null
      );
    }

    // Finalmente eliminar el post (acotado al site por seguridad)
    await serviceRest(`/posts?id=eq.${postId}&site=eq.${siteId}`, delOpts);

    invalidateServerDataCache(new RegExp(`^posts:${siteId}:`));
    invalidateServerDataCache(new RegExp(`^post:${siteId}:`));
    
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("[DELETE /api/posts/[slug]] error", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
