#!/usr/bin/env node
// Report posts whose gallery is missing image index 1 ("-1").
// - Reads lib/data.json by default (can pass a custom JSON path as argv[2])
// - Rebuilds the gallery using the same rules as the frontend:
//   * featured = source.featuredImage OR first filename containing "PORTADA" (case-insensitive)
//   * gallery = images[] excluding featured and any filename containing "PORTADA"
//               and including ONLY numbered images (first digit group in basename), sorted ASC
// - Outputs a CSV at scripts/output/missing_first.csv with the slugs missing index 1.
// - Prints a console summary.

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputPath = process.argv[2] || path.join(root, 'lib', 'data.json');
const outDir = path.join(root, 'scripts', 'output');
const outCsv = path.join(outDir, 'missing_first.csv');
const outJson = path.join(outDir, 'missing_first.json');

function ensureDirSync(p) {
  fs.mkdirSync(p, { recursive: true });
}

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  // strip query/hash
  let s = url.split('?')[0].split('#')[0];
  // unify slashes
  s = s.replace(/\\+/g, '/');
  // lowercase only the filename portion for robustness (host/path can be mixed case safely)
  // but for comparisons we can lowercase the whole path
  return s.trim();
}

function basenameNoExt(url) {
  const u = normalizeImageUrl(url);
  const base = path.basename(u);
  return base.replace(/\.[^.]+$/, '');
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
  // featured: explicit or PORTADA; do NOT fallback to numeradas to avoid stealing "-1" from gallery
  let featured = String(entry.featuredImage || '').trim();
  if (!featured) {
    const portada = images.find((s) => isPortada(s));
    if (portada) featured = portada;
  }
  const featuredKey = normalizeImageUrl(featured);

  const seen = new Set();
  const gallery = images
    .filter((img) => {
      const key = normalizeImageUrl(img);
      if (!key) return false;
      if (featuredKey && key === featuredKey) return false; // exclude featured
      if (isPortada(img)) return false; // exclude PORTADA
      const idx = getIndex(img);
      if (!Number.isFinite(idx)) return false; // only numbered
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((s) => ({ s, idx: getIndex(s) }))
    .sort((a, b) => a.idx - b.idx)
    .map((x) => x.s);

  const numbers = gallery.map((u) => getIndex(u)).filter(Number.isFinite);
  return { featured, gallery, numbers };
}

function toCsvRow(cols) {
  return cols.map((c) => {
    const s = String(c ?? '');
    // escape commas and quotes
    if (/[",\n]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }).join(',');
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(inputPath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Invalid JSON in', inputPath, e.message);
    process.exit(1);
  }
  if (!Array.isArray(data)) {
    console.error('Expected an array in', inputPath);
    process.exit(1);
  }

  ensureDirSync(outDir);

  const rows = [['slug', 'has_1', 'min_number', 'max_number', 'numbers']];
  const report = [];

  for (const entry of data) {
    const slug = entry.slug || '';
    const { numbers } = buildGallery(entry);
    if (numbers.length === 0) {
      // No numbered gallery; consider missing 1 as well
      rows.push([slug, 'false', '', '', '']);
      report.push({ slug, has1: false, min: null, max: null, numbers: [] });
      continue;
    }
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const has1 = numbers.includes(1);
    if (!has1) {
      rows.push([slug, 'false', String(min), String(max), numbers.join(' ') ]);
      report.push({ slug, has1, min, max, numbers });
    }
  }

  fs.writeFileSync(outCsv, rows.map(toCsvRow).join('\n'), 'utf8');
  fs.writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Total posts: ${data.length}`);
  console.log(`Missing '-1' in gallery: ${report.length}`);
  console.log(`CSV: ${path.relative(root, outCsv)}`);
  console.log(`JSON: ${path.relative(root, outJson)}`);
}

main();
