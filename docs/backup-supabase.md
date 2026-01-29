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

## 4) Descargar Storage (archivos)

El backup por REST **no incluye Storage**. Para que el “espejo” sea funcional (imágenes, uploads, etc.), necesitas copiar los archivos del bucket.

Este repo incluye un script para **descargar** el bucket a una carpeta local.

### 4.1 Crear un env SOLO para Storage

Crea un archivo, por ejemplo `.env.storage.old.local` (no se commitea), con:

- `SUPABASE_URL=https://<REF_VIEJO>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_DEL_VIEJO>`
- `SUPABASE_STORAGE_BUCKET=public`

### 4.2 Descargar el bucket

Ejecuta:

- `npm run storage:download -- --env .env.storage.old.local --out storage-old`

Opcional:

- `--bucket public` (si no usas `SUPABASE_STORAGE_BUCKET`)
- `--skip-existing` para reintentos sin re-descargar lo que ya existe

> Nota: Esto descarga “tal cual” los paths del bucket dentro de `storage-old/`.
