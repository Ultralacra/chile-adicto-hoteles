import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'lib', 'arquitectura.json');

function normalizeUrlDisplay(url) {
  if (!url) return '';
  try {
    const u = new URL(url.trim().replace(/^https?:\/\//i, 'https://'));
    return u.hostname.replace(/^www\./i, '');
  } catch (e) {
    return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }
}

function extractFromDescription(descArr) {
  if (!Array.isArray(descArr)) return {};
  const result = {};
  for (const line of descArr) {
    if (!line || typeof line !== 'string') continue;
    const l = line.trim();

    // href inside anchors
    const hrefMatch = l.match(/href=["']([^"']+)["']/i);
    if (hrefMatch) {
      const url = hrefMatch[1];
      if (url.toLowerCase().includes('instagram.com')) {
        const parts = url.split('/').filter(Boolean);
        const handle = parts[parts.length - 1] || parts[parts.length - 2];
        if (handle) {
          const clean = handle.replace(/^@/, '').split(/[?#]/)[0];
          result.instagram = result.instagram || `https://www.instagram.com/${clean}`;
          result.instagram_display = result.instagram_display || '@' + clean;
        }
      } else if (url.toLowerCase().startsWith('tel:')) {
        const num = url.replace(/[^+0-9]/g, '');
        result.phone = result.phone || ('tel:' + num);
      } else if (url.toLowerCase().startsWith('mailto:')) {
        result.email = result.email || url.replace(/^mailto:/i, '');
      } else if (/^https?:\/\//i.test(url)) {
        result.website = result.website || url;
      }
      continue;
    }

    // plain instagram handle
    const atMatch = l.match(/@([A-Za-z0-9_\.\-]+)/);
    if (atMatch) {
      const handle = atMatch[1];
      result.instagram = result.instagram || `https://www.instagram.com/${handle.replace(/\./g, '')}`;
      result.instagram_display = result.instagram_display || ('@' + handle);
      const creditMatch = l.match(/(?:PHOTOS?:|FOTOGRAF[IÍ]AS?:|PHOTOGRAPHS BY)\s*(.*)/i);
      if (creditMatch) result.photosCredit = result.photosCredit || creditMatch[1].replace(/<[^>]+>/g, '').trim();
      continue;
    }

    // photos credit lines
    const photosMatch = l.match(/^(PHOTOS[:]*|FOTOGRAF[IÍ]AS[:]*|PHOTOGRAPHS BY)\s*(.*)$/i);
    if (photosMatch) {
      result.photosCredit = result.photosCredit || photosMatch[2].replace(/<[^>]+>/g, '').trim();
      continue;
    }

    // telephone lines
    const telMatch = l.match(/tel[:]*\s*\+?([0-9+\s()\-]{6,})/i) || l.match(/\+?[0-9][0-9\s()\-]{6,}/);
    if (telMatch) {
      const num = (telMatch[1] || telMatch[0]).replace(/[^+0-9]/g, '');
      result.phone = result.phone || ('tel:' + num);
      continue;
    }
  }
  return result;
}

function normalizeEntry(entry) {
  const out = { ...entry };
  const candidates = ['en', 'es'];
  let found = {};
  for (const lang of candidates) {
    if (!entry[lang] || !entry[lang].description) continue;
    const extracted = extractFromDescription(entry[lang].description);
    found = { ...found, ...extracted };
    out[lang] = { ...entry[lang] };
    out[lang].description = entry[lang].description.filter((line) => {
      if (!line || typeof line !== 'string') return true;
      const low = line.toLowerCase();
      if (/<a[^>]*href=.*instagram.*>/i.test(line) || /@([a-z0-9_\.\-]+)/i.test(line) || /photos[:]|fotograf/i.test(low) || /href=["']https?:\/\//i.test(line)) {
        return false;
      }
      return true;
    });
  }

  // prefer explicit fields already present
  if (entry.website) found.website = found.website || entry.website;
  if (entry.instagram) found.instagram = found.instagram || entry.instagram;
  if (entry.phone) found.phone = found.phone || entry.phone;
  if (entry.email) found.email = found.email || entry.email;
  if (entry.photosCredit) found.photosCredit = found.photosCredit || entry.photosCredit;
  if (entry.website_display) found.website_display = found.website_display || entry.website_display;
  if (entry.instagram_display) found.instagram_display = found.instagram_display || entry.instagram_display;

  // normalize displays
  if (found.website) {
    out.website = found.website;
    out.website_display = found.website_display || normalizeUrlDisplay(found.website);
  } else {
    out.website = out.website || '';
    out.website_display = out.website_display || '';
  }
  if (found.instagram) {
    out.instagram = found.instagram;
    out.instagram_display = out.instagram_display || found.instagram_display || ('@' + out.instagram.replace(/https?:\/\//i, '').replace(/(www\.)?instagram\.com\//i, ''));
  } else {
    out.instagram = out.instagram || '';
    out.instagram_display = out.instagram_display || '';
  }
  out.phone = found.phone || out.phone || '';
  out.email = found.email || out.email || '';
  out.photosCredit = found.photosCredit || out.photosCredit || '';

  // append localized contact lines to descriptions if fields exist
  const buildLines = { en: [], es: [] };
  if (out.website) {
    const href = `<a href="${out.website}" target="_blank" rel="noopener noreferrer">${out.website_display || normalizeUrlDisplay(out.website)}</a>`;
    buildLines.en.push(`Website: ${href}`);
    buildLines.es.push(`WEB: ${href}`);
  }
  if (out.instagram) {
    const href = `<a href="${out.instagram}" target="_blank" rel="noopener noreferrer">${out.instagram_display || out.instagram}</a>`;
    buildLines.en.push(`Instagram: ${href}`);
    buildLines.es.push(`INSTAGRAM: ${href}`);
  }
  if (out.phone) {
    const tel = out.phone.startsWith('tel:') ? out.phone : `tel:${out.phone}`;
    buildLines.en.push(`Phone: <a href="${tel}">${tel.replace(/^tel:/, '')}</a>`);
    buildLines.es.push(`TELÉFONO: <a href="${tel}">${tel.replace(/^tel:/, '')}</a>`);
  }
  if (out.email) {
    const mail = out.email.includes('mailto:') ? out.email : `mailto:${out.email}`;
    buildLines.en.push(`Email: <a href="${mail}">${out.email.replace(/^mailto:/, '')}</a>`);
    buildLines.es.push(`EMAIL: <a href="${mail}">${out.email.replace(/^mailto:/, '')}</a>`);
  }
  if (out.photosCredit) {
    buildLines.en.push(`PHOTOS: ${out.photosCredit}`);
    buildLines.es.push(`FOTOGRAFÍAS: ${out.photosCredit}`);
  }

  for (const lang of ['en', 'es']) {
    if (!out[lang]) continue;
    const current = out[lang].description.join('\n').toLowerCase();
    const linesToAdd = buildLines[lang].filter((ln) => {
      const check = ln.replace(/<[^>]+>/g, '').toLowerCase();
      return !current.includes(check);
    });
    if (linesToAdd.length) {
      out[lang].description = out[lang].description.concat(linesToAdd);
    }
  }

  return out;
}

function main() {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    console.error('Expected array in arquitectura.json');
    process.exit(1);
  }
  const normalized = data.map((entry) => normalizeEntry(entry));
  fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), 'utf-8');
  console.log('Normalized', normalized.length, 'entries in', filePath);
}

main();
