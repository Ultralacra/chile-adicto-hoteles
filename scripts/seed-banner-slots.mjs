import { config } from "dotenv";
import { promises as fs } from "node:fs";
import path from "node:path";

config({ path: path.join(process.cwd(), ".env.local") });

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";
const site = process.env.BANNER_SEED_SITE || "santiagoadicto";
const force = process.argv.includes("--force");

if (!baseUrl || !serviceKey) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
}

const banners = {
  "home-promo-toyota": ["/iconos/BANNER RUTA TOYOTA.webp"],
  "home-promo-cafes": ["/bannerHome/30 CAFES.webp"],
  "home-promo-restaurantes": [
    "/bannerHome/70 RESTAURANTES.webp",
    "/bannerHome/restaurantes movil.png",
  ],
  "home-promo-monumentos": [
    "/bannerHome/BANNER MONUMENTOS.svg",
    "/bannerHome/monumentos movil.png",
  ],
  "category-cafes": [
    "/bannerHome/BANNER DESKTOP 50 CAFES.webp",
    "/bannerHome/30 CAFES.webp",
  ],
  "category-monumentos": [
    "/bannerHome/BANNER MONUMENTOS.svg",
    "/bannerHome/monumentos movil.png",
  ],
  "category-iconos": ["/bannerstoyota/BANNER LA RUTA TOYOTA ICONOS.png"],
  "category-parques": ["/bannerstoyota/BANNER LA RUTA TOYOTA.webp"],
  "category-toyota": ["/bannerstoyota/BANNER LA RUTA TOYOTA.webp"],
  "category-top-restaurantes": [
    "/bannerRestaurantes/BANER DESKTOP 50 BEST.webp",
    "/bannerRestaurantes/BANNER MOVIL 50 BEST.webp",
  ],
  "restaurants-main": [
    "/bannerRestaurantes/BANER DESKTOP 50 RESTORANES.webp",
    "/bannerRestaurantes/BANER MOVIL 50 RESTORANES.webp",
  ],
  "bars-main": [
    "/bannerRestaurantes/BANER DESKTOP 50 BARES.webp",
    "/bannerRestaurantes/BANER MOVIL 50 BARES.webp",
  ],
  "restaurants-interior": [
    "/bannerRestaurantes/BANER DESKTOP interior 67 RESTORANES.webp",
    "/bannerRestaurantes/BANER MOVIL interior 67 RESTORANES.webp",
  ],
  "bars-interior": [
    "/bannerRestaurantes/BANER DESKTOP interior 23 BARES.webp",
    "/bannerRestaurantes/BANER MOVIL interior 23 BARES.webp",
  ],
  "top-restaurants": [
    "/bannerRestaurantes/LAtin amerdicans.webp",
  ],
  "post-toyota": ["/bannerstoyota/BANNER POST RUTA TOYOTA.webp"],
  "post-cafes": [
    "/bannerHome/BANNER DESKTOP 50 CAFES.webp",
    "/bannerHome/30 CAFES.webp",
  ],
  "post-monumentos": [
    "/bannerHome/BANNER MONUMENTOS.svg",
    "/bannerHome/monumentos movil.png",
  ],
  "post-iconos": ["/bannerstoyota/BANNER LA RUTA TOYOTA ICONOS.png"],
  "post-parques": ["/bannerstoyota/BANNER LA RUTA TOYOTA.webp"],
  "post-top-restaurants": [
    "/bannerRestaurantes/BANER DESKTOP 50 BEST.webp",
    "/bannerRestaurantes/BANNER MOVIL 50 BEST.webp",
  ],
  "post-restaurants": [
    "/bannerRestaurantes/BANER DESKTOP interior 67 RESTORANES.webp",
    "/bannerRestaurantes/BANER MOVIL interior 67 RESTORANES.webp",
  ],
  "post-bars": [
    "/bannerRestaurantes/BANER DESKTOP interior 23 BARES.webp",
    "/bannerRestaurantes/BANER MOVIL interior 23 BARES.webp",
  ],
};

function headers() {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function rest(resource, init = {}) {
  const response = await fetch(`${baseUrl}/rest/v1${resource}`, {
    ...init,
    headers: { ...headers(), ...(init.headers || {}) },
  });
  if (!response.ok) {
    throw new Error(`${init.method || "GET"} ${resource}: ${response.status} ${await response.text()}`);
  }
  return response.status === 204 ? null : response.json();
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === ".svg" ? "image/svg+xml" : ext === ".png" ? "image/png" : "image/webp";
}

async function uploadAsset(relativePath) {
  const localPath = path.join(process.cwd(), "public", relativePath.replace(/^\//, ""));
  const body = await fs.readFile(localPath);
  const storagePath = `banners/${site}/${relativePath.replace(/^\//, "")}`;
  const endpoint = `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${storagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": contentType(localPath),
      "x-upsert": "true",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
    body,
  });
  if (!response.ok) {
    throw new Error(`Upload ${relativePath}: ${response.status} ${await response.text()}`);
  }
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${storagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

for (const [key, assets] of Object.entries(banners)) {
  const existing = await rest(
    `/sliders?site=eq.${encodeURIComponent(site)}&set_key=eq.${encodeURIComponent(key)}&select=id&limit=1`,
  );
  if (!force && Array.isArray(existing) && existing.length > 0) {
    console.log(`SKIP ${key}: ya tiene contenido`);
    continue;
  }

  const items = [];
  for (const asset of assets) {
    const imageUrl = await uploadAsset(asset);
    items.push({
      set_key: key,
      site,
      image_url: imageUrl,
      href: key.includes("restaurant") ? "/restaurantes" : key.includes("bars") ? "/categoria/bares" : null,
      position: items.length,
      active: true,
    });
  }

  await rest(`/sliders?site=eq.${encodeURIComponent(site)}&set_key=eq.${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
  await rest("/sliders", { method: "POST", body: JSON.stringify(items) });
  console.log(`SEEDED ${key}: ${items.length} imagen(es)`);
}

console.log(`Migración terminada para ${site}`);
