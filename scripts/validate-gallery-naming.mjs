// Validación de galerías
// - Ninguna imagen con 'PORTADA' debe estar en images[]
// - Si existen numeradas, deben comenzar en 1 y ser continuas hasta el máximo (1..N)
import fs from 'node:fs';
import path from 'node:path';

const dataPath = path.resolve(process.cwd(), 'lib', 'data.json');
const raw = fs.readFileSync(dataPath, 'utf8');
/** @type {Array<any>} */
const entries = JSON.parse(raw);

function fileBase(name) {
  const last = String(name || '').split('?')[0].split('/').pop() || '';
  return last.toLowerCase().replace(/\.[^.]+$/, '');
}

function getIndex(name) {
  const base = fileBase(name);
  const m = base.match(/(\d{1,4})/);
  return m ? parseInt(m[1], 10) : NaN;
}

let issues = 0;
let issuesPortada = 0;
let issuesMin = 0;
let issuesGaps = 0;

for (const post of entries) {
  const slug = post.slug || '(sin-slug)';
  const list = Array.isArray(post.images) ? post.images.filter(Boolean) : [];
  if (!list.length) continue;

  const hasPortadaInList = list.some((s) => /portada/i.test(fileBase(s)));
  if (hasPortadaInList) {
    issues++;
    issuesPortada++;
    console.log(`PORTADA en galería -> slug=${slug}`);
  }

  const numeradas = list
    .map((s) => ({ s, idx: getIndex(s) }))
    .filter((x) => Number.isFinite(x.idx));

  if (numeradas.length) {
    const idxs = numeradas.map((x) => x.idx).sort((a, b) => a - b);
    const min = idxs[0];
    if (min !== 1) {
      issues++;
      issuesMin++;
      console.log(`Galería no comienza en 1 -> slug=${slug}, min=${min}`);
    }

    // chequear continuidad 1..max
    const max = idxs[idxs.length - 1];
    const set = new Set(idxs);
    const missing = [];
    for (let i = 1; i <= max; i++) {
      if (!set.has(i)) missing.push(i);
    }
    if (missing.length) {
      issues++;
      issuesGaps++;
      console.log(`Galería con huecos -> slug=${slug}, faltan: ${missing.join(', ')}`);
    }
  }
}

if (!issues) {
  console.log('OK: Todas las galerías cumplen (sin PORTADA en images[] y numeradas empiezan en 1 donde aplica).');
} else {
  console.log(`\nTotal de issues: ${issues}`);
  console.log(`- Con PORTADA en images[]: ${issuesPortada}`);
  console.log(`- No comienzan en 1: ${issuesMin}`);
  console.log(`- Con huecos en la secuencia: ${issuesGaps}`);
  console.log('\nSugerencias:');
  console.log('- Mover/retirar PORTADA de images[] (dejarla como featured si corresponde).');
  console.log('- Renombrar en el servidor para que la secuencia sea 1..N sin huecos (y actualizar data si cambia la URL).');
}
