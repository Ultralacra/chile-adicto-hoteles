import fs from 'fs'
import path from 'path'

const file = path.resolve('./lib/data.json')

function stripHtml(html) {
  if (!html) return ''
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function normalizeUrl(u) {
  if (!u) return ''
  let s = String(u).trim()
  const href = s.match(/href=["']([^"']+)["']/i)
  if (href) s = href[1]
  s = s.replace(/^["'\s]+|["'\s]+$/g, '')
  if (/^www\./i.test(s) || /^[a-z0-9\-]+\.[a-z]{2,}/i.test(s)) {
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s
  }
  if (!/^https?:\/\//i.test(s) && /instagram\.com/i.test(s)) s = 'https://' + s
  s = s.replace(/[.,;:]+$/g, '')
  return s
}

function websiteDisplay(url) {
  if (!url) return ''
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url)
    return u.host.replace(/^www\./, '').toLowerCase()
  } catch (e) {
    return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').toLowerCase()
  }
}

function normalizePhone(s) {
  if (!s) return ''
  const cleaned = String(s).replace(/[^+0-9]/g, '')
  if (!cleaned) return ''
  if (!cleaned.startsWith('+')) {
    if (/^9\d{7,}$/.test(cleaned)) return 'tel:+56' + cleaned
    return 'tel:' + cleaned
  }
  return 'tel:' + cleaned
}

function isAddressLine(text) {
  if (!text) return false
  const t = text.trim()
  const low = t.toLowerCase()
  const looksAllCaps = t === t.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(t)
  const hasStreetWord = /(\bavenida\b|\bav\.\b|\bavda\.|\bcalle\b|\bplaza\b|\bpaseo\b|\bsector\b|\bpasaje\b|\bcamino\b|\bcarretera\b)/i.test(low)
  const hasCityWord = /(\blas condes\b|\bprovidencia\b|\bsantiago\b|\bvitacura\b|\bnuble\b|\bñuñoa\b|\bmaipú\b)/i.test(low)
  const hasNumber = /\b\d{1,5}\b/.test(t)
  const lengthOk = t.length >= 10 && t.length <= 200
  if (!lengthOk) return false
  if (hasStreetWord) return true
  if (looksAllCaps && (hasCityWord || hasNumber)) return true
  return false
}

function extractContacts(line) {
  const res = { website: null, instagram: null, email: null, phone: null, photosCredit: null, address: null }
  if (!line) return res
  const raw = String(line)
  const text = stripHtml(raw)

  const hrefs = raw.match(/href=["']([^"']+)["']/ig) || []
  for (const h of hrefs) {
    const m = h.match(/href=["']([^"']+)["']/i)
    if (m) {
      const u = normalizeUrl(m[1])
      if (/instagram\.com/i.test(u)) res.instagram = res.instagram || u
      else if (/^mailto:/i.test(u)) res.email = res.email || u.replace(/^mailto:/i, '')
      else if (/^tel:/i.test(u)) res.phone = res.phone || u
      else res.website = res.website || u
    }
  }

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  if (emailMatch) res.email = res.email || emailMatch[0]

  const urlRegex = /(https?:\/\/[^\s"'<>]+)/ig
  let m
  while ((m = urlRegex.exec(text)) !== null) {
    const u = normalizeUrl(m[1])
    if (/instagram\.com/i.test(u)) res.instagram = res.instagram || u
    else if (!res.website) res.website = u
  }

  if (!res.website) {
    const d = text.match(/\b([a-z0-9\-]+\.(?:com|cl|org|net|io|es|com\.ar|com\.mx|gov|edu))(?:\b|\/|\.)/i)
    if (d) res.website = normalizeUrl(d[1])
  }

  const handle = text.match(/@([A-Za-z0-9_.]{2,30})/)
  if (handle && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(text)) {
    res.instagram = res.instagram || `https://www.instagram.com/${handle[1]}`
  }

  if (!res.phone) {
    const p = text.match(/(tel:)?\+?[0-9][0-9 \-().]{6,}\d/)
    if (p) res.phone = normalizePhone(p[0])
  }

  const pm = text.match(/(?:PHOTOS?|PHOTOGRAPHS(?: BY)?|FOTOS|FOTOGRAF[IÍ]AS?|FOTOGRAFIA)[:\s\-]*([^\n]+)/i)
  if (pm) {
    let credit = pm[1].trim()
    credit = credit.replace(/^(BY|POR)\s+/i, '').trim()
    const h = credit.match(/@([A-Za-z0-9_.-]+)/)
    if (h) credit = '@' + h[1]
    res.photosCredit = credit
  }

  if (!pm && isAddressLine(text)) {
    let addr = text
    const cut = addr.split(/\b(PHOTOS?|PHOTOGRAPHS|FOTOS|FOTOGRAF[IÍ]AS?)\b/i)[0]
    addr = cut.trim().replace(/[.,;:\s]+$/,'')
    res.address = addr
  }

  return res
}

function run() {
  const raw = fs.readFileSync(file, 'utf8')
  const arr = JSON.parse(raw)

  for (const item of arr) {
    let website = item.website || ''
    let instagram = item.instagram || ''
    let email = item.email || ''
    let phone = item.phone || ''
    let photosCredit = item.photosCredit || ''
    let address = item.address || ''

    for (const lang of ['es','en']) {
      const d = (item[lang] && item[lang].description) || []
      const newDesc = []
      for (const line of d) {
        const ex = extractContacts(line)
        if (ex.website && !website) website = ex.website
        if (ex.instagram && !instagram) instagram = ex.instagram
        if (ex.email && !email) email = ex.email
        if (ex.phone && !phone) phone = ex.phone
        if (ex.photosCredit && !photosCredit) photosCredit = ex.photosCredit
        if (ex.address && !address) address = ex.address
        newDesc.push(line)
      }
      if (item[lang]) item[lang].description = newDesc
    }

    if (website) {
      website = normalizeUrl(website)
      if (/instagram\.com/i.test(website) && instagram) website = ''
    }
    item.website = website
    item.website_display = website ? websiteDisplay(website) : ''

    if (instagram) {
      instagram = normalizeUrl(instagram)
      if (!/^https?:\/\//i.test(instagram) && instagram.startsWith('@')) {
        const handle = instagram.replace(/^@/, '')
        instagram = `https://www.instagram.com/${handle}`
      }
      try {
        const iu = new URL(instagram)
        const p = iu.pathname.replace(/\/$/, '').replace(/^\//, '')
        if (iu.hostname.replace(/^www\./,'').toLowerCase() === 'instagram.com' && !p) instagram = ''
      } catch {}
    }
    item.instagram = instagram
    if (instagram) {
      try {
        const u = new URL(instagram)
        const p = u.pathname.replace(/\/$/, '').replace(/^\//,'').toLowerCase()
        item.instagram_display = p ? `@${p}` : ''
      } catch (e) {
        const h = instagram.startsWith('@') ? instagram.slice(1) : instagram.replace(/^https?:\/\//i,'').split('/').pop()
        item.instagram_display = h ? `@${h.toLowerCase()}` : ''
      }
    } else item.instagram_display = ''

    if (email) item.email = email
    if (phone) item.phone = phone
    if (photosCredit) item.photosCredit = photosCredit
    if (address) {
      item.address = isAddressLine(address) ? address : ''
    } else if (item.address) {
      item.address = isAddressLine(item.address) ? item.address : ''
    } else item.address = ''

    item.categories = item.categories && item.categories.length ? item.categories : ['ALL']
  }

  fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8')
  console.log('Normalización de contactos completa para', arr.length, 'items en data.json. Contenido preservado y displays recalculados.')
}

run()
