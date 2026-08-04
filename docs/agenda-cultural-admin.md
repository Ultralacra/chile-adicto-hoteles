# Agenda Cultural administrable

## Primera instalación

1. Abre el SQL Editor del proyecto de Supabase.
2. Ejecuta [2026-08-03-upgrade-agenda-cultural.sql](../supabase/2026-08-03-upgrade-agenda-cultural.sql).
3. Comprueba que se crearon las columnas nuevas en `agenda_banners`, `agenda_assignments` y la tabla `agenda_featured_slots`.
4. Despliega la aplicación con las variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `ADMIN_API_KEY` configuradas.

La migración no borra filas ni columnas existentes. Además carga como configuración inicial todos los banners semanales y rangos de posts que antes estaban definidos en código. Los banners previos se copian como alternativa en español y los slugs existentes se vinculan con `posts.id` cuando corresponden al sitio.

## Flujo editorial

Abre `/admin/agenda-cultural` y selecciona el sitio en el menú lateral antes de editar.

### Períodos

Un período define un bloque visible de Agenda. Puede durar un día, una semana, un mes o cualquier rango de fechas.

- Crea el rango de inicio y término.
- Sube o pega las cuatro variantes opcionales: desktop y móvil para ES/EN.
- Publica el período cuando esté listo. Un período en borrador no se muestra públicamente.
- Usa el nombre interno para reconocerlo en el panel.

### Posts programados

Selecciona un post de categoría Agenda Cultural y define su rango de visibilidad. El post aparece automáticamente en todos los períodos publicados que se crucen con ese rango. Para mostrarlo en rangos separados, crea una programación independiente para cada intervalo.

La prioridad menor se muestra primero. Desactivar una programación conserva el registro pero la retira de la web.

### Destacado global

El destacado se renderiza antes de los períodos e incluye banner responsive y la ficha del post.

- Define post, rango, banners ES/EN y estado.
- Solo puede existir un destacado publicado con un rango de vigencia que se cruce con otro del mismo sitio.
- Elige un rango explícito para evitar que un destacado permanezca vigente indefinidamente.

## Recomendaciones de assets

- Usa WebP, PNG o JPEG.
- Sube una pieza horizontal para desktop y otra vertical para móvil.
- Completa siempre el texto alternativo en ES y EN.
- Revisa la página pública en escritorio y móvil antes de publicar.
