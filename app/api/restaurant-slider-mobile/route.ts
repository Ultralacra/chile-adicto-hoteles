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
    const dir = path.join(base, "public", "slider-restaurant-mobil");
    let files: string[] = [];
    try {
      const list = await fs.readdir(dir);
      files = list.filter(isImage).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    } catch {
      files = [];
    }
    const hrefs = files.map((f) => `/slider-restaurant-mobil/${f}`);
    return NextResponse.json({ images: hrefs });
  } catch (err) {
    return NextResponse.json({ images: [] }, { status: 200 });
  }
}
