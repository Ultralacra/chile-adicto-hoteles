import { NextResponse } from "next/server";
import data from "@/lib/data.json";
import { postSchema } from "@/lib/post-schema";
import { normalizePost } from "@/lib/post-service";

// GET /api/posts/[slug]
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const posts = data as any[];
    const found = posts.find((p) => p.slug === params.slug);
    if (!found) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(found, { status: 200 });
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
    console.log("[UPDATE POST]", params.slug, JSON.stringify(normalized, null, 2));
    // Sin persistencia: devolvemos eco
    return NextResponse.json({ ok: true, post: normalized }, { status: 200 });
  } catch (err: any) {
    console.error("[PUT /api/posts/[slug]] error", err);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
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
