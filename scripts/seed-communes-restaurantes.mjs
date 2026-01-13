import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

async function loadEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // ignore
  }
}

function envOrNull(name) {
  const v = process.env[name];
  return v && v.length > 0 ? v : null;
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "-" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function slugify(input) {
  return String(input || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeComuna(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

function isUuid(v) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(v || "").trim()
  );
}

function quoteForIn(values) {
  return values.map((v) => `"${String(v).replace(/\"/g, "")}"`).join(",");
}

function parseArgs(argv) {
  const out = {
    seedLinks: true,
    resetLinks: false,
    outFile: null,
    help: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--noLinks" || a === "--no-links") out.seedLinks = false;
    else if (a === "--seedLinks" || a === "--seed-links") out.seedLinks = true;
    else if (a === "--resetLinks" || a === "--reset-links") out.resetLinks = true;
    else if (a === "--out" || a === "--outFile") out.outFile = argv[++i] || null;
  }
  return out;
}

function printHelp() {
  console.log(`\nSeed Comunas (Restaurantes)\n\nUso:\n  node scripts/seed-communes-restaurantes.mjs [--noLinks] [--resetLinks] [--out backups/communes-report.json]\n\nQué hace:\n  1) Crea/actualiza las comunas usadas en restaurantes.\n  2) (Por defecto) calcula y crea el mapeo post->comuna en post_communes\n     usando la misma lógica actual (texto + overrides + whitelist Santiago).\n  3) Genera un reporte JSON con posts asociados por comuna.\n\nRequiere (idealmente en .env.local):\n  NEXT_PUBLIC_SUPABASE_URL\n  SUPABASE_SERVICE_ROLE_KEY\n\nNotas:\n  - Si las tablas communes/post_communes no existen, primero aplica scripts/sql/create-communes.sql\n`);
}

async function supabaseFetchJson(base, serviceKey, restPath, init) {
  const url = `${base}/rest/v1${restPath}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Supabase REST error ${res.status} en ${restPath}: ${text}`);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  const json = await res.json();
  return json;
}

async function ensureTablesExist(base, serviceKey) {
  try {
    await supabaseFetchJson(base, serviceKey, "/communes?select=slug&limit=1");
    await supabaseFetchJson(base, serviceKey, "/post_communes?select=post_id&limit=1");
  } catch (e) {
    const msg = String(e?.message || e);
    const isMissingTable =
      /PGRST205/i.test(msg) ||
      /Could not find the table/i.test(msg) ||
      /REST error 404/i.test(msg);
    if (isMissingTable) {
      console.error(
        "No existe la(s) tabla(s) communes/post_communes en Supabase.\n" +
          "Aplica primero: scripts/sql/create-communes.sql"
      );
      process.exit(1);
    }
    throw e;
  }
}

async function upsertCommunes(base, serviceKey, communes) {
  const body = communes.map((c) => ({
    slug: c.slug,
    label: c.label,
    show_in_menu: c.show_in_menu,
    menu_order: c.menu_order,
  }));

  const res = await supabaseFetchJson(
    base,
    serviceKey,
    `/communes?on_conflict=slug`,
    {
      method: "POST",
      headers: {
        Prefer: "return=representation,resolution=merge-duplicates",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  return Array.isArray(res) ? res : [];
}

function isRestaurantPost(row) {
  const categoryLinks = Array.isArray(row.category_links) ? row.category_links : [];
  const mapped = categoryLinks.some(
    (c) => String(c?.category?.slug || "").toLowerCase().trim() === "restaurantes"
  );
  if (mapped) return true;

  const translations = Array.isArray(row.translations) ? row.translations : [];
  return translations.some((t) => {
    const cat = String(t?.category || "").toLowerCase().trim();
    const catSlug = cat.replace(/\s+/g, "-");
    return cat === "restaurantes" || catSlug === "restaurantes";
  });
}

function coerceStringArray(x) {
  if (Array.isArray(x)) return x.map((v) => String(v || "")).filter(Boolean);
  if (typeof x === "string") return [x];
  return [];
}

async function fetchAllPostsForHeuristic(base, serviceKey) {
  const select =
    "id,slug,address," +
    "locations:post_locations(label,address)," +
    "translations:post_translations(lang,description,category)," +
    "category_links:post_category_map(category:categories(slug,label_es,label_en))";

  const rows = await supabaseFetchJson(
    base,
    serviceKey,
    `/posts?select=${encodeURIComponent(select)}`
  );
  return Array.isArray(rows) ? rows : [];
}

async function deletePostLinks(base, serviceKey, postIds) {
  if (!postIds.length) return;
  // Borrado en batches para evitar URLs demasiado largas
  const batchSize = 200;
  for (let i = 0; i < postIds.length; i += batchSize) {
    const batch = postIds.slice(i, i + batchSize);
    const inList = quoteForIn(batch);
    await supabaseFetchJson(
      base,
      serviceKey,
      `/post_communes?post_id=in.(${inList})`,
      { method: "DELETE" }
    );
  }
}

async function upsertPostCommuneLinks(base, serviceKey, links) {
  if (!links.length) return { inserted: 0 };

  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < links.length; i += batchSize) {
    const batch = links.slice(i, i + batchSize);
    const res = await supabaseFetchJson(
      base,
      serviceKey,
      `/post_communes?on_conflict=post_id,commune_slug`,
      {
        method: "POST",
        headers: {
          Prefer: "return=representation,resolution=merge-duplicates",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batch),
      }
    );

    if (Array.isArray(res)) inserted += res.length;
  }

  return { inserted };
}

async function fetchLinksReport(base, serviceKey) {
  // Trae post slug mediante relación
  const rows = await supabaseFetchJson(
    base,
    serviceKey,
    `/post_communes?select=commune_slug,post:posts(slug)`
  );

  const report = {};
  for (const r of Array.isArray(rows) ? rows : []) {
    const communeSlug = String(r?.commune_slug || "").trim();
    const postSlug = String(r?.post?.slug || "").trim();
    if (!communeSlug || !postSlug) continue;
    if (!report[communeSlug]) report[communeSlug] = [];
    report[communeSlug].push(postSlug);
  }

  // Dedup + sort
  for (const k of Object.keys(report)) {
    report[k] = Array.from(new Set(report[k])).sort();
  }

  return report;
}

async function main() {
  await loadEnvFile(path.join(process.cwd(), ".env.local"));
  await loadEnvFile(path.join(process.cwd(), ".env"));

  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const base = envOrNull("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = envOrNull("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !serviceKey) {
    console.error(
      "Faltan variables NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY (recomendado en .env.local)."
    );
    printHelp();
    process.exit(1);
  }

  await ensureTablesExist(base, serviceKey);

  // Comunas que ya están/estaban en restaurantes (y las que se detectaban en el front)
  const communeLabelsInOrder = [
    "Santiago",
    "Providencia",
    "Las Condes",
    "Vitacura",
    "Lo Barnechea",
    "La Reina",
    "Ñuñoa",
    "Recoleta",
    "Independencia",
    "San Miguel",
    "Estación Central",
    "Maipú",
    "La Florida",
    "Puente Alto",
    "Alto Jahuel",
  ];

  const communes = communeLabelsInOrder
    .map((label, idx) => ({
      slug: slugify(label),
      label,
      show_in_menu: true,
      menu_order: idx + 1,
    }))
    .filter((c) => c.slug);

  console.log(`Upsert comunas (${communes.length})...`);
  const upserted = await upsertCommunes(base, serviceKey, communes);
  console.log(`- OK: ${upserted.length} comunas upserted`);

  // Si no vamos a crear links, solo reportamos lo actual.
  if (args.seedLinks) {
    console.log("Cargando posts para detectar comunas (restaurantes)...");
    const all = await fetchAllPostsForHeuristic(base, serviceKey);
    const restaurants = all.filter(isRestaurantPost);
    console.log(`- Posts restaurantes: ${restaurants.length}`);

    // Reglas del front
    const comunaOverrides = {
      "ceiba-rooftop-bar-sabores-amazonicos": ["Lo Barnechea"],
      "ceiba-roof-top-renace-en-lo-barnechea": ["Lo Barnechea", "Santiago"],
      "casaluz-una-brillante-luz-en-barrio-italia": ["Providencia"],
      "anima-el-reino-de-lo-esencial": ["Providencia"],
      "mirai-food-lab": ["Las Condes", "Santiago"],
    };
    const comunaAdditions = {
      "bloody-mary-kitchen-bar-el-tomate-como-hilo-conductor-pero-no-el-limite": [
        "Vitacura",
      ],
    };

    const santiagoAllowed = new Set([
      "casa-lastarria-nobleza-arquitectonica",
      "copper-room-y-gran-cafe-hotel-debaines-homenajes-necesarios",
      "demo-magnolia-honestidad-refrescante",
      "flama-la-pizza-que-desafia-lo-clasico",
      "jose-ramon-277-oda-a-lo-mas-sabroso-de-chile",
      "liguria-lastarria-la-filosofia-cicali",
      "the-singular",
      "pulperia-santa-elvira-una-joya-de-matta-sur",
      "ocean-pacifics-destino-gastronomico-patrimonial",
      "mirai-food-lab",
      "bocanariz-la-vitrina-del-vino-chileno",
      "blue-jar-nunca-decepciona",
      "make-make",
      "ceiba-roof-top-renace-en-lo-barnechea",
    ]);

    const labelToSlug = new Map(
      communes.map((c) => [normalizeComuna(c.label), c.slug])
    );

    const links = [];
    const restaurantPostIds = [];

    for (const row of restaurants) {
      const postId = String(row.id || "").trim();
      const postSlug = String(row.slug || "").trim();
      if (!isUuid(postId) || !postSlug) continue;
      restaurantPostIds.push(postId);

      const found = new Set();

      const override = comunaOverrides[postSlug];
      if (override) {
        for (const c of override) found.add(c);
      }
      const addition = comunaAdditions[postSlug];
      if (addition) {
        for (const c of addition) found.add(c);
      }

      const parts = [];
      if (row.address) parts.push(String(row.address));
      if (Array.isArray(row.locations)) {
        for (const loc of row.locations) {
          if (loc?.address) parts.push(String(loc.address));
          if (loc?.label) parts.push(String(loc.label));
        }
      }
      const translations = Array.isArray(row.translations) ? row.translations : [];
      for (const tr of translations) {
        const desc = tr?.description;
        const arr = coerceStringArray(desc);
        if (arr.length) parts.push(arr.join("\n"));
      }

      const haystack = normalizeComuna(parts.join(" "));
      for (const label of communeLabelsInOrder) {
        if (haystack.includes(normalizeComuna(label))) {
          found.add(label);
        }
      }

      // Enforce whitelist Santiago
      if (found.has("Santiago") && !santiagoAllowed.has(postSlug)) {
        found.delete("Santiago");
      }

      for (const label of Array.from(found)) {
        const slug = labelToSlug.get(normalizeComuna(label));
        if (!slug) continue;
        links.push({ post_id: postId, commune_slug: slug });
      }
    }

    console.log(`Links detectados (post_communes): ${links.length}`);

    if (args.resetLinks) {
      console.log("Borrando links existentes para posts de restaurantes...");
      await deletePostLinks(base, serviceKey, restaurantPostIds);
      console.log("- OK: links borrados");
    }

    console.log("Upsert links post_communes...");
    const r = await upsertPostCommuneLinks(base, serviceKey, links);
    console.log(`- OK: upserted ${r.inserted} filas (aprox.)`);
  } else {
    console.log("--noLinks: no se crean asociaciones post_communes");
  }

  console.log("Generando reporte de asociaciones por comuna...");
  const report = await fetchLinksReport(base, serviceKey);

  const outPath =
    args.outFile || path.join("backups", `communes-report-${nowStamp()}.json`);
  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const payload = {
    generatedAt: new Date().toISOString(),
    communes: communes.map((c) => c.slug),
    byCommune: report,
  };

  await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf-8");

  const totalLinks = Object.values(report).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  console.log(`Listo. Reporte: ${outPath}`);
  console.log(`Total asociaciones: ${totalLinks}`);

  // Resumen corto por consola
  const top = Object.entries(report)
    .map(([slug, posts]) => ({ slug, count: (posts || []).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  console.log("Top comunas por cantidad de posts:");
  for (const x of top) {
    console.log(`- ${x.slug}: ${x.count}`);
  }
}

main().catch((e) => {
  console.error(String(e?.message || e));
  process.exit(1);
});
