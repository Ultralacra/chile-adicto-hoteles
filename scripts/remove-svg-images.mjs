import fs from 'fs';
import path from 'path';

const dataPath = path.resolve(process.cwd(), 'lib', 'data.json');

function isSvg(url) {
  if (typeof url !== 'string') return false;
  return /\.svg(\?.*)?$/i.test(url) || /\/iso\.svg(\?.*)?$/i.test(url);
}

function unique(arr) {
  return Array.from(new Set(arr));
}

function main() {
  if (!fs.existsSync(dataPath)) {
    console.error('No se encontró lib/data.json');
    process.exit(1);
  }
  const raw = fs.readFileSync(dataPath, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error('Error parseando lib/data.json:', e.message);
    process.exit(1);
  }

  if (!Array.isArray(json)) {
    console.error('lib/data.json no es un array');
    process.exit(1);
  }

  let totalRemoved = 0;
  const updated = json.map((item) => {
    const images = Array.isArray(item.images) ? item.images : [];
    const filtered = images.filter((u) => u && !isSvg(u));
    totalRemoved += images.length - filtered.length;
    return { ...item, images: unique(filtered) };
  });

  fs.writeFileSync(dataPath, JSON.stringify(updated, null, 2), 'utf8');
  console.log(`SVGs removidos: ${totalRemoved}. Archivo actualizado: lib/data.json`);
}

main();
