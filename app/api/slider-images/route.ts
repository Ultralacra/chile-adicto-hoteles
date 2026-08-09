import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  getCachedServerData,
  invalidateServerDataCache,
} from "@/lib/server-read-cache";
import { adminAuthResponse, requireSuperadmin } from "@/lib/server-auth";

export const runtime = "nodejs";

const SLIDER_IMAGES_CACHE_TTL_MS = 5 * 60 * 1000;

function isImage(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return !!ext && ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext);
}

async function readOrder(): Promise<{ desktop?: string[]; mobile?: string[] }> {
  try {
    const file = path.join(process.cwd(), "public", "slider-order.json");
    const txt = await fs.readFile(file, "utf-8");
    return JSON.parse(txt);
  } catch {
    return {};
  }
}

function baseName(p: string) {
  return (p.split("/").pop() || p).trim();
}

export async function GET() {
  try {
    const payload = await getCachedServerData(
      "slider-images:public",
      SLIDER_IMAGES_CACHE_TTL_MS,
      async () => {
        const base = process.cwd();
        const desktopDir = path.join(base, "public", "slider-desktop");
        const mobileDir = path.join(base, "public", "slider-movil");

        let desktop: string[] = [];
        let mobile: string[] = [];

        const ORDER = [
          "ICONOS",
          "NINOS",
          "ARQUITECTURA",
          "BARRIOS",
          "MERCADOS",
          "MIRADORES",
          "CULTURA",
          "PALACIOS",
          "PARQUES",
          "FUERA-DE-STGO",
          "RESTAURANTES",
        ];

        const norm = (s: string) =>
          s
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();

        const keyIndex = (filename: string) => {
          const name = norm(filename.replace(/\.[^.]+$/, ""));
          if (name.includes("NINOS") || name.includes("NIÑOS")) return ORDER.indexOf("NINOS");
          if (/^(ARQ|ARQU|AQU|AQI)/.test(name) || name.includes("ARQUITECTURA")) return ORDER.indexOf("ARQUITECTURA");
          if (name.includes("BARRIOS")) return ORDER.indexOf("BARRIOS");
          if (name.includes("ICONOS")) return ORDER.indexOf("ICONOS");
          if (name.includes("MERCADOS")) return ORDER.indexOf("MERCADOS");
          if (name.includes("MIRADORES")) return ORDER.indexOf("MIRADORES");
          if (name.includes("CULTURA") || name.includes("MUSEOS")) return ORDER.indexOf("CULTURA");
          if (name.includes("PALACIOS")) return ORDER.indexOf("PALACIOS");
          if (name.includes("PARQUES")) return ORDER.indexOf("PARQUES");
          if (name.includes("FUERA") || name.includes("FUERA-DE-STGO") || name.includes("OUTSIDE")) return ORDER.indexOf("FUERA-DE-STGO");
          if (name.includes("RESTAURANTES") || name.includes("RESTAURANTS")) return ORDER.indexOf("RESTAURANTES");
          return 999;
        };

        const sortByOrder = (a: string, b: string) => {
          const ia = keyIndex(a);
          const ib = keyIndex(b);
          if (ia !== ib) return ia - ib;
          return a.localeCompare(b, undefined, { numeric: true });
        };

        const ord = await readOrder();

        try {
          const desktopFiles = await fs.readdir(desktopDir);
          let list = desktopFiles.filter(isImage).map((f) => `/slider-desktop/${f}`);
          if (Array.isArray(ord.desktop) && ord.desktop.length) {
            const idx = new Map(ord.desktop.map((n, i) => [baseName(n), i]));
            list = list.slice().sort((a, b) => {
              const ia = idx.get(baseName(a));
              const ib = idx.get(baseName(b));
              if (typeof ia === "number" && typeof ib === "number") return ia - ib;
              if (typeof ia === "number") return -1;
              if (typeof ib === "number") return 1;
              return sortByOrder(a, b);
            });
          } else {
            list = list.sort(sortByOrder);
          }
          desktop = list;
        } catch {
          desktop = [];
        }

        try {
          const mobileFiles = await fs.readdir(mobileDir);
          let list = mobileFiles.filter(isImage).map((f) => `/slider-movil/${f}`);
          if (Array.isArray(ord.mobile) && ord.mobile.length) {
            const idx = new Map(ord.mobile.map((n, i) => [baseName(n), i]));
            list = list.slice().sort((a, b) => {
              const ia = idx.get(baseName(a));
              const ib = idx.get(baseName(b));
              if (typeof ia === "number" && typeof ib === "number") return ia - ib;
              if (typeof ia === "number") return -1;
              if (typeof ib === "number") return 1;
              return sortByOrder(a, b);
            });
          } else {
            list = list.sort(sortByOrder);
          }
          mobile = list;
        } catch {
          mobile = [];
        }

        return { desktop, mobile };
      },
    );

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ desktop: [], mobile: [] }, { status: 200 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireSuperadmin(req);
    const body = await req.json();
    const desktopIn: string[] = Array.isArray(body.desktop) ? body.desktop : [];
    const mobileIn: string[] = Array.isArray(body.mobile) ? body.mobile : [];
    const payload = {
      desktop: desktopIn.map(baseName),
      mobile: mobileIn.map(baseName),
    };
    const file = path.join(process.cwd(), "public", "slider-order.json");
    await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf-8");
    invalidateServerDataCache(/^slider-images:/);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const authResponse = adminAuthResponse(e);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, message: String(e?.message || e) }, { status: 400 });
  }
}
