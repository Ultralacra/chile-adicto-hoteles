import { NextResponse } from "next/server";
import { postSchema } from "@/lib/post-schema";
import { normalizePost } from "@/lib/post-normalize";

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

function mapRowToLegacy(row: any) {
  const images = Array.isArray(row.images)
    ? row.images
        .slice()
        .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
        .map((x: any) => x.url)
    : [];
  const locs = Array.isArray(row.locations)
    ? row.locations
        .slice()
        .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
        .map((l: any) => ({
          label: l.label || null,
          address: l.address || null,
          hours: l.hours || null,
          website: l.website || null,
          website_display: l.website_display || null,
          instagram: l.instagram || null,
          instagram_display: l.instagram_display || null,
          reservationLink: l.reservation_link || null,
          reservationPolicy: l.reservation_policy || null,
          interestingFact: l.interesting_fact || null,
          email: l.email || null,
          phone: l.phone || null,
        }))
    : [];
  const trEs = (row.translations || []).find((t: any) => t.lang === "es") || {};
  const trEn = (row.translations || []).find((t: any) => t.lang === "en") || {};
  const categories = Array.isArray(row.category_links)
    ? row.category_links.map((r: any) => r.category?.label_es || r.category?.slug).filter(Boolean)
    : [];
  return {
    slug: row.slug,
    featuredImage: row.featured_image || null,
    website: row.website || null,
    instagram: row.instagram || null,
    website_display: row.website_display || null,
    instagram_display: row.instagram_display || null,
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
      infoHtml: trEs.info_html || undefined,
      category: trEs.category || null,
    },
    en: {
      name: trEn.name || "",
      subtitle: trEn.subtitle || "",
      description: Array.isArray(trEn.description) ? trEn.description : [],
      infoHtml: trEn.info_html || undefined,
      category: trEn.category || null,
    },
    categories,
  };
}

// GET /api/posts/[slug]
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Intentar Supabase
    const select =
      "slug,featured_image,website,instagram,website_display,instagram_display,email,phone,photos_credit,address,hours,reservation_link,reservation_policy,interesting_fact,images:post_images(url,position),locations:post_locations(*),translations:post_translations(*),category_links:post_category_map(category:categories(slug,label_es,label_en))";
    const rows: any[] | null = await fetchFromSupabase(
      `/posts?slug=eq.${encodeURIComponent(params.slug)}&select=${encodeURIComponent(select)}`
    );
    if (rows && rows.length > 0) {
      const mapped = mapRowToLegacy(rows[0]);
      return NextResponse.json(mapped, { status: 200 });
    }

  // Sin fallback a data.json
  return NextResponse.json({ error: "not_found" }, { status: 404 });
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
    // 1) Obtener post.id por slug
    step = "fetch_post_id";
    const rows: any[] = await serviceRest(`/posts?slug=eq.${encodeURIComponent(params.slug)}&select=id`);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const postId = rows[0].id;
    console.log("[PUT posts] step=fetch_post_id id", postId);

    // 2) Actualizar tabla posts (campos top-level)
    const featured = normalized.featuredImage || normalized.images?.[0] || null;
    // Intentar PATCH posts con degradación si alguna columna no existe
    {
      const patchData: Record<string, any> = {
        featured_image: featured,
        website: normalized.website || null,
        website_display: normalized.website_display || null,
        instagram: normalized.instagram || null,
        instagram_display: normalized.instagram_display || null,
        email: normalized.email || null,
        phone: normalized.phone || null,
        address: normalized.address || null,
        photos_credit: normalized.photosCredit || null,
        hours: normalized.hours || null,
        reservation_link: normalized.reservationLink || null,
        reservation_policy: normalized.reservationPolicy || null,
        interesting_fact: normalized.interestingFact || null,
      };
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
          if (col && col in patchData) {
            delete patchData[col];
          } else {
            // intentar mapear con posts.<col>
            const m2 = msg.match(/posts\.([a-zA-Z0-9_]+)/i);
            const col2 = m2?.[1];
            if (!col2 || !(col2 in patchData)) break;
            delete patchData[col2];
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

    // 3) Reemplazar traducciones (solo enviar campos no vacíos)
    const esT = normalized.es || {} as any;
    const enT = normalized.en || {} as any;
    const candidates = [
      { lang: "es", src: esT },
      { lang: "en", src: enT },
    ];
    const cleaned = candidates
      .map(({ lang, src }) => {
        const obj: any = { post_id: postId, lang };
        if (src.name && String(src.name).trim()) obj.name = String(src.name).trim();
        if (src.subtitle && String(src.subtitle).trim()) obj.subtitle = String(src.subtitle).trim();
        if (Array.isArray(src.description) && src.description.length > 0) obj.description = src.description;
        if (src.infoHtml && String(src.infoHtml).trim()) obj.info_html = String(src.infoHtml).trim();
        if (src.category && String(src.category).trim()) obj.category = String(src.category).trim();
        return obj;
      })
      .filter((t) => Object.keys(t).length > 2); // más que post_id y lang

    if (cleaned.length > 0) {
      step = "delete_translations";
      await serviceRest(`/post_translations?post_id=eq.${postId}`, { method: "DELETE" });
      step = "post_translations";
      try {
        await serviceRest(`/post_translations`, { method: "POST", body: JSON.stringify(cleaned) });
      } catch (e: any) {
        const firstMsg = String(e?.message || "");
        let errCurr: any = e;
        const prune = new Set<string>();
        for (const m of firstMsg.matchAll(/Could not find the '([a-zA-Z0-9_]+)' column/gi)) prune.add(m[1]);
        if (prune.size > 0) {
          const payload = cleaned.map((t) => {
            const c: any = { ...t };
            for (const col of prune) delete c[col];
            return c;
          });
          try {
            await serviceRest(`/post_translations`, { method: "POST", body: JSON.stringify(payload) });
            console.warn("[PUT posts] degradado traducciones columnas faltantes", Array.from(prune));
            errCurr = null;
          } catch (e2: any) {
            errCurr = e2;
          }
        }
        if (errCurr) {
          // patrón genérico
          for (let i = 0; i < 5 && errCurr; i++) {
            const msg = String(errCurr?.message || "");
            const m = msg.match(/column\s+[^.]*\.?([a-zA-Z0-9_]+)\s+does not exist/i);
            if (!m) break;
            prune.add(m[1]);
            const payload = cleaned.map((t) => {
              const c: any = { ...t };
              for (const col of prune) delete c[col];
              return c;
            });
            try {
              await serviceRest(`/post_translations`, { method: "POST", body: JSON.stringify(payload) });
              errCurr = null;
              break;
            } catch (e3: any) {
              errCurr = e3;
            }
          }
        }
        if (errCurr) throw errCurr;
      }
    }

    // 4) Reemplazar imágenes
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

    // 5) Reemplazar categorías (mapear por label_es)
    try {
      const cats: any[] = await serviceRest(`/categories?select=id,slug,label_es,label_en`);
      const wanted = new Set(
        (normalized.categories || []).map((c) => String(c).toUpperCase())
      );
      const catIds = cats
        .filter((r) => wanted.has(String(r.label_es || r.slug || "").toUpperCase()))
        .map((r) => r.id);
      await serviceRest(`/post_category_map?post_id=eq.${postId}`, { method: "DELETE" });
      step = "delete_category_map";
      if (catIds.length > 0) {
        step = "insert_category_map";
        await serviceRest(`/post_category_map`, {
          method: "POST",
          body: JSON.stringify(catIds.map((id: number) => ({ post_id: postId, category_id: id }))),
        });
      }
    } catch (e) {
      console.warn("[PUT posts] Categorías: continuidad tras fallo en mapeo", e);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
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
    console.log("[DELETE POST]", params.slug);
    // Sin persistencia: solo confirmación
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("[DELETE /api/posts/[slug]] error", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
