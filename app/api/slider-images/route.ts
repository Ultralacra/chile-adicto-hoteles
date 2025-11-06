import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

function isImage(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return !!ext && ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext);
}

export async function GET() {
  try {
    const base = process.cwd();
    const desktopDir = path.join(base, "public", "slider-desktop");
    const mobileDir = path.join(base, "public", "slider-movil");

    let desktop: string[] = [];
    let mobile: string[] = [];

    // Orden objetivo igual al menú del Home
    const ORDER = [
      "ARQUITECTURA",
      "BARRIOS",
      "ICONOS",
      "MERCADOS",
      "MIRADORES",
      "CULTURA", // (museos)
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
      // Heurísticas para mapear nombres levemente distintos
      if (/^(ARQ|ARQU|AQU|AQI)/.test(name) || name.includes("ARQUITECTURA"))
        return ORDER.indexOf("ARQUITECTURA");
      if (name.includes("BARRIOS")) return ORDER.indexOf("BARRIOS");
      if (name.includes("ICONOS")) return ORDER.indexOf("ICONOS");
      if (name.includes("MERCADOS")) return ORDER.indexOf("MERCADOS");
      if (name.includes("MIRADORES")) return ORDER.indexOf("MIRADORES");
      if (name.includes("CULTURA") || name.includes("MUSEOS"))
        return ORDER.indexOf("CULTURA");
      if (name.includes("PALACIOS")) return ORDER.indexOf("PALACIOS");
      if (name.includes("PARQUES")) return ORDER.indexOf("PARQUES");
      if (
        name.includes("FUERA") ||
        name.includes("FUERA-DE-STGO") ||
        name.includes("OUTSIDE")
      )
        return ORDER.indexOf("FUERA-DE-STGO");
      if (name.includes("RESTAURANTES") || name.includes("RESTAURANTS"))
        return ORDER.indexOf("RESTAURANTES");
      return 999; // al final si no se reconoce
    };

    const sortByOrder = (a: string, b: string) => {
      const ia = keyIndex(a);
      const ib = keyIndex(b);
      if (ia !== ib) return ia - ib;
      // desempate estable alfabético/numerico
      return a.localeCompare(b, undefined, { numeric: true });
    };

    try {
      const desktopFiles = await fs.readdir(desktopDir);
      desktop = desktopFiles.filter(isImage).sort(sortByOrder).map((f) => `/slider-desktop/${f}`);
    } catch {
      // carpeta inexistente o sin permisos -> lista vacía
      desktop = [];
    }
    try {
      const mobileFiles = await fs.readdir(mobileDir);
      mobile = mobileFiles.filter(isImage).sort(sortByOrder).map((f) => `/slider-movil/${f}`);
    } catch {
      mobile = [];
    }

    return NextResponse.json({ desktop, mobile });
  } catch (err) {
    return NextResponse.json({ desktop: [], mobile: [] }, { status: 200 });
  }
}
