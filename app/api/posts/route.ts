import { NextResponse } from "next/server";
import data from "@/lib/data.json";
import { postSchema } from "@/lib/post-schema";
import { normalizePost } from "@/lib/post-service";

// GET /api/posts -> lista de posts (mock: lee desde data.json)
export async function GET() {
  try {
    const posts = data as any[];
    return NextResponse.json(posts, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/posts] error", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// POST /api/posts -> crea post (solo loguea y devuelve el payload validado)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const normalized = normalizePost(body);
    const parsed = postSchema.safeParse(normalized);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, issues: parsed.error.issues },
        { status: 400 }
      );
    }
    console.log("[CREATE POST]", JSON.stringify(normalized, null, 2));
    return NextResponse.json({ ok: true, post: normalized }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/posts] error", err);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
