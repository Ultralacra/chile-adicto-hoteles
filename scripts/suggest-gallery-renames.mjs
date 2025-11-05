// Genera un CSV con sugerencias de renombre para que las galerías:
// - Comiencen en 1
// - Sean continuas (1..N) sin huecos
// No toca archivos ni edita data.json: solo propone nombres destino.
import fs from 'node:fs';
import path from 'node:path';

const dataPath = path.resolve(process.cwd(), 'lib', 'data.json');
const outDir = path.resolve(process.cwd(), 'scripts', 'output');
const outCsv = path.resolve(outDir, 'gallery_renames.csv');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const raw = fs.readFileSync(dataPath, 'utf8');
/** @type {Array<any>} */
const entries = JSON.parse(raw);

function fileParts(url) {
  const clean = String(url || '').split('?')[0];
  const fn = clean.split('/').pop() || '';
  const ext = (fn.match(/\.[^.]+$/) || [''])[0];
  const base = fn.replace(/\.[^.]+$/, '');
  return { clean, fn, base, ext };
}

function getIndexFromBase(base) {
  const m = String(base).match(/(\d{1,4})$/);
  return m ? parseInt(m[1], 10) : NaN;
}

function stripTrailingIndex(base) {
  // quita un -NNN final si existe
  return String(base).replace(/-\d{1,4}$/, '');
}

const rows = [];
for (const post of entries) {
  const slug = post.slug || '(sin-slug)';
  const list = Array.isArray(post.images) ? post.images.filter(Boolean) : [];
  if (!list.length) continue;

  // separar PORTADA y numeradas
  const numeradas = [];
  for (const url of list) {
    const { base, ext } = fileParts(url);
    if (/portada/i.test(base)) continue; // ignorar portada
    const idx = getIndexFromBase(base);
    if (Number.isFinite(idx)) numeradas.push({ url, base, ext, idx });
  }
  if (!numeradas.length) continue;

  // ordenar por idx asc
  numeradas.sort((a, b) => a.idx - b.idx);
  const min = numeradas[0].idx;

  // Normalizamos para que arranque en 1 y sea continuo según el orden actual
  numeradas.forEach((item, i) => {
    const targetIdx = i + 1; // 1..N
    if (item.idx !== targetIdx) {
      const baseNoIdx = stripTrailingIndex(item.base);
      const newFile = `${baseNoIdx}-${targetIdx}${item.ext}`;
      rows.push({ slug, old: item.url, suggested: newFile, reason: `idx ${item.idx} -> ${targetIdx}` });
    }
  });
}

const header = 'slug,old_url,suggested_new_filename,reason\n';
const csv = rows
  .map((r) => [r.slug, r.old, r.suggested, r.reason].map((v) => JSON.stringify(String(v))).join(','))
  .join('\n');

fs.writeFileSync(outCsv, header + csv, 'utf8');
console.log(`Escrito: ${outCsv}`);
console.log(`Total sugerencias: ${rows.length}`);
