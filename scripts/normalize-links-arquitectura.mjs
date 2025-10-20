import fs from 'fs'
import path from 'path'

const file = path.resolve('./lib/arquitectura.json')
const raw = fs.readFileSync(file, 'utf8')
const arr = JSON.parse(raw)

function normalizeUrl(u) {
  if (!u) return ''
  u = u.trim()
  // remove surrounding punctuation
  u = u.replace(/^['"\s]+|['"\s]+$/g, '')
  // if starts with www or domain, add https
  if (/^www\./i.test(u) || /^[a-z0-9\-]+\.[a-z]{2,}/i.test(u)) {
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u
  }
  // ensure protocol
  if (!/^https?:\/\//i.test(u) && /instagram\.com/i.test(u)) {
    u = 'https://' + u
  }
  // strip trailing punctuation
  u = u.replace(/[.,;:]+$/g, '')
  return u
}

function normalizePhone(s) {
  if (!s) return ''
  const digits = s.replace(/[^+0-9]/g, '')
  if (!digits) return ''
  if (!digits.startsWith('+')) {
    // assume local, prefix +56 if starts with 9 or 2? We'll keep as tel:digits
    return 'tel:' + digits
  }
  return 'tel:' + digits
}

function isPhoneLine(s) {
  if (!s) return false
  const cleaned = s.replace(/\s+/g, '')
  return /\+?\d[\d\s().-]{5,}\d/.test(s) && /[0-9]/.test(s)
}

function extractFromLine(line) {
  const res = { website: null, instagram: null, email: null, phone: null }
  if (!line) return res
  const text = line.trim()

  // emails
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  if (emailMatch) {
    res.email = emailMatch[0]
  }

  // URLs
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/ig
  let m
  while ((m = urlRegex.exec(text)) !== null) {
    const u = m[1]
    if (/instagram\.com/i.test(u)) res.instagram = normalizeUrl(u)
    else if (/mailto:/i.test(u)) res.email = u.replace(/^mailto:/i, '')
    else if (/^tel:/i.test(u)) res.phone = u
    else if (!res.website) res.website = normalizeUrl(u)
  }

  // domain-like tokens (e.g., EXAMPLE.COM or example.cl)
  const domainRegex = /\b([a-z0-9\-]+\.(?:com|cl|org|net|io|es|com\.ar|com\.mx|cl|gov|edu))(?:\b|\/|\.)/i
  const dmatch = text.match(domainRegex)
  if (dmatch && !res.website) res.website = normalizeUrl(dmatch[1])

  // instagram handles like @handle
  const igHandle = text.match(/@([A-Za-z0-9_.]{2,30})/)
  if (igHandle) {
    res.instagram = `https://www.instagram.com/${igHandle[1]}`
  }

  // phone-like lines without explicit tel
  if (isPhoneLine(text) && !res.phone) {
    res.phone = normalizePhone(text)
  }

  return res
}

for (const item of arr) {
  // process both languages' description arrays
  const langs = ['es','en']
  let found = { website: null, instagram: null, email: null, phone: null }

  for (const lang of langs) {
    if (!item[lang] || !Array.isArray(item[lang].description)) continue
    const desc = item[lang].description
    for (let i = desc.length - 1; i >= 0; i--) {
      const line = (desc[i] || '').trim()
      if (!line) continue
      const extracted = extractFromLine(line)
      let removed = false
      if (extracted.website && !found.website) { found.website = extracted.website; removed = true }
      if (extracted.instagram && !found.instagram) { found.instagram = extracted.instagram; removed = true }
      if (extracted.email && !found.email) { found.email = extracted.email; removed = true }
      if (extracted.phone && !found.phone) { found.phone = extracted.phone; removed = true }
      if (removed) {
        desc.splice(i,1)
      }
    }
    // assign cleaned back
    item[lang].description = desc
  }

  // if still missing website/instagram look in root fields or images block (some entries)
  if (!item.website && found.website) item.website = found.website
  if (!item.instagram && found.instagram) item.instagram = found.instagram
  if (!item.email && found.email) item.email = found.email
  if (!item.phone && found.phone) item.phone = found.phone

  // ensure website uses https
  if (item.website && !/^https?:\/\//i.test(item.website)) item.website = 'https://' + item.website.replace(/^www\./i,'')

  // normalize instagram: if @handle convert to full url, if domain-like but not instagram, keep
  if (item.instagram && !/^https?:\/\//i.test(item.instagram)) {
    const handle = item.instagram.replace(/^@/,'').trim()
    item.instagram = `https://www.instagram.com/${handle}`
  }
}

fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8')
console.log('Normalized links for', arr.length, 'items')
