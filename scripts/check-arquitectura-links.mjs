import fs from 'fs'
import path from 'path'

const file = path.resolve('./lib/arquitectura.json')
const raw = fs.readFileSync(file,'utf8')
const arr = JSON.parse(raw)

let summary = { total: arr.length, withWebsite:0, withInstagram:0, withEmail:0, withPhone:0, withPhotos:0 }

function hasLinkInDescriptions(item){
  const langs = ['es','en']
  const found = { urls:0, instagram:0, phone:0, email:0 }
  for(const l of langs){
    if(!item[l] || !Array.isArray(item[l].description)) continue
    for(const line of item[l].description){
      if(!line) continue
      if(/https?:\/\//i.test(line) || /www\./i.test(line)) found.urls++
      if(/@([A-Za-z0-9_.]{2,30})/.test(line)) found.instagram++
      if(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(line)) found.email++
      if(/\+?\d[\d\s().-]{6,}\d/.test(line)) found.phone++
    }
  }
  return found
}

console.log('Checking', arr.length, 'items in lib/arquitectura.json')
for(const it of arr){
  const hasWebsite = Boolean(it.website && it.website.toString().trim())
  const hasInstagram = Boolean(it.instagram && it.instagram.toString().trim())
  const hasEmail = Boolean(it.email && it.email.toString().trim())
  const hasPhone = Boolean(it.phone && it.phone.toString().trim())
  const hasPhotos = Boolean(it.photosCredit && it.photosCredit.toString().trim())

  if(hasWebsite) summary.withWebsite++
  if(hasInstagram) summary.withInstagram++
  if(hasEmail) summary.withEmail++
  if(hasPhone) summary.withPhone++
  if(hasPhotos) summary.withPhotos++

  const found = hasLinkInDescriptions(it)

  console.log('---')
  console.log('slug:', it.slug)
  console.log('  website:', hasWebsite ? it.website : '---')
  console.log('  instagram:', hasInstagram ? it.instagram : '---')
  console.log('  email:', hasEmail ? it.email : '---')
  console.log('  phone:', hasPhone ? it.phone : '---')
  console.log('  photosCredit:', hasPhotos ? it.photosCredit : '---')
  console.log('  desc contains - urls:', found.urls, 'inst:', found.instagram, 'email:', found.email, 'phone:', found.phone)
}

console.log('===SUMMARY===')
console.log(summary)
