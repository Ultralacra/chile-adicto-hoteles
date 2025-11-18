#!/usr/bin/env node
/**
 * Backfill de infoHtml en post_translations usando el API local
 * - Recorre todos los posts
 * - Si falta es.infoHtml o en.infoHtml, lo genera desde los campos de contacto
 * - Envía PUT /api/posts/[slug] con nombre/subtítulo/descripción intactos + infoHtml
 *
 * Ejecutar:
 *   BASE_URL=http://localhost:3000 node scripts/backfill-info-html.mjs
 * o sin BASE_URL (usa http://localhost:3000 por defecto)
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const FILTER_SLUG = process.env.SLUG || process.env.FILTER_SLUG || ""; // opcional: solo procesar este slug
const DRY_RUN = String(process.env.DRY_RUN || "").toLowerCase() === "true"; // opcional: no guarda, solo muestra

function up(s) {
  return (s || "").toString().trim().toUpperCase();
}
function stripMailto(s) {
  return (s || "").toString().replace(/^mailto:/i, "");
}
function stripTel(s) {
  return (s || "").toString().replace(/^tel:/i, "");
}

function buildInfoHtmlES(post) {
  if (post?.es?.infoHtml && String(post.es.infoHtml).trim() !== "") return post.es.infoHtml;
  const fixUrl = (u) => {
    if (!u) return "";
    const v = String(u).trim();
    if (!v) return "";
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  };
  const igHref = (v) => {
    const s = String(v || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    const handle = s.replace(/^@+/, "");
    return `https://instagram.com/${handle}`;
  };
  const telHref = (v) => {
    const s = String(v || "").trim().replace(/^tel:/i, "");
    if (!s) return "";
    return `tel:${s.replace(/[^+\d]/g, "")}`;
  };
  const mailHref = (v) => {
    const s = String(v || "").trim().replace(/^mailto:/i, "");
    if (!s) return "";
    return `mailto:${s}`;
  };
  const parts = [];
  const addr = (post.address || "").trim();
  if (addr) parts.push(`<p><strong>DIRECCIÓN:</strong> ${up(addr)}</p>`);
  const web = (post.website || "").trim();
  if (web) {
    const display = up(post.website_display || web);
    const href = fixUrl(web);
    parts.push(`<p><strong>WEB:</strong> <a href="${href}" target="_blank" rel="noopener noreferrer">${display}</a></p>`);
  }
  const ig = (post.instagram || "").trim();
  if (ig) {
    const display = up(post.instagram_display || ig);
    const href = igHref(ig);
    parts.push(`<p><strong>INSTAGRAM:</strong> <a href="${href}" target="_blank" rel="noopener noreferrer">${display}</a></p>`);
  }
  const hours = (post.hours || "").trim();
  if (hours) parts.push(`<p><strong>HORARIO:</strong> ${hours}</p>`);
  const resPolicy = (post.reservationPolicy || "").trim();
  const resLink = (post.reservationLink || "").trim();
  if (resPolicy || resLink) {
    if (resLink) {
      const href = fixUrl(resLink);
      const text = resPolicy || resLink;
      parts.push(`<p><strong>RESERVAS:</strong> <a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a></p>`);
    } else {
      parts.push(`<p><strong>RESERVAS:</strong> ${resPolicy}</p>`);
    }
  }
  const fact = (post.interestingFact || "").trim();
  if (fact) parts.push(`<p><strong>DATO DE INTERÉS:</strong> ${fact}</p>`);
  const tel = stripTel(post.phone || "");
  if (tel) {
    const href = telHref(tel);
    parts.push(`<p><strong>TEL:</strong> <a href="${href}">${up(tel)}</a></p>`);
  }
  const mail = stripMailto(post.email || "");
  if (mail) {
    const href = mailHref(mail);
    parts.push(`<p><strong>EMAIL:</strong> <a href="${href}">${up(mail)}</a></p>`);
  }
  const credit = (post.photosCredit || "").trim();
  if (credit) parts.push(`<p><strong>FOTOGRAFÍAS:</strong> ${up(credit)}</p>`);
  return parts.join("");
}

function buildInfoHtmlEN(post) {
  if (post?.en?.infoHtml && String(post.en.infoHtml).trim() !== "") return post.en.infoHtml;
  const fixUrl = (u) => {
    if (!u) return "";
    const v = String(u).trim();
    if (!v) return "";
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  };
  const igHref = (v) => {
    const s = String(v || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    const handle = s.replace(/^@+/, "");
    return `https://instagram.com/${handle}`;
  };
  const telHref = (v) => {
    const s = String(v || "").trim().replace(/^tel:/i, "");
    if (!s) return "";
    return `tel:${s.replace(/[^+\d]/g, "")}`;
  };
  const mailHref = (v) => {
    const s = String(v || "").trim().replace(/^mailto:/i, "");
    if (!s) return "";
    return `mailto:${s}`;
  };
  const parts = [];
  const addr = (post.address || "").trim();
  if (addr) parts.push(`<p><strong>ADDRESS:</strong> ${up(addr)}</p>`);
  const web = (post.website || "").trim();
  if (web) {
    const display = up(post.website_display || web);
    const href = fixUrl(web);
    parts.push(`<p><strong>WEB:</strong> <a href="${href}" target="_blank" rel="noopener noreferrer">${display}</a></p>`);
  }
  const ig = (post.instagram || "").trim();
  if (ig) {
    const display = up(post.instagram_display || ig);
    const href = igHref(ig);
    parts.push(`<p><strong>INSTAGRAM:</strong> <a href="${href}" target="_blank" rel="noopener noreferrer">${display}</a></p>`);
  }
  const hours = (post.hours || "").trim();
  if (hours) parts.push(`<p><strong>HOURS:</strong> ${hours}</p>`);
  const resPolicy = (post.reservationPolicy || "").trim();
  const resLink = (post.reservationLink || "").trim();
  if (resPolicy || resLink) {
    if (resLink) {
      const href = fixUrl(resLink);
      const text = resPolicy || resLink;
      parts.push(`<p><strong>RESERVATIONS:</strong> <a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a></p>`);
    } else {
      parts.push(`<p><strong>RESERVATIONS:</strong> ${resPolicy}</p>`);
    }
  }
  const fact = (post.interestingFact || "").trim();
  if (fact) parts.push(`<p><strong>INTERESTING FACT:</strong> ${fact}</p>`);
  const tel = stripTel(post.phone || "");
  if (tel) {
    const href = telHref(tel);
    parts.push(`<p><strong>TEL:</strong> <a href="${href}">${up(tel)}</a></p>`);
  }
  const mail = stripMailto(post.email || "");
  if (mail) {
    const href = mailHref(mail);
    parts.push(`<p><strong>EMAIL:</strong> <a href="${href}">${up(mail)}</a></p>`);
  }
  const credit = (post.photosCredit || "").trim();
  if (credit) parts.push(`<p><strong>PHOTOGRAPHS:</strong> ${up(credit)}</p>`);
  return parts.join("");
}

async function main() {
  const listRes = await fetch(`${BASE_URL}/api/posts`, { cache: "no-store" });
  if (!listRes.ok) throw new Error(`GET /api/posts ${listRes.status}`);
  let posts = await listRes.json();
  if (FILTER_SLUG) {
    posts = posts.filter((p) => String(p.slug) === String(FILTER_SLUG));
    if (posts.length === 0) {
      console.log(`No se encontró el slug filtrado: ${FILTER_SLUG}`);
      return;
    }
  }
  let updated = 0;

  for (const p of posts) {
    const slug = p.slug;
    const detailRes = await fetch(`${BASE_URL}/api/posts/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!detailRes.ok) {
      console.warn(`Skip ${slug}: GET detail ${detailRes.status}`);
      continue;
    }
    const post = await detailRes.json();
    const htmlEs = buildInfoHtmlES(post);
    const htmlEn = buildInfoHtmlEN(post);

    const needEs = !post?.es?.infoHtml && htmlEs;
    const needEn = !post?.en?.infoHtml && htmlEn;
    if (!needEs && !needEn) {
      console.log(`OK ${slug}: ya tiene infoHtml`);
      continue;
    }

    const payload = {
      es: {
        name: post.es?.name || "",
        subtitle: post.es?.subtitle || "",
        description: Array.isArray(post.es?.description) ? post.es.description : [],
        category: post.es?.category || null,
        infoHtml: htmlEs || post.es?.infoHtml || undefined,
      },
      en: {
        name: post.en?.name || "",
        subtitle: post.en?.subtitle || "",
        description: Array.isArray(post.en?.description) ? post.en.description : [],
        category: post.en?.category || null,
        infoHtml: htmlEn || post.en?.infoHtml || undefined,
      },
    };

    if (DRY_RUN) {
      console.log(`[DRY-RUN] PUT /api/posts/${slug}`);
      console.log(JSON.stringify(payload, null, 2));
    } else {
      const putRes = await fetch(`${BASE_URL}/api/posts/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!putRes.ok) {
        const txt = await putRes.text();
        console.error(`FAIL ${slug}: ${putRes.status} ${txt}`);
        continue;
      }
      console.log(`UPDATED ${slug}`);
      updated++;
    }
  }

  console.log(`\nBackfill listo. Posts actualizados: ${updated}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
