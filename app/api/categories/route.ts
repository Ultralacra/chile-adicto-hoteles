import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function envOrNull(name: string) {
  const v = process.env[name];
  return v && v.length > 0 ? v : null;
}

async function fetchFromSupabase(path: string) {
  const base = envOrNull("NEXT_PUBLIC_SUPABASE_URL");
  const anon = envOrNull("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!base || !anon) return null;
  const url = `${base}/rest/v1${path}`;
  const res = await fetch(url, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function serviceRest(path: string, init?: RequestInit) {
  const base = envOrNull("NEXT_PUBLIC_SUPABASE_URL");
  const service = envOrNull("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !service)
    throw new Error(
      "Supabase Service Role no configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)"
    );
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

function requireAdminKey(req: Request) {
  // Protección opcional: si seteas ADMIN_API_KEY en el entorno,
  // se exigirá header x-admin-key con el mismo valor.
  const required = envOrNull("ADMIN_API_KEY");
  if (!required) return;
  const provided = req.headers.get("x-admin-key");
  if (!provided || provided !== required) {
    throw new Error("unauthorized");
  }
}

function normalizeSlug(input: string) {
  return String(input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/categories ->
// - por defecto: lista de etiquetas ES en mayúsculas (compat)
// - con ?full=1: lista completa [{slug,label_es,label_en}]
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const full = url.searchParams.get("full") === "1";

    // Primero intentar desde Supabase
    const rows: any[] | null = await fetchFromSupabase(
      "/categories?select=slug,label_es,label_en&order=slug.asc"
    );
    if (rows) {
      if (full) {
        const list = rows
          .map((r: any) => ({
            slug: String(r.slug || ""),
            label_es: r.label_es ?? null,
            label_en: r.label_en ?? null,
          }))
          .filter((r: any) => !!r.slug);
        return NextResponse.json(list, { status: 200 });
      }
      // Devolver lista de etiquetas ES en mayúsculas para compatibilidad
      const cats = rows
        .map((r: any) => String(r.label_es || r.slug || "").toUpperCase())
        .filter(Boolean)
        .sort();
      return NextResponse.json(cats, { status: 200 });
    }
    // Sin fallback a data.json
    return NextResponse.json([], { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/categories] error", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// POST /api/categories -> crea/actualiza categoría(s) en Supabase
// Body soportado:
// - { slug, label_es, label_en } (o labelEs/labelEn)
// - [{...}, {...}] (batch)
export async function POST(req: Request) {
  try {
    requireAdminKey(req);
    const body = await req.json();
    const input = Array.isArray(body) ? body : [body];
    const rows = input
      .map((x: any) => {
        const labelEs = String(x?.label_es ?? x?.labelEs ?? "").trim();
        const labelEn = String(x?.label_en ?? x?.labelEn ?? "").trim();
        const slugRaw = String(x?.slug ?? "").trim();
        const slug = normalizeSlug(slugRaw || labelEs || labelEn);
        if (!slug) return null;
        return {
          slug,
          label_es: labelEs || null,
          label_en: labelEn || null,
        };
      })
      .filter(Boolean);

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Body inválido: falta slug/label" },
        { status: 400 }
      );
    }

    const created = await serviceRest(`/categories?on_conflict=slug`, {
      method: "POST",
      headers: {
        Prefer: "return=representation,resolution=merge-duplicates",
      },
      body: JSON.stringify(rows),
    });

    return NextResponse.json({ ok: true, rows: created }, { status: 200 });
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg === "unauthorized") {
      return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/categories] error", err);
    return NextResponse.json({ ok: false, message: msg }, { status: 400 });
  }
}
