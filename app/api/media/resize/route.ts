import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED_HOSTS = new Set([
  "xtctddbjwmmeirjltatm.supabase.co",
  "localhost",
  "127.0.0.1",
]);

function envHost(): string | null {
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) return null;
    return new URL(base).hostname;
  } catch {
    return null;
  }
}

function isAllowedUrl(raw: string, req: Request): boolean {
  try {
    if (raw.startsWith("/")) return true;
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const supabaseHost = envHost();
    if (supabaseHost) ALLOWED_HOSTS.add(supabaseHost);
    if (ALLOWED_HOSTS.has(url.hostname)) return true;
    // Same host as this app
    const reqHost = new URL(req.url).hostname;
    return url.hostname === reqHost;
  } catch {
    return false;
  }
}

function resolveFetchUrl(raw: string, req: Request): string {
  if (raw.startsWith("/")) {
    return new URL(raw, req.url).toString();
  }
  return raw;
}

// GET /api/media/resize?url=...&w=960&q=72
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = String(searchParams.get("url") || "").trim();
    const widthParam = Number(searchParams.get("w") || 960);
    const qualityParam = Number(searchParams.get("q") || 72);

    if (!rawUrl) {
      return NextResponse.json({ error: "missing_url" }, { status: 400 });
    }
    if (!isAllowedUrl(rawUrl, req)) {
      return NextResponse.json({ error: "url_not_allowed" }, { status: 400 });
    }

    const width = Math.max(
      120,
      Math.min(1600, Number.isFinite(widthParam) ? Math.trunc(widthParam) : 960),
    );
    const quality = Math.max(
      40,
      Math.min(90, Number.isFinite(qualityParam) ? Math.trunc(qualityParam) : 72),
    );

    const fetchUrl = resolveFetchUrl(rawUrl, req);
    const upstream = await fetch(fetchUrl, {
      cache: "force-cache",
      next: { revalidate: 60 * 60 * 24 * 7 },
    } as RequestInit);

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "upstream_error", status: upstream.status },
        { status: 502 },
      );
    }

    const input = Buffer.from(await upstream.arrayBuffer());
    const output = await sharp(input)
      .rotate()
      .resize({
        width,
        withoutEnlargement: true,
        fit: "inside",
      })
      .webp({ quality, effort: 4 })
      .toBuffer();

    return new NextResponse(output, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control":
          "public, max-age=604800, stale-while-revalidate=86400, immutable",
        "Content-Length": String(output.length),
      },
    });
  } catch (error) {
    console.error("[GET /api/media/resize]", error);
    return NextResponse.json({ error: "resize_failed" }, { status: 500 });
  }
}
