import fs from 'node:fs';
import path from 'node:path';

// Minimal HTML -> text paragraph extractor
function htmlToParagraphs(html) {
  if (!html || typeof html !== 'string') return [];
  let s = html;
  // Normalize BRs to newlines
  s = s.replace(/<\s*br\s*\/?>/gi, '\n');
  // Remove scripts/styles
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '')
       .replace(/<style[\s\S]*?<\/style>/gi, '');
  // Replace block tags with double newlines to preserve paragraphs
  const blockTags = ['p','div','section','article','ul','ol','li','h1','h2','h3','h4','h5','h6','blockquote','pre','address'];
  for (const tag of blockTags) {
    const reOpen = new RegExp(`<${tag}[^>]*>`, 'gi');
    const reClose = new RegExp(`</${tag}>`, 'gi');
    s = s.replace(reOpen, '\n')
         .replace(reClose, '\n');
  }
  // Strip remaining tags
  s = s.replace(/<[^>]+>/g, '');
  // Decode basic HTML entities
  s = s.replace(/&nbsp;/g, ' ')
       .replace(/&amp;/g, '&')
       .replace(/&quot;/g, '"')
       .replace(/&#39;/g, "'")
       .replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>');
  // Normalize whitespace
  s = s.replace(/\r\n?|\n/g, '\n');
  // Collapse 3+ newlines to 2
  s = s.replace(/\n{3,}/g, '\n\n');
  // Split by double newline boundaries into paragraphs
  const rawParas = s.split(/\n\n+/).map(t => t.trim());
  // Filter out empties and very short noise
  const paras = rawParas.filter(t => t && /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(t));
  return paras;
}

function main() {
  const root = process.cwd();
  const wpPath = path.join(root, 'lib', fs.readdirSync(path.join(root,'lib')).find(f => f.startsWith('wordpress-export-categorias') && f.endsWith('.json')));
  const dataPath = path.join(root, 'lib', 'data.json');

  const wp = JSON.parse(fs.readFileSync(wpPath, 'utf8'));
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // Build maps: slug+lang -> paragraphs
  const esMap = new Map();
  const enMap = new Map();

  for (const post of (wp.posts || [])) {
    const baseSlug = post.slug;
    const content = post.content || '';
    const poly = post.polylang || {};
    const lang = poly.language; // 'es' or 'eng'

    // Map current post language/content
    if (baseSlug && lang && (lang === 'es' || lang === 'eng')) {
      const paras = htmlToParagraphs(content);
      if (lang === 'es') esMap.set(baseSlug, paras);
      else if (lang === 'eng') enMap.set(baseSlug, paras);
    }

    // Map available translations (carry full HTML under translations)
    const tr = poly.translations || {};
    const hasEs = tr.es && tr.es.slug && tr.es.content;
    const hasEn = tr.eng && tr.eng.slug && tr.eng.content;
    const esSlug = hasEs ? tr.es.slug : (lang === 'es' ? baseSlug : undefined);
    const enSlug = hasEn ? tr.eng.slug : (lang === 'eng' ? baseSlug : undefined);
    const esParas = hasEs ? htmlToParagraphs(tr.es.content) : (lang === 'es' ? htmlToParagraphs(content) : undefined);
    const enParas = hasEn ? htmlToParagraphs(tr.eng.content) : (lang === 'eng' ? htmlToParagraphs(content) : undefined);
    if (esSlug && esParas) esMap.set(esSlug, esParas);
    if (enSlug && enParas) enMap.set(enSlug, enParas);
    // Bridge: map cross-language slugs to allow datasets using a single slug to resolve both
    if (esSlug && enParas) enMap.set(esSlug, enParas);
    if (enSlug && esParas) esMap.set(enSlug, esParas);
  }

  let updated = 0;
  let missingEs = 0;
  let missingEn = 0;

  for (const item of data) {
    const slug = item.slug;
    if (!slug) continue;

    // Spanish
    if (item.es) {
      const paras = esMap.get(slug);
      if (paras && paras.length) {
        item.es.description = paras;
        updated++;
      } else {
        missingEs++;
      }
    }
    // English
    if (item.en) {
      const paras = enMap.get(slug);
      if (paras && paras.length) {
        item.en.description = paras;
        updated++;
      } else {
        missingEn++;
      }
    }
  }

  // Write back with pretty formatting
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated descriptions for ${updated} entries. Missing es: ${missingEs}, missing en: ${missingEn}`);
}

// Execute immediately when run with node
try { main(); }
catch (e) { console.error(e); process.exit(1); }
