#!/usr/bin/env node
// Add missing "-1" image URL to images[] for posts whose gallery lacks index 1.
// - Reads lib/data.json (or a custom path argv[2])
// - Creates a .backup of the original data.json
// - Overwrites lib/data.json with patched content
// Strategy per entry:
//   1) Build gallery rules identical to frontend (exclude featured and PORTADA, only numeradas)
//   2) If numbers[] doesn't include 1 and has at least one numerada, derive new "1" URL:
//      - Take the URL with the minimum index (e.g., .../X-2.webp), replace first digit group by "1"
//      - Insert the new URL right before that min URL in images[] (preserving overall order)
//   3) Skip entries with no numeradas (cannot derive pattern safely)
//   4) Avoid duplicates

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputPath = process.argv[2] || path.join(root, 'lib', 'data.json');
const backupPath = inputPath + '.backup-' + new Date().toISOString().replace(/[:.]/g, '-');

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  // remove query/hash, normalize slashes
  let s = url.split('?')[0].split('#')[0];
  s = s.replace(/\\+/g, '/');
  return s.trim();
}

function basename(url) {
  const u = normalizeImageUrl(url);
  return path.basename(u);
}

function dirname(url) {
  const u = normalizeImageUrl(url);
  const idx = u.lastIndexOf('/');
  return idx >= 0 ? u.slice(0, idx) : '';
}

function basenameNoExt(url) {
  const b = basename(url);
  return b.replace(/\.[^.]+$/, '');
}

function extname(url) {
  const b = basename(url);
  const m = b.match(/(\.[^.]+)$/);
  return m ? m[1] : '';
}

function isPortada(url) {
  return /portada/i.test(basenameNoExt(url));
}

function getIndex(url) {
  const base = basenameNoExt(url);
  const m = base.match(/(\d{1,4})/);
  return m ? parseInt(m[1], 10) : NaN;
}

function buildGallery(entry) {
  const images = Array.isArray(entry.images) ? entry.images.filter(Boolean) : [];
  let featured = String(entry.featuredImage || '').trim();
  if (!featured) {
    const portada = images.find((s) => isPortada(s));
    if (portada) featured = portada;
  }
  const fKey = normalizeImageUrl(featured);
  const seen = new Set();
  const gallery = images
    .filter((img) => {
      const key = normalizeImageUrl(img);
      if (!key) return false;
      if (fKey && key === fKey) return false;
      if (isPortada(img)) return false;
      const idx = getIndex(img);
      if (!Number.isFinite(idx)) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((s) => ({ s, idx: getIndex(s) }))
    .sort((a, b) => a.idx - b.idx);
  return { featured, gallery };
}

function makeOneUrl(fromUrl) {
  const dir = dirname(fromUrl);
  const b = basenameNoExt(fromUrl);
  const ext = extname(fromUrl) || '.webp';
  // replace first digit group with '1'
  const newBase = b.replace(/(\d{1,4})/, '1');
  return dir ? `${dir}/${newBase}${ext}` : `${newBase}${ext}`;
}

function insertBefore(images, newUrl, beforeUrl) {
  const idx = images.findIndex((u) => normalizeImageUrl(u) === normalizeImageUrl(beforeUrl));
  if (idx === -1) {
    images.push(newUrl);
  } else {
    images.splice(idx, 0, newUrl);
  }
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error('Input not found:', inputPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(inputPath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Invalid JSON:', e.message);
    process.exit(1);
  }
  if (!Array.isArray(data)) {
    console.error('Expected array at root of', inputPath);
    process.exit(1);
  }

  let patched = 0;
  let skippedNoPattern = 0;
  let alreadyHad1 = 0;

  for (const entry of data) {
    const images = Array.isArray(entry.images) ? entry.images : [];
    if (!images.length) continue;

    const { gallery } = buildGallery(entry);
    const numbers = gallery.map((g) => g.idx);
    const has1 = numbers.includes(1);
    if (has1) {
      alreadyHad1++;
      continue;
    }
    if (numbers.length === 0) {
      // cannot determine pattern safely
      skippedNoPattern++;
      continue;
    }
    const minItem = gallery[0];
    const minUrl = minItem.s;
    const candidate = makeOneUrl(minUrl);

    // Avoid duplicates
    const exists = images.some((u) => normalizeImageUrl(u) === normalizeImageUrl(candidate));
    if (exists) {
      alreadyHad1++;
      continue;
    }

    insertBefore(images, candidate, minUrl);
    entry.images = images;
    patched++;
  }

  // Backup and write
  fs.writeFileSync(backupPath, raw, 'utf8');
  fs.writeFileSync(inputPath, JSON.stringify(data, null, 2), 'utf8');

  console.log('Patched entries (added -1):', patched);
  console.log('Skipped (no numeradas to infer pattern):', skippedNoPattern);
  console.log('Already had 1 or candidate existed:', alreadyHad1);
  console.log('Backup created at:', path.relative(root, backupPath));
}

main();
