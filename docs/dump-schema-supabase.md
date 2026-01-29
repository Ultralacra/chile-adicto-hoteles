# Dump de schema Supabase (SQL para pegar/aplicar)

Este proyecto trae un script que genera un `.sql` con **solo schema** (tablas, índices, funciones, políticas/RLS, etc.) usando `pg_dump`.

## Requisitos

Necesitas `pg_dump` disponible en tu `PATH`.

En Windows (recomendado):

- Con winget:

```powershell
winget install PostgreSQL.PostgreSQL
```

- Verifica:

```powershell
pg_dump --version
```

> Si instalaste PostgreSQL pero no aparece `pg_dump`, revisa el `PATH` (típico: `C:\Program Files\PostgreSQL\<version>\bin`).

## Configurar connection string

En Supabase (proyecto origen):

- Settings → Database → Connection string → **URI**

Agrega a tu `.env.local` (o el env que uses):

```env
SUPABASE_DB_URL="postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:5432/postgres"
```

## Generar el SQL

```bash
npm run db:dump:schema
```

Salida:

- `backups/schema/schema-YYYYMMDD-HHMMSS.sql`

Si quieres un nombre fijo:

```bash
node scripts/dump-supabase-schema.mjs --env .env.local --file backups/schema/schema.sql
```

## Aplicarlo en el Supabase nuevo

Opción A (SQL Editor en Supabase):

- Abre el archivo `.sql` generado, copia y pega en SQL Editor y ejecuta.

Opción B (recomendado si es grande):

- Usa `psql` apuntando al DB del proyecto nuevo y ejecuta el archivo.
