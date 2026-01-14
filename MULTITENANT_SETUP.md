# 🌐 Implementación Multi-Tenant - Guía Completa

Esta guía te ayudará a activar el sistema multi-tenant que permite controlar múltiples sitios (Santiago Adicto y Chile Adicto) desde un solo admin.

## 📋 Tabla de Contenidos

- [Resumen del sistema](#resumen-del-sistema)
- [Paso 1: Migración de Base de Datos](#paso-1-migración-de-base-de-datos)
- [Paso 2: Configurar Dominios en Vercel](#paso-2-configurar-dominios-en-vercel)
- [Paso 3: Uso del Admin](#paso-3-uso-del-admin)
- [Paso 4: Testing](#paso-4-testing)
- [FAQ](#faq)

---

## Resumen del sistema

### ✅ Lo que se implementó:

1. **Columna `site` en la base de datos**: Todas las tablas principales tienen una nueva columna `site` que identifica a qué sitio pertenece cada registro.

2. **Middleware de detección de dominio**: Automáticamente detecta desde qué dominio viene la petición y filtra el contenido.

3. **APIs multi-tenant**: Todas las APIs ahora filtran por sitio automáticamente:

   - `/api/posts` - Solo muestra posts del sitio actual
   - `/api/categories` - Solo muestra categorías del sitio actual
   - `/api/posts/[slug]` - Solo accede a posts del sitio actual

4. **Admin unificado**: Un selector de sitio en el panel de admin te permite cambiar entre sitios y gestionar su contenido.

5. **Datos existentes protegidos**: Todos tus datos actuales se asignaron automáticamente a "santiagoadicto".

---

## Paso 1: Migración de Base de Datos

### 🔧 Ejecutar el script SQL

1. **Accede al panel de Supabase**:

   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto: `xtctddbjwmmeirjltatm`

2. **Abre el SQL Editor**:

   - En el menú lateral, click en "SQL Editor"
   - Click en "New query"

3. **Copia y pega el contenido del archivo**:

   ```
   scripts/sql/add-site-column.sql
   ```

4. **Ejecuta el script**:

   - Click en "Run" o presiona `Ctrl + Enter`
   - Verifica que no haya errores

5. **Verifica la migración**:

   ```sql
   -- Ejecuta esta consulta para verificar
   SELECT 'posts' as table_name, COUNT(*) as total,
          COUNT(CASE WHEN site = 'santiagoadicto' THEN 1 END) as santiagoadicto_count
   FROM posts
   UNION ALL
   SELECT 'categories', COUNT(*),
          COUNT(CASE WHEN site = 'santiagoadicto' THEN 1 END)
   FROM categories
   UNION ALL
   SELECT 'sliders', COUNT(*),
          COUNT(CASE WHEN site = 'santiagoadicto' THEN 1 END)
   FROM sliders;
   ```

   **Resultado esperado**: Todos los registros deben tener `santiagoadicto_count` igual a `total`.

---

## Paso 2: Configurar Dominios en Vercel

### 🌍 Configurar ambos dominios

1. **Accede a tu proyecto en Vercel**:

   - Ve a https://vercel.com/dashboard
   - Selecciona tu proyecto

2. **Agrega el segundo dominio**:

   - Ve a "Settings" > "Domains"
   - Click en "Add Domain"
   - Ingresa tu dominio de Chile Adicto (ej: `chileadicto.cl`)
   - Sigue las instrucciones para configurar el DNS

3. **Configura los registros DNS** (en tu proveedor de dominio):

   Para `chileadicto.cl`:

   ```
   Type: CNAME
   Name: @ (o www)
   Value: cname.vercel-dns.com
   ```

4. **Verifica la configuración**:
   - Espera unos minutos para la propagación DNS
   - Ambos dominios deben aparecer en verde en Vercel

### 📝 Actualiza la configuración de sitios

Si tu dominio de Chile Adicto es diferente a `chileadicto.cl`, actualiza en:

**`lib/sites-config.ts`** línea 33:

```typescript
chileadicto: {
  id: 'chileadicto',
  name: 'chileadicto',
  displayName: 'Chile Adicto',
  domain: 'TU-DOMINIO-REAL.cl', // ⬅️ Cambia esto
  // ...
}
```

---

## Paso 3: Uso del Admin

### 🎛️ Selector de Sitio

1. **Accede al admin**:

   - Ve a `/admin`
   - Inicia sesión

2. **Cambia de sitio**:

   - En el sidebar, verás un selector con un ícono de globo 🌐
   - Selecciona "Santiago Adicto" o "Chile Adicto"
   - Todos los posts, categorías y contenido se filtrarán automáticamente

3. **Crear contenido para Chile Adicto**:

   - Selecciona "Chile Adicto" en el selector
   - Ve a "Crear nuevo"
   - Crea tu post normalmente
   - Se guardará automáticamente para Chile Adicto

4. **Gestionar categorías**:
   - Cada sitio puede tener sus propias categorías
   - Ve a "Categorías"
   - Con Chile Adicto seleccionado, puedes crear categorías como:
     - Norte
     - Centro
     - Sur
     - Patagonia
     - Playas
     - Montañas
     - etc.

---

## Paso 4: Testing

### ✅ Verificar que todo funciona

1. **Test del frontend (Santiago Adicto)**:

   ```bash
   # Visita santiagoadicto.cl
   # Debes ver solo los posts de Santiago Adicto
   ```

2. **Test del frontend (Chile Adicto)**:

   ```bash
   # Visita chileadicto.cl (o tu dominio configurado)
   # Debes ver solo los posts de Chile Adicto (vacío por ahora)
   ```

3. **Test del admin**:

   - Cambia el selector de sitio
   - Verifica que la lista de posts cambia
   - Crea un post de prueba en Chile Adicto
   - Verifica que NO aparece en la lista de Santiago Adicto

4. **Test de la API** (opcional):

   ```bash
   # Test Santiago Adicto
   curl https://santiagoadicto.cl/api/posts

   # Test Chile Adicto
   curl https://chileadicto.cl/api/posts
   ```

---

## FAQ

### ❓ ¿Qué pasa si no ejecuto la migración SQL?

La aplicación no funcionará correctamente. Las APIs intentarán filtrar por `site` pero la columna no existirá, generando errores.

### ❓ ¿Puedo revertir los cambios?

Sí, pero tendrías que:

1. Hacer rollback del código con git
2. Eliminar la columna `site` de Supabase (no recomendado si ya creaste contenido para Chile Adicto)

### ❓ ¿Los datos existentes están seguros?

Sí, absolutamente. La migración SQL:

- Agrega la columna con valor por defecto `'santiagoadicto'`
- NO modifica ningún dato existente
- Es idempotente (se puede ejecutar múltiples veces sin problemas)

### ❓ ¿Cómo agrego un tercer sitio en el futuro?

1. Edita `lib/sites-config.ts`
2. Agrega la nueva configuración al objeto `SITES`
3. Actualiza el tipo `SiteId` para incluir el nuevo ID
4. Deploy y configura el nuevo dominio en Vercel

### ❓ ¿Puedo tener diferentes categorías por sitio?

¡Sí! Ese es uno de los beneficios. Santiago Adicto puede tener:

- Iconos, Niños, Arquitectura, Barrios, etc.

Mientras que Chile Adicto puede tener:

- Norte, Centro, Sur, Patagonia, Playas, Montañas, etc.

### ❓ ¿Las imágenes se comparten entre sitios?

Actualmente sí, el bucket de Supabase es compartido. Pero cada sitio tiene su propia tabla `media` con el campo `site`, por lo que puedes organizar las imágenes por sitio si lo necesitas.

### ❓ ¿Cómo pruebo localmente con diferentes dominios?

Agrega al archivo `hosts` (Windows: `C:\Windows\System32\drivers\etc\hosts`):

```
127.0.0.1  santiagoadicto.local
127.0.0.1  chileadicto.local
```

Luego ejecuta:

```bash
pnpm dev
```

Y visita `http://santiagoadicto.local:3000` o `http://chileadicto.local:3000`

---

## 🎉 ¡Listo!

Tu sistema multi-tenant está configurado. Ahora puedes:

- ✅ Gestionar 2 sitios desde un solo admin
- ✅ Crear contenido específico para cada sitio
- ✅ Mantener todo centralizado
- ✅ Escalar a más sitios fácilmente en el futuro

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los logs en la consola del navegador
2. Revisa los logs del servidor en Vercel
3. Verifica que la migración SQL se ejecutó correctamente
4. Asegúrate de que los dominios están configurados correctamente

---

**Última actualización**: 14 de enero de 2026
