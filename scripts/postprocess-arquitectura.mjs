import fs from 'fs'
import path from 'path'

const file = path.resolve('./lib/arquitectura.json')
const raw = fs.readFileSync(file, 'utf8')
const arr = JSON.parse(raw)

for (const item of arr) {
  for (const lang of ['en','es']) {
    if (!item[lang] || !Array.isArray(item[lang].description)) continue
    const parts = []
    for (const line of item[lang].description) {
      if (!line) continue
      const split = String(line).split(/\n+/).map(s => s.trim()).filter(Boolean)
      for (const s of split) parts.push(s)
    }
    item[lang].description = parts
  }
}

fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8')
console.log('Postprocessed', arr.length, 'items')
