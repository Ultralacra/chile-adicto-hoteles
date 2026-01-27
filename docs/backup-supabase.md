# Backup completo (Supabase)

Este proyecto puede hacer un respaldo de datos vía REST (PostgREST) usando `SUPABASE_SERVICE_ROLE_KEY`.

> Nota: esto respalda **datos de tablas expuestas por REST** (normalmente schema `public`).
> No incluye automáticamente:
>
> - Schema / migraciones / policies RLS / funciones
> - `auth.*` (usuarios)
> - Storage (archivos)

## 1) Backup de datos (REST)

Requiere en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Ejecutar:

- `npm run db:backup:rest`

Opciones útiles:

- `node scripts/backup-supabase-rest.mjs --out backups/supabase-rest-mi-backup`
- `node scripts/backup-supabase-rest.mjs --limit 1000`
- `node scripts/backup-supabase-rest.mjs --tables posts,post_images,sliders`

Salida:

- Carpeta `backups/supabase-rest-YYYYMMDD-HHMMSS/`
- `manifest.json` con conteos por tabla
- `openapi.json` (para ver qué tablas fueron detectadas)

## 2) Restore de datos (REST)

Este restore **asume**:

- El Supabase destino ya tiene el **mismo schema** (tablas y columnas)
- Las tablas destino están **vacías**

Variables recomendadas para el destino:

- `SUPABASE_RESTORE_URL`
- `SUPABASE_RESTORE_SERVICE_ROLE_KEY`

Ejecutar:

- `npm run db:restore:rest -- --backup backups/supabase-rest-YYYYMMDD-HHMMSS`

Dry run:

- `npm run db:restore:rest -- --backup backups/supabase-rest-YYYYMMDD-HHMMSS --dry-run`

## 3) Backup realmente completo (schema + datos)

Para un respaldo 100% clonado (schema + datos), lo más confiable es usar `pg_dump` (o Supabase CLI) con la cadena de conexión del proyecto.

En Supabase Dashboard:

- Project Settings → Database → Connection string

Luego:

- `pg_dump` (datos + schema)
- `pg_restore` en el nuevo proyecto

Si quieres, te dejo un comando exacto cuando me pegues tu connection string (sin password, o la pones tú localmente).
