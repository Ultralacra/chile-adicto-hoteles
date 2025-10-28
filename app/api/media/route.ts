import { NextResponse } from "next/server";

// POST /api/media -> placeholder de subida de imagen por URL
// body: { url: string }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = String(body?.url || "").trim();
    if (!url) {
      return NextResponse.json({ ok: false, error: "url_requerida" }, { status: 400 });
    }
    console.log("[UPLOAD MEDIA]", url);
    // Sin almacenamiento: devolvemos eco
    return NextResponse.json({ ok: true, url }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/media] error", err);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
