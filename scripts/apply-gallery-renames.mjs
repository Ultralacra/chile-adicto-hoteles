// Aplica las sugerencias del CSV (gallery_renames.csv) a lib/data.json
// Genera lib/data.patched.json con las URLs actualizadas (solo cambia el nombre de archivo).
// IMPORTANTE: Primero debes renombrar los archivos en el servidor para que las nuevas URLs existan.
import fs from 'node:fs';
import path from 'node:path';

const dataPath = path.resolve(process.cwd(), 'lib', 'data.json');
const csvPath = path.resolve(process.cwd(), 'scripts', 'output', 'gallery_renames.csv');
const outPath = path.resolve(process.cwd(), 'lib', 'data.patched.json');

function readCsv(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const header = lines.shift();
  // slug,old_url,suggested_new_filename,reason
  const out = [];
  for (const line of lines) {
    const cols = parseCsvLine(line);
    if (cols.length < 4) continue;
    out.push({ slug: cols[0], old: cols[1], suggested: cols[2], reason: cols[3] });
  }
  return out;
}

function parseCsvLine(line) {
  const arr = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else { inQ = false; }
      } else cur += ch;
    } else {
      if (ch === ',') { arr.push(cur); cur = ''; }
      else if (ch === '"') { inQ = true; }
      else cur += ch;
    }
  }
  arr.push(cur);
  return arr.map((s) => s.replace(/^"|"$/g, ''));
}

function replaceFilename(url, newFilename) {
  const qIdx = url.indexOf('?');
  const base = qIdx >= 0 ? url.slice(0, qIdx) : url;
  const suff = qIdx >= 0 ? url.slice(qIdx) : '';
  const parts = base.split('/');
  parts[parts.length - 1] = newFilename;
  return parts.join('/') + suff;
}

const raw = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(raw);
const rows = readCsv(csvPath);

let changes = 0;

for (const row of rows) {
  const slug = stripQuotes(row.slug);
  const oldUrl = stripQuotes(row.old);
  const newFile = stripQuotes(row.suggested);
  const item = data.find((x) => x.slug === slug);
  if (!item || !Array.isArray(item.images)) continue;
  const idx = item.images.findIndex((u) => u === oldUrl);
  if (idx === -1) continue;
  item.images[idx] = replaceFilename(oldUrl, newFile);
  changes++;
}

fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Patched ${changes} url(s). Escribí: ${outPath}`);

function stripQuotes(s) {
  return String(s || '').replace(/^"|"$/g, '');
}
