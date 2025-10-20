import fs from 'fs'
import path from 'path'

const file = path.resolve('./lib/arquitectura.json')
const raw = fs.readFileSync(file, 'utf8')
const arr = JSON.parse(raw)

function findAndRemove(arrLines, predicate) {
  let found = null
  const newLines = []
  for (const line of arrLines) {
    const trimmed = (line || '').trim()
    if (!found && predicate(trimmed)) {
      found = trimmed
      continue
    }
    newLines.push(line)
  }
  return { found, newLines }
}

function looksLikeWebsite(s) {
  if (!s) return false
  const t = s.toLowerCase()
  // common patterns: has dot and no spaces, or starts with http
  if (/https?:\/\//i.test(s)) return true
  if (/^[^\s]+\.[a-z]{2,}$/i.test(t)) return true
  if (/^[^\s]+\.(cl|com|org|net|io|es|com\.ar|com\.mx)$/i.test(t)) return true
  return false
}

function looksLikeInstagram(s) {
  if (!s) return false
  return /^@?[a-z0-9_.]+$/i.test(s) || /instagram\.com/i.test(s)
}

for (const item of arr) {
  // prefer Spanish block for contact info, fallback to English
  const langOrder = ['es','en']
  let website = item.website || ''
  let instagram = item.instagram || ''

  for (const lang of langOrder) {
    const desc = (item[lang] && item[lang].description) || []

    // try to find website in desc (search from end)
    // we will look through lines from the end and extract first matching website and instagram
    for (let i = desc.length - 1; i >= 0; i--) {
      const line = (desc[i] || '').trim()
      if (!line) continue
      // strip labels like 'FOTOGRAFÍAS:' or 'PHOTOS:'
      const cleaned = line.replace(/^(FOTOGRAFÍAS:\s*|PHOTOS:\s*|PHOTOGRAPHS BY\s*|PHOTOGRAPHS:\s*)/i, '').trim()
      if (!website && looksLikeWebsite(cleaned)) {
        website = cleaned
        desc.splice(i,1)
        continue
      }
      if (!instagram && looksLikeInstagram(cleaned)) {
        instagram = cleaned
        desc.splice(i,1)
        continue
      }
    }

    // update the lang description after removals
    if (item[lang]) item[lang].description = desc

    if (website && instagram) break
  }

  // normalize website to url
  if (website && !/^https?:\/\//i.test(website)) {
    const w = website.replace(/^www\./i, '')
    item.website = 'https://' + w.toLowerCase()
  } else if (website) {
    item.website = website
  }

  if (instagram) {
    const ig = instagram.replace(/^@/, '').trim()
    if (/instagram\.com/i.test(ig)) {
      item.instagram = ig.includes('http') ? ig : `https://${ig}`
    } else {
      item.instagram = `@${ig}`
    }
  }
}

fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8')
console.log('Processed', arr.length, 'items')
