import fs from 'fs'
import path from 'path'

const libDir = path.resolve('./lib')
const outFile = path.resolve('./lib/data.json')

function findWpExportFile() {
  const files = fs.readdirSync(libDir)
  const candidates = files.filter(f => /^wordpress-export-.*\.json$/i.test(f))
  if (!candidates.length) throw new Error('No se encontró un JSON de exportación de WordPress en lib/.')
  candidates.sort()
  return path.join(libDir, candidates[candidates.length - 1])
}

function stripHtmlPreserveText(html) {
  if (!html) return ''
  let s = String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
  s = s.replace(/<br\s*\/?>(\s*)/gi, '\n')
  s = s.replace(/<a [^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (m, href, inner) => {
    const innerText = inner.replace(/<[^>]+>/g, '').trim()
    return innerText || href
  })
  s = s.replace(/<[^>]+>/g, ' ')
  s = s.replace(/\r\n|\r/g, '\n')
  s = s.replace(/\u00A0/g, ' ')
  s = s.replace(/[\t ]+/g, ' ')
  s = s.replace(/ *\n */g, '\n')
  s = s.replace(/\n{3,}/g, '\n\n')
  return s.trim()
}

function splitParagraphsFromHtml(html) {
  if (!html) return []
  const ps = []
  const pRegex = /<p[\s\S]*?>[\s\S]*?<\/p>/gi
  let lastIndex = 0
  let m
  while ((m = pRegex.exec(html)) !== null) {
    const pHtml = m[0]
    const text = stripHtmlPreserveText(pHtml)
    if (text) ps.push(text)
    lastIndex = pRegex.lastIndex
  }
  const tail = html.slice(lastIndex)
  const tailText = stripHtmlPreserveText(tail)
  if (tailText) {
    for (const block of tailText.split(/\n{2,}/)) {
      const t = block.trim()
      if (t) ps.push(t)
    }
  }
  const out = []
  for (const t of ps) {
    if (!out.length || out[out.length - 1] !== t) out.push(t)
  }
  return out
}

function parseTitle(raw) {
  if (!raw) return { name: '', subtitle: '' }
  let s = String(raw)
  s = s.replace(/<br\s*\/?>(\s*)/gi, '\n')
  const stripped = stripHtmlPreserveText(s)
  const parts = stripped.split(/\n+/)
  const name = (parts[0] || '').trim()
  const subtitle = (parts[1] || '').trim()
  return { name, subtitle }
}

function extractImages(post) {
  const urls = new Set()
  if (post.images && post.images.featured_image && post.images.featured_image.url) {
    urls.add(post.images.featured_image.url)
  }
  const content = post.content || ''
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi
  let m
  while ((m = imgRegex.exec(content)) !== null) urls.add(m[1])
  const aImgRegex = /<a[^>]+href=["']([^"']+\.(?:png|jpe?g|webp|gif))(?:\?[^"']*)?["']/gi
  while ((m = aImgRegex.exec(content)) !== null) urls.add(m[1])
  return Array.from(urls)
}

function normalizeCategoryName(cat) {
  if (!cat) return ''
  return String(cat).trim().toUpperCase()
}

function buildItems(wp) {
  const posts = wp.posts || []
  const byId = new Map(posts.map(p => [p.id, p]))
  const seen = new Set()
  const items = []

  for (const p of posts) {
    if (!p || !p.polylang) continue
    const lang = p.polylang.language || 'es'
    if (lang !== 'es') continue
    if (seen.has(p.id)) continue

    const tr = p.polylang.translations || {}
    const enId = tr.eng && tr.eng.id
    const enPost = enId ? byId.get(enId) : null

    const esTitle = parseTitle(p.title)
    const enTitle = enPost ? parseTitle(enPost.title) : { name: '', subtitle: '' }

    const esDesc = splitParagraphsFromHtml(p.content)
    const enDesc = enPost ? splitParagraphsFromHtml(enPost.content) : []

    const images = extractImages(p)
    if (enPost) for (const u of extractImages(enPost)) images.includes(u) || images.push(u)

    const categories = ['ALL']
    if (p.taxonomies && Array.isArray(p.taxonomies.category)) {
      for (const c of p.taxonomies.category) {
        const name = c && (c.name || c.slug)
        const norm = normalizeCategoryName(name)
        if (norm && !categories.includes(norm)) categories.push(norm)
      }
    }

    const item = {
      slug: p.slug || String(p.id),
      en: {
        name: enTitle.name,
        subtitle: enTitle.subtitle,
        description: enDesc,
        category: categories[1] || 'ALL'
      },
      es: {
        name: esTitle.name,
        subtitle: esTitle.subtitle,
        description: esDesc,
        category: categories[1] || 'ALL'
      },
      images,
      website: '',
      instagram: '',
      categories,
      website_display: '',
      instagram_display: '',
      email: '',
      phone: '',
      photosCredit: '',
      address: ''
    }

    items.push(item)
    seen.add(p.id)
    if (enId) seen.add(enId)
  }

  return items
}

function main() {
  const inFile = findWpExportFile()
  const raw = fs.readFileSync(inFile, 'utf8')
  const data = JSON.parse(raw)
  const items = buildItems(data)
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf8')
  console.log(`Importados ${items.length} items (todas las categorías) desde ${path.basename(inFile)} a ${path.basename(outFile)}.`)
}

main()
