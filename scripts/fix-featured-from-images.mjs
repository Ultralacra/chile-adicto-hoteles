// Node script: move first image to featuredImage and remove it from images gallery
// Creates a timestamped backup before writing.
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) + '-' +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds())
  );
}

const root = join(__dirname, '..');
const dataPath = join(root, 'lib', 'data.json');
const backupPath = join(root, 'lib', `data.backup-${nowStamp()}.json`);

function unique(arr) {
  return Array.from(new Set(arr));
}

try {
  const raw = readFileSync(dataPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    console.error('data.json no es un array. Abortando.');
    process.exit(2);
  }

  // Backup
  copyFileSync(dataPath, backupPath);

  const updated = parsed.map((post) => {
    try {
      const p = { ...post };
      const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
      const currentFeatured = typeof p.featuredImage === 'string' ? p.featuredImage.trim() : '';

      let featured = currentFeatured;
      if (!featured) {
        featured = imgs[0] || '';
      }

      // Filter gallery: remove the featured image (exact string match)
      let gallery = imgs.filter((img) => img && img !== featured);
      gallery = unique(gallery);

      // If featured is empty but there are images, keep first as featured
      if (!featured && gallery.length) {
        featured = gallery[0];
        gallery = gallery.slice(1);
      }

      return {
        ...p,
        featuredImage: featured || undefined,
        images: gallery,
      };
    } catch (e) {
      // If an entry fails, keep it as-is
      return post;
    }
  });

  // Write back prettified
  writeFileSync(dataPath, JSON.stringify(updated, null, 2) + '\n', 'utf8');
  console.log('✅ data.json actualizado. Backup en:', backupPath);
  // Quick sanity: count posts that now have featuredImage
  const countFeatured = updated.reduce((acc, p) => acc + (p.featuredImage ? 1 : 0), 0);
  console.log('Posts con featuredImage:', countFeatured, '/', updated.length);
} catch (err) {
  console.error('Error procesando data.json:', err);
  process.exit(1);
}
