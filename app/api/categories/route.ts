import { NextResponse } from "next/server";

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

// GET /api/categories -> lista de categorías normalizadas
export async function GET() {
  try {
    // Primero intentar desde Supabase
    const rows: any[] | null = await fetchFromSupabase("/categories?select=slug,label_es,label_en");
    if (rows) {
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
