import { NextResponse } from "next/server";
import data from "@/lib/data.json";

// GET /api/categories -> lista de categorías normalizadas
export async function GET() {
  try {
    const posts = data as any[];
    const set = new Set<string>();
    for (const h of posts) {
      (h.categories || []).forEach((c: string) => c && set.add(String(c).toUpperCase()));
      if (h.es?.category) set.add(String(h.es.category).toUpperCase());
      if (h.en?.category) set.add(String(h.en.category).toUpperCase());
    }
    const categories = Array.from(set).sort();
    return NextResponse.json(categories, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/categories] error", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
