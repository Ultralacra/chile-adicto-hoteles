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
    // silencioso si no existe
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

function parseArgs(argv) {
  const out = {
    outDir: null,
    tables: null,
    pageSize: 1000,
    help: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--out" || a === "--outDir") out.outDir = argv[++i] || null;
    else if (a === "--tables") out.tables = (argv[++i] || "").trim();
    else if (a === "--pageSize") out.pageSize = Number(argv[++i] || "1000") || 1000;
  }
  return out;
}

function printHelp() {
  console.log(`\nBackup Supabase (REST)\n\nUso:\n  node scripts/backup-supabase-rest.mjs [--out backups/mi-backup] [--tables posts,categories,...] [--pageSize 1000]\n\nRequiere variables de entorno (idealmente en .env.local):\n  NEXT_PUBLIC_SUPABASE_URL\n  SUPABASE_SERVICE_ROLE_KEY\n\nEjemplo:\n  node scripts/backup-supabase-rest.mjs --out backups/supabase-${nowStamp()}\n`);
}

async function supabaseFetchJson(base, serviceKey, restPath) {
  const url = `${base}/rest/v1${restPath}`;
  const res = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "count=exact",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = `Supabase REST error ${res.status} en ${restPath}: ${text}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

async function exportTable({ base, serviceKey, table, outDir, pageSize }) {
  const file = path.join(outDir, `${table}.json`);
  const handle = await fs.open(file, "w");

  let first = true;
  let offset = 0;

  try {
    await handle.write("[\n");

    for (;;) {
      const page = await supabaseFetchJson(
        base,
        serviceKey,
        `/${encodeURIComponent(table)}?select=*&limit=${pageSize}&offset=${offset}`
      );

      if (page.length === 0) break;

      for (const row of page) {
        const line = JSON.stringify(row);
        if (!first) await handle.write(",\n");
        await handle.write(line);
        first = false;
      }

      offset += page.length;
      if (page.length < pageSize) break;
    }

    await handle.write("\n]\n");
  } finally {
    await handle.close();
  }

  return { table, rows: offset, file: path.relative(process.cwd(), file) };
}

async function main() {
  // Cargar variables sin depender de paquetes (prioridad: .env.local)
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

  const defaultTables = [
    "categories",
    "posts",
    "post_translations",
    "post_images",
    "post_locations",
    "post_useful_info",
    "post_category_map",
    "sliders",
    "media",
  ];

  const tables = (args.tables ? args.tables.split(",") : defaultTables)
    .map((t) => t.trim())
    .filter(Boolean);

  const outDir = args.outDir || path.join("backups", `supabase-rest-${nowStamp()}`);
  await fs.mkdir(outDir, { recursive: true });

  const manifest = {
    exportedAt: new Date().toISOString(),
    outDir: path.relative(process.cwd(), outDir),
    tables,
    results: [],
    errors: [],
    warnings: [],
  };

  console.log(`Exportando ${tables.length} tabla(s) a: ${manifest.outDir}`);

  for (const table of tables) {
    process.stdout.write(`- ${table}... `);
    try {
      const r = await exportTable({
        base,
        serviceKey,
        table,
        outDir,
        pageSize: args.pageSize,
      });
      manifest.results.push(r);
      console.log(`${r.rows} filas`);
    } catch (e) {
      const msg = String(e?.message || e);
      // Si la tabla no existe (por ejemplo, 'media'), lo tratamos como warning.
      const isMissingTable =
        /PGRST205/i.test(msg) ||
        /Could not find the table/i.test(msg) ||
        /REST error 404/i.test(msg);
      if (isMissingTable) {
        manifest.warnings.push({ table, message: msg });
        console.log("(omitida)");
      } else {
        manifest.errors.push({ table, message: msg });
        console.log("ERROR");
        console.error(`  ${msg}`);
      }
    }
  }

  await fs.writeFile(
    path.join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf-8"
  );

  const ok = manifest.results.reduce((sum, r) => sum + (r.rows || 0), 0);
  const errCount = manifest.errors.length;
  const warnCount = manifest.warnings.length;
  console.log(`\nListo. Filas exportadas: ${ok}. Warnings: ${warnCount}. Errores: ${errCount}.`);

  if (errCount > 0) process.exit(2);
}

main().catch((e) => {
  console.error(String(e?.message || e));
  process.exit(1);
});
