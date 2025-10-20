import fs from 'fs'
import path from 'path'

const root = path.resolve('./')
const src = path.join(root, 'lib', 'wordpress-export-categorias-1-2025-10-20-151936.json')
const out = path.join(root, 'lib', 'arquitectura.json')

const raw = fs.readFileSync(src, 'utf8')
const data = JSON.parse(raw)
const posts = data.posts || []

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function extractSubtitle(titleHtml) {
  const m = titleHtml.match(/<span[^>]*class="sub_tex"[^>]*>(.*?)<\/span>/i)
  return m ? stripHtml(m[1]) : ''
}

function extractMainTitle(titleHtml) {
  const brIdx = titleHtml.indexOf('<br')
  const spanIdx = titleHtml.indexOf('<span')
  let end = titleHtml.length
  if (brIdx !== -1) end = Math.min(end, brIdx)
  if (spanIdx !== -1) end = Math.min(end, spanIdx)
  return stripHtml(titleHtml.slice(0, end))
}

function extractParagraphs(contentHtml) {
  if (!contentHtml) return []
  // Normalize paragraph and line break tags into newlines
  let s = contentHtml.replace(/<style[\s\S]*?<\/style>/gi, '')
  s = s.replace(/<\/p>/gi, '\n\n')
  s = s.replace(/<br\s*\/?>/gi, '\n')
  // Remove any remaining tags but preserve newlines
  s = s.replace(/<[^>]+>/g, '')
  // Normalize CRLF and multiple newlines
  s = s.replace(/\r\n?/g, '\n')
  s = s.replace(/\n{2,}/g, '\n\n')
  // Split by double newlines into paragraphs
  const parts = s.split(/\n\n/).map(p => stripHtml(p)).map(p => p.trim()).filter(Boolean)
  return parts
}

function pickImages(imagesBlock) {
  const outImages = []
  if (!imagesBlock) return outImages
  const add = (img) => {
    if (!img || !img.sizes) return
    if (img.sizes.full && img.sizes.full[0]) outImages.push(img.sizes.full[0])
    else if (img.sizes.large && img.sizes.large[0]) outImages.push(img.sizes.large[0])
  }
  if (Array.isArray(imagesBlock.content_images)) imagesBlock.content_images.forEach(add)
  if (imagesBlock.featured_image) add(imagesBlock.featured_image)
  return Array.from(new Set(outImages))
}

// Build a map by id
const byId = new Map()
posts.forEach(p => byId.set(p.id, p))

const processed = new Set()
const outArr = []

for (const p of posts) {
  if (processed.has(p.id)) continue
  const pol = (p.polylang && p.polylang.translations) || {}
  // translation ids
  const enId = pol.eng && pol.eng.id || pol.en && pol.en.id
  const esId = pol.es && pol.es.id

  let enPost = null
  let esPost = null

  if (p.polylang && p.polylang.language === 'eng') enPost = p
  if (p.polylang && p.polylang.language === 'es') esPost = p

  if (enId && !enPost) enPost = byId.get(enId)
  if (esId && !esPost) esPost = byId.get(esId)

  // if current is one of them and counterpart missing, try counterpart from map
  if (!enPost && p.slug && p.slug.includes('/eng/')) enPost = p
  if (!esPost && p.slug && !p.slug.includes('/eng/')) esPost = p

  // fallback: if neither, try to deduce by language field in polylang
  if (!enPost || !esPost) {
    // search via polylang groups
    const group = p.polylang && p.polylang.translations && p.polylang.translations.es && p.polylang.translations.en ? p.polylang.translations : null
    if (group) {
      const enCandidate = group.en && byId.get(group.en.id)
      const esCandidate = group.es && byId.get(group.es.id)
      if (enCandidate) enPost = enCandidate
      if (esCandidate) esPost = esCandidate
    }
  }

  // final fallback: both same
  if (!enPost && !esPost) { enPost = p; esPost = p }
  if (!enPost) enPost = esPost
  if (!esPost) esPost = enPost

  processed.add(enPost.id)
  processed.add(esPost.id)

  const item = {
    slug: (enPost.slug || esPost.slug || ('post-' + p.id)).replace(/^eng\//, ''),
    en: {
      name: extractMainTitle(enPost.title || ''),
      subtitle: extractSubtitle(enPost.title || ''),
      description: extractParagraphs(enPost.content || ''),
      category: 'ARCHITECTURE'
    },
    es: {
      name: extractMainTitle(esPost.title || ''),
      subtitle: extractSubtitle(esPost.title || ''),
      description: extractParagraphs(esPost.content || ''),
      category: 'ARQUITECTURA'
    },
    images: pickImages(enPost.images || esPost.images || {}),
    website: '',
    instagram: '',
    categories: ['ALL','ARCHITECTURE']
  }

  outArr.push(item)
}

fs.writeFileSync(out, JSON.stringify(outArr, null, 2), 'utf8')
console.log('Wrote', out, 'items', outArr.length)
