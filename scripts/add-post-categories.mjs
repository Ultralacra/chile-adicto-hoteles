#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Cargar .env.local manualmente si existe
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    val = val.replace(/^['\"]|['\"]$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
} catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function srest(path, init = {}) {
  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'return=representation',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function usage() {
  console.log(`Uso: node scripts/add-post-categories.mjs <slug> <CAT1> [CAT2] [CAT3] ...\nEj.: node scripts/add-post-categories.mjs make-make SANTIAGO TODOS`);
}

async function main() {
  const [, , slug, ...cats] = process.argv;
  if (!slug || cats.length === 0) {
    usage();
    process.exit(1);
  }
  const wanted = new Set(cats.map((c) => String(c).toUpperCase()));
  console.log(`[add-post-categories] slug=%s wanted=%o`, slug, Array.from(wanted));

  // 1) Obtener post id
  const posts = await srest(`/posts?slug=eq.${encodeURIComponent(slug)}&select=id,slug`);
  if (!Array.isArray(posts) || posts.length === 0) {
    console.error(`No existe post con slug=${slug}`);
    process.exit(2);
  }
  const postId = posts[0].id;
  console.log(`[add-post-categories] postId=${postId}`);

  // 2) Obtener categorías disponibles
  const allCats = await srest(`/categories?select=id,slug,label_es,label_en`);
  const ensureCat = async (token) => {
    const labelU = String(token).toUpperCase();
    const slugL = String(token).toLowerCase();
    let found = allCats.find(
      (r) => String(r.label_es || r.slug || '').toUpperCase() === labelU || String(r.slug || '').toLowerCase() === slugL
    );
    if (found) return found.id;
    // Crear categoría si no existe
    const pretty = labelU.charAt(0) + labelU.slice(1).toLowerCase();
    const inserted = await srest(`/categories`, {
      method: 'POST',
      body: JSON.stringify([{ slug: slugL, label_es: pretty, label_en: pretty }]),
    });
    const newId = inserted?.[0]?.id;
    if (!newId) throw new Error(`No se pudo crear categoría ${token}`);
    console.log(`[add-post-categories] creada categoría '${token}' con id=${newId}`);
    allCats.push({ id: newId, slug: slugL, label_es: pretty, label_en: pretty });
    return newId;
  };
  const catIds = [];
  for (const token of wanted) {
    const id = await ensureCat(token);
    catIds.push(id);
  }
  console.log(`[add-post-categories] catIds=%o`, catIds);

  // 3) Upsert en post_category_map (evitar duplicados)
  const payload = catIds.map((id) => ({ post_id: postId, category_id: id }));
  await srest(`/post_category_map`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { Prefer: 'return=representation,resolution=merge-duplicates' },
  });
  console.log(`[add-post-categories] OK asignadas categorías a ${slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(99);
});
