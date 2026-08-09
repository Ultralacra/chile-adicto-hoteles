import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  getCachedServerData,
  invalidateServerDataCache,
} from "@/lib/server-read-cache";
import { adminAuthResponse, requireSuperadmin } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const RESTAURANT_MOBILE_SLIDER_CACHE_TTL_MS = 5 * 60 * 1000;

function isImage(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return !!ext && ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext);
}

export async function GET() {
  try {
    const payload = await getCachedServerData(
      "restaurant-slider-mobile:public",
      RESTAURANT_MOBILE_SLIDER_CACHE_TTL_MS,
      async () => {
        const base = process.cwd();
        const dir = path.join(base, "public", "slider-restaurant-mobil");
        let files: string[] = [];
        try {
          const list = await fs.readdir(dir);
          files = list.filter(isImage).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        } catch {
          files = [];
        }
        try {
          const orderEsPath = path.join(dir, "order-es.json");
          const orderEnPath = path.join(dir, "order-en.json");
          let orderEs: string[] = [];
          let orderEn: string[] = [];
          try { orderEs = JSON.parse(await fs.readFile(orderEsPath, "utf-8")); } catch {}
          try { orderEn = JSON.parse(await fs.readFile(orderEnPath, "utf-8")); } catch {}
          if ((orderEs && orderEs.length) || (orderEn && orderEn.length)) {
            const idxEs = new Map(orderEs.map((n, i) => [n.trim(), i]));
            const idxEn = new Map(orderEn.map((n, i) => [n.trim(), i]));
            files = files.slice().sort((a, b) => {
              const sfx = (n: string) => (/-2\./i.test(n) ? "en" : /-1\./i.test(n) ? "es" : null);
              const la = sfx(a);
              const lb = sfx(b);
              const ia = la === "en" ? idxEn.get(a) : la === "es" ? idxEs.get(a) : undefined;
              const ib = lb === "en" ? idxEn.get(b) : lb === "es" ? idxEs.get(b) : undefined;
              if (typeof ia === "number" && typeof ib === "number") return ia - ib;
              if (typeof ia === "number") return -1;
              if (typeof ib === "number") return 1;
              return a.localeCompare(b, undefined, { numeric: true });
            });
          }
        } catch {}
        return { images: files.map((f) => `/slider-restaurant-mobil/${f}`) };
      },
    );

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ images: [] }, { status: 200 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireSuperadmin(req);
    const body = await req.json();
    const lang = String(body?.lang || "").toLowerCase();
    const order = Array.isArray(body?.order) ? body.order : [];
    if (!["es", "en"].includes(lang)) {
      return NextResponse.json({ ok: false, message: "lang debe ser 'es' o 'en'" }, { status: 400 });
    }
    const dir = path.join(process.cwd(), "public", "slider-restaurant-mobil");
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `order-${lang}.json`);
    await fs.writeFile(file, JSON.stringify(order, null, 2), "utf-8");
    invalidateServerDataCache(/^restaurant-slider-mobile:/);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const authResponse = adminAuthResponse(e);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, message: String(e?.message || e) }, { status: 400 });
  }
}
