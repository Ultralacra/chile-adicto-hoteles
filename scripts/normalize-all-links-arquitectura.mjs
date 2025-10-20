import fs from 'fs'
import path from 'path'

const file = path.resolve('./lib/arquitectura.json')
const raw = fs.readFileSync(file, 'utf8')
const arr = JSON.parse(raw)

function normalizeUrl(u) {
  if (!u) return ''
  u = String(u).trim()
  u = u.replace(/^['"\s]+|['"\s]+$/g, '')
  // if anchor markup, extract href
  const hrefMatch = u.match(/href=["']([^"']+)["']/i)
  if (hrefMatch) u = hrefMatch[1]
  // add protocol if starts with www or domain
  if (/^www\./i.test(u) || /^[a-z0-9\-]+\.[a-z]{2,}/i.test(u)) {
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u
  }
  if (!/^https?:\/\//i.test(u) && /instagram\.com/i.test(u)) u = 'https://' + u
  u = u.replace(/[.,;:]+$/g, '')
  return u
}

function normalizePhone(s) {
  if (!s) return ''
  const cleaned = s.replace(/[^+0-9]/g, '')
  if (!cleaned) return ''
  if (!cleaned.startsWith('+')) {
    // assume local Chile, try to prefix +56 if starts with 9 or 2
    if (/^9\d{7,}$/.test(cleaned)) return 'tel:+56' + cleaned
    return 'tel:' + cleaned
  }
  return 'tel:' + cleaned.replace(/^\+/, '+')
}

function extractFromText(text) {
  const res = { website: null, instagram: null, email: null, phone: null, photosCredit: null }
  if (!text) return res
  const t = String(text)
  // emails
  const emailMatch = t.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  if (emailMatch) res.email = emailMatch[0]
  // urls
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/ig
  let m
  while ((m = urlRegex.exec(t)) !== null) {
    const u = normalizeUrl(m[1])
    if (/instagram\.com/i.test(u)) res.instagram = u
    else if (!res.website) res.website = u
  }
  // href without protocol (e.g., <a href="/something">) skip
  // domain-like tokens
  if (!res.website) {
    const domainMatch = t.match(/\b([a-z0-9\-]+\.(?:com|cl|org|net|io|es|com\.ar|com\.mx|gov|edu))(?:\b|\/|\.)/i)
    if (domainMatch) res.website = normalizeUrl(domainMatch[1])
  }
  // instagram handles
  const igHandle = t.match(/@([A-Za-z0-9_.]{2,30})/)
  if (igHandle) {
    // prefer full instagram url if present
    if (!res.instagram) res.instagram = `https://www.instagram.com/${igHandle[1]}`
  }
  // phone
  if (!res.phone) {
    const phoneMatch = t.match(/(tel:)?\+?[0-9][0-9 \-().]{6,}\d/)
    if (phoneMatch) res.phone = normalizePhone(phoneMatch[0])
  }
  // photos credit: look for PHOTO/FOTOGRAF keywords
  const photoMatch = t.match(/(?:PHOTOS|PHOTO|PHOTOGRAPH|FOTOS|FOTOGRAF[IÍ]AS?|FOTOGRAFIA):?\s*(.*)/i)
  if (photoMatch) {
    let credit = photoMatch[1].trim()
    // extract handle inside credit
    const h = credit.match(/@([A-Za-z0-9_.-]+)/)
    if (h) credit = '@' + h[1]
    // or extract domain
    const d = credit.match(/([A-Za-z0-9\-]+\.[a-z]{2,})/i)
    if (d) credit = d[1]
    res.photosCredit = credit
  }
  return res
}

for (const item of arr) {
  // initialize
  item.website = item.website || ''
  item.website_display = item.website_display || ''
  item.instagram = item.instagram || ''
  item.instagram_display = item.instagram_display || ''
  item.email = item.email || ''
  item.phone = item.phone || ''
  item.photosCredit = item.photosCredit || ''

  // gather candidates from existing root fields first
  const candidates = []
  if (item.website) candidates.push(String(item.website))
  if (item.instagram) candidates.push(String(item.instagram))
  // scan both languages' descriptions
  for (const lang of ['es','en']) {
    if (!item[lang] || !Array.isArray(item[lang].description)) continue
    for (const line of item[lang].description) {
      if (!line) continue
      candidates.push(String(line))
    }
  }

  // also check images or other fields if present
  if (item.images && Array.isArray(item.images)) {
    // no-op for now
  }

  // aggregate extracted
  let found = { website: null, instagram: null, email: null, phone: null, photosCredit: null }
  for (const c of candidates) {
    const ex = extractFromText(c)
    if (!found.website && ex.website) found.website = ex.website
    if (!found.instagram && ex.instagram) found.instagram = ex.instagram
    if (!found.email && ex.email) found.email = ex.email
    if (!found.phone && ex.phone) found.phone = ex.phone
    if (!found.photosCredit && ex.photosCredit) found.photosCredit = ex.photosCredit
    // if all found, break
    if (found.website && found.instagram && found.email && found.phone && found.photosCredit) break
  }

  // assign
  if (found.website) item.website = found.website
  if (item.website && !item.website_display) {
    try {
      const u = new URL(item.website)
      item.website_display = u.host.replace(/^www\./,'')
    } catch (e) {
      item.website_display = item.website
    }
  }

  if (found.instagram) item.instagram = found.instagram
  if (item.instagram && !item.instagram_display) {
    // extract handle
    try {
      if (/^https?:\/\//i.test(item.instagram)) {
        const u = new URL(item.instagram)
        const p = u.pathname.replace(/^\//,'').replace(/\/$/,'')
        item.instagram_display = p ? `@${p}` : u.host
      } else if (item.instagram.startsWith('@')) item.instagram_display = item.instagram
      else item.instagram_display = `@${item.instagram.replace(/^https?:\/\//i,'').split('/').pop()}`
    } catch (e) {
      item.instagram_display = item.instagram
    }
  }

  if (found.email) item.email = found.email
  if (found.phone) item.phone = found.phone
  if (found.photosCredit) item.photosCredit = found.photosCredit

}

fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8')
console.log('Normalized ALL links for', arr.length, 'items')
