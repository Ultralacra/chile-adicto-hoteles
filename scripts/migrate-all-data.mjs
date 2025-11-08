#!/usr/bin/env node
// Migración completa de lib/data.json a Supabase.
// Carga variables desde .env.local automáticamente.
// Usa Service Role (NO ejecutar en cliente). Requiere variables en .env.local.
// Estrategia:
// 1. Cargar data.json.
// 2. Construir catálogo de categorías (a partir de categories y de labels dentro de cada post si aplica).
// 3. Upsert categories.
// 4. Para cada post:
//    - Upsert row en posts (por slug).
//    - Reemplazar imágenes (delete + bulk insert ordenadas).
//    - Reemplazar traducciones unificadas (es/en) con claves uniformes.
//    - Reemplazar mapa de categorías asociadas.
//    - (Ubicaciones si aparecen en el futuro: placeholder).
// 5. Log de resumen.
// Fallback: si falta alguna columna en post_translations (ej. info_html) se degrada quitándola.

// Cargar primero .env.local (prioritario) y luego .env si existe
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });
dotenv.config(); // fallback .env
import fs from 'fs';
import path from 'path';
import process from 'process';

function envOrThrow(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta variable de entorno ${name}`);
  return v;
}

const BASE = envOrThrow('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE = envOrThrow('SUPABASE_SERVICE_ROLE_KEY');
const REST = `${BASE}/rest/v1`;

async function rest(path, init={}) {
  const res = await fetch(`${REST}${path}`, {
    ...init,
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      Prefer: 'return=representation',
      'Content-Type': 'application/json',
      ...(init.headers||{}),
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`REST ${path} ${res.status}: ${txt}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function normalizeUrl(u) {
  if (!u || typeof u !== 'string') return null;
  const t = u.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (/^www\./i.test(t)) return `https://${t}`;
  return t.startsWith('http') ? t : `https://${t}`;
}

function readData() {
  const file = path.join(process.cwd(), 'lib', 'data.json');
  const raw = fs.readFileSync(file, 'utf-8');
  return JSON.parse(raw);
}

function extractCategorySet(posts) {
  const set = new Set();
  for (const p of posts) {
    if (Array.isArray(p.categories)) {
      for (const c of p.categories) {
        if (c && typeof c === 'string') set.add(c.trim());
      }
    }
    // También considerar p.es?.category y p.en?.category
    const esCat = p.es?.category; if (esCat) set.add(String(esCat).trim());
    const enCat = p.en?.category; if (enCat) set.add(String(enCat).trim());
  }
  return set;
}

async function upsertCategories(catSet) {
  if (catSet.size === 0) return [];
  // Obtener existentes
  const existing = await rest(`/categories?select=id,slug,label_es,label_en`);
  const existBySlug = new Map(existing.map(r => [r.slug, r]));
  const payload = [];
  for (const labelEs of catSet) {
    const slug = labelEs.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    if (existBySlug.has(slug)) continue; // ya existe
    payload.push({ slug, label_es: labelEs, label_en: labelEs });
  }
  if (payload.length === 0) return existing;
  const inserted = await rest('/categories', { method: 'POST', body: JSON.stringify(payload) });
  return existing.concat(inserted);
}

async function findPostIdBySlug(slug) {
  const rows = await rest(`/posts?slug=eq.${encodeURIComponent(slug)}&select=id`);
  return rows?.[0]?.id || null;
}

async function upsertPost(base) {
  // Base contiene slug, featuredImage, website, instagram, etc.
  const existingId = await findPostIdBySlug(base.slug);
  const record = {
    slug: base.slug,
    featured_image: base.featuredImage || null,
    website: normalizeUrl(base.website) || null,
    instagram: base.instagram || null,
    website_display: base.website_display || base.website || null,
    instagram_display: base.instagram_display || base.instagram || null,
    email: base.email || null,
    phone: base.phone || null,
    photos_credit: base.photosCredit || null,
    address: base.address || null,
    hours: base.hours || null,
    reservation_link: normalizeUrl(base.reservationLink) || null,
    reservation_policy: base.reservationPolicy || null,
    interesting_fact: base.interestingFact || null,
  };
  if (existingId) {
    await rest(`/posts?id=eq.${existingId}`, { method:'PATCH', body: JSON.stringify(record) });
    return existingId;
  } else {
    const inserted = await rest('/posts', { method:'POST', body: JSON.stringify([record]) });
    return inserted[0].id;
  }
}

function buildTranslationsPayload(postId, post) {
  const esT = post.es || {};
  const enT = post.en || {};
  const payload = [
    {
      post_id: postId,
      lang: 'es',
      name: esT.name ? String(esT.name).trim() : null,
      subtitle: esT.subtitle ? String(esT.subtitle).trim() : null,
      description: Array.isArray(esT.description) ? esT.description : [],
      info_html: esT.infoHtml ? String(esT.infoHtml).trim() : null,
      category: esT.category ? String(esT.category).trim() : null,
    },
    {
      post_id: postId,
      lang: 'en',
      name: enT.name ? String(enT.name).trim() : null,
      subtitle: enT.subtitle ? String(enT.subtitle).trim() : null,
      description: Array.isArray(enT.description) ? enT.description : [],
      info_html: enT.infoHtml ? String(enT.infoHtml).trim() : null,
      category: enT.category ? String(enT.category).trim() : null,
    },
  ];
  return payload;
}

async function replaceTranslations(postId, post) {
  const payload = buildTranslationsPayload(postId, post);
  const should = payload.some(t => (t.name||t.subtitle||t.info_html||t.category||(Array.isArray(t.description)&&t.description.length>0)));
  if (!should) return;
  await rest(`/post_translations?post_id=eq.${postId}`, { method:'DELETE' });
  try {
    await rest('/post_translations', { method:'POST', body: JSON.stringify(payload) });
  } catch (e) {
    // fallback quitar columnas inexistentes manteniendo uniformidad
    let errCurr = e;
    const prune = new Set();
    const msg = String(errCurr?.message||'');
    for (const m of msg.matchAll(/Could not find the '([a-zA-Z0-9_]+)' column/gi)) prune.add(m[1]);
    if (prune.size>0) {
      const degraded = payload.map(o=>{ const c={...o}; for(const col of prune) delete c[col]; return c; });
      try { await rest('/post_translations',{method:'POST',body:JSON.stringify(degraded)}); errCurr=null; } catch(e2){ errCurr=e2; }
    }
    if (errCurr) {
      for (let i=0;i<5 && errCurr;i++) {
        const m2 = String(errCurr?.message||'').match(/column\s+[^.]*\.?([a-zA-Z0-9_]+)\s+does not exist/i);
        if (!m2) break;
        prune.add(m2[1]);
        const degraded = payload.map(o=>{ const c={...o}; for(const col of prune) delete c[col]; return c; });
        try { await rest('/post_translations',{method:'POST',body:JSON.stringify(degraded)}); errCurr=null; break; } catch(e3){ errCurr=e3; }
      }
    }
    if (errCurr) throw errCurr;
  }
}

async function replaceImages(postId, post) {
  const imgs = Array.isArray(post.images) ? post.images.filter(Boolean) : [];
  await rest(`/post_images?post_id=eq.${postId}`, { method:'DELETE' });
  if (imgs.length === 0) return;
  const payload = imgs.map((url, idx) => ({ post_id: postId, url, position: idx }));
  await rest('/post_images', { method:'POST', body: JSON.stringify(payload) });
}

async function replaceCategories(postId, post, allCats) {
  const wanted = new Set();
  (post.categories||[]).forEach(c=>{ if(c) wanted.add(String(c).trim().toUpperCase()); });
  const esCat = post.es?.category; if (esCat) wanted.add(String(esCat).trim().toUpperCase());
  const enCat = post.en?.category; if (enCat) wanted.add(String(enCat).trim().toUpperCase());
  if (wanted.size === 0) {
    await rest(`/post_category_map?post_id=eq.${postId}`, { method:'DELETE' });
    return;
  }
  const matches = allCats.filter(c => wanted.has(String(c.label_es||c.slug||'').toUpperCase()));
  await rest(`/post_category_map?post_id=eq.${postId}`, { method:'DELETE' });
  if (matches.length === 0) return;
  const payload = matches.map(c => ({ post_id: postId, category_id: c.id }));
  await rest('/post_category_map', { method:'POST', body: JSON.stringify(payload) });
}

async function migrate() {
  const posts = readData();
  console.log(`Total posts en data.json: ${posts.length}`);
  const catSet = extractCategorySet(posts);
  console.log(`Categorias detectadas: ${Array.from(catSet).length}`);
  const allCats = await upsertCategories(catSet);
  console.log(`Categorias totales en BD tras upsert: ${allCats.length}`);

  let ok=0, fail=0;
  for (const p of posts) {
    try {
      if (!p.slug) {
        console.warn('Post sin slug, saltando');
        fail++; continue;
      }
      const postId = await upsertPost(p);
      await replaceTranslations(postId, p);
      await replaceImages(postId, p);
      await replaceCategories(postId, p, allCats);
      ok++;
    } catch (e) {
      fail++;
      console.error('Error migrando', p.slug, e.message);
    }
  }
  console.log(`Migración completa. OK=${ok} FAIL=${fail}`);
}

migrate().catch(e=>{ console.error('Fallo migración global', e); process.exit(1); });
