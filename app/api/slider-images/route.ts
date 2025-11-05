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

    try {
      const desktopFiles = await fs.readdir(desktopDir);
      desktop = desktopFiles
        .filter(isImage)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((f) => `/slider-desktop/${f}`);
    } catch {
      // carpeta inexistente o sin permisos -> lista vacía
      desktop = [];
    }
    try {
      const mobileFiles = await fs.readdir(mobileDir);
      mobile = mobileFiles
        .filter(isImage)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((f) => `/slider-movil/${f}`);
    } catch {
      mobile = [];
    }

    return NextResponse.json({ desktop, mobile });
  } catch (err) {
    return NextResponse.json({ desktop: [], mobile: [] }, { status: 200 });
  }
}
