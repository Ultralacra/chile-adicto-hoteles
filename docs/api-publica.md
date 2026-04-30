# API Pública — Chile Adicto Hoteles & Santiago Adicto

> **Nota sobre el sitio:** Todos los endpoints son compartidos. El sitio se selecciona mediante el header `x-site-id` o el query param `previewSite`. En producción, el dominio de la request lo determina automáticamente el servidor.

---

## Identificación del sitio

| Sitio                | Dominio de producción   | `x-site-id` / `previewSite` |
| -------------------- | ----------------------- | --------------------------- |
| Chile Adicto Hoteles | `chileadictohoteles.cl` | `chileadicto`               |
| Santiago Adicto      | `santiagoadicto.cl`     | `santiagoadicto`            |

Para consultas desde herramientas externas (Postman, curl, integraciones) desde localhost o fuera del dominio de producción, usa el query param:

```
?previewSite=chileadicto
?previewSite=santiagoadicto
```

---

## Base URLs

| Entorno                      | URL base                        |
| ---------------------------- | ------------------------------- |
| Chile Adicto (producción)    | `https://chileadictohoteles.cl` |
| Santiago Adicto (producción) | `https://santiagoadicto.cl`     |
| Local (desarrollo)           | `http://localhost:3000`         |

---

## 1. Categorías — `GET /api/categories`

Devuelve las categorías del sitio.

### Query params

| Parámetro     | Tipo       | Descripción                                                                                                                 |
| ------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| `full`        | `0` \| `1` | `0` (defecto): devuelve un array de strings en mayúsculas. `1`: devuelve objetos completos con slug, labels e info de menú. |
| `nav`         | `0` \| `1` | Si `1`, filtra solo las categorías con `show_in_menu = true` (para construir navegaciones).                                 |
| `previewSite` | string     | Forzar el sitio en dev/pruebas.                                                                                             |

---

### Chile Adicto — lista simple

```http
GET https://chileadictohoteles.cl/api/categories
```

**Respuesta 200:**

```json
["CABANAS", "COSTA", "HOTELES", "LODGES", "NORTE", "PATAGONIA", "SUR"]
```

---

### Chile Adicto — lista completa (`full=1`)

```http
GET https://chileadictohoteles.cl/api/categories?full=1
```

**Respuesta 200:**

```json
[
  {
    "slug": "hoteles",
    "label_es": "Hoteles",
    "label_en": "Hotels",
    "show_in_menu": true,
    "menu_order": 1
  },
  {
    "slug": "norte",
    "label_es": "Norte",
    "label_en": "North",
    "show_in_menu": true,
    "menu_order": 2
  }
]
```

---

### Santiago Adicto — categorías de navegación

```http
GET https://santiagoadicto.cl/api/categories?full=1&nav=1
```

**Respuesta 200:**

```json
[
  {
    "slug": "barrios",
    "label_es": "Barrios",
    "label_en": "Neighborhoods",
    "show_in_menu": true,
    "menu_order": 1
  },
  {
    "slug": "museos",
    "label_es": "Museos",
    "label_en": "Museums",
    "show_in_menu": true,
    "menu_order": 2
  }
]
```

---

### Desde localhost (desarrollo)

```http
GET http://localhost:3000/api/categories?full=1&previewSite=santiagoadicto
GET http://localhost:3000/api/categories?full=1&previewSite=chileadicto
```

---

## 2. Posts (listado) — `GET /api/posts`

Devuelve el listado de posts publicados del sitio.

### Query params

| Parámetro        | Tipo           | Descripción                                                                |
| ---------------- | -------------- | -------------------------------------------------------------------------- |
| `category`       | string         | Filtrar por **label** de categoría (ej: `Hoteles`).                        |
| `categorySlug`   | string         | Filtrar por **slug** de categoría (ej: `hoteles`).                         |
| `q`              | string         | Búsqueda de texto libre (nombre del post en ES o EN).                      |
| `sort`           | `alphabetical` | Ordenar alfabéticamente. Sin este param, devuelve en orden de la BD.       |
| `lang`           | `es` \| `en`   | Idioma de referencia para el ordenamiento alfabético. Defecto: `es`.       |
| `limit`          | número (1–100) | Máximo de resultados a devolver.                                           |
| `offset`         | número         | Desplazamiento para paginación. Defecto: `0`.                              |
| `homeFeed`       | `1`            | Excluye categorías de restaurantes/bares/agenda del resultado (para home). |
| `includeExpired` | `1`            | Incluye posts con publicación vencida (ej: agenda cultural).               |
| `previewSite`    | string         | Forzar el sitio en dev/pruebas.                                            |

---

### Chile Adicto — todos los posts

```http
GET https://chileadictohoteles.cl/api/posts
```

---

### Chile Adicto — posts por categoría

```http
GET https://chileadictohoteles.cl/api/posts?categorySlug=hoteles
```

---

### Chile Adicto — paginado (10 por página, segunda página)

```http
GET https://chileadictohoteles.cl/api/posts?limit=10&offset=10
```

---

### Santiago Adicto — posts por categoría + ordenados

```http
GET https://santiagoadicto.cl/api/posts?categorySlug=museos&sort=alphabetical&lang=es
```

---

### Santiago Adicto — búsqueda de texto

```http
GET https://santiagoadicto.cl/api/posts?q=parque+forestal
```

---

### Desde localhost (desarrollo)

```http
GET http://localhost:3000/api/posts?previewSite=chileadicto&categorySlug=hoteles
GET http://localhost:3000/api/posts?previewSite=santiagoadicto&sort=alphabetical
```

---

### Respuesta 200 (array de posts)

```json
[
  {
    "slug": "hotel-explora-atacama",
    "site": "chileadicto",
    "publicationStatus": "published",
    "publishStartAt": null,
    "publishEndAt": null,
    "featuredImage": "https://...supabase.../hotel-explora.jpg",
    "website": "https://explora.com",
    "websitePublic": "https://explora.com",
    "instagram": "@explorahotels",
    "email": null,
    "phone": null,
    "address": "San Pedro de Atacama",
    "hours": null,
    "images": [
      "https://...supabase.../img1.jpg",
      "https://...supabase.../img2.jpg"
    ],
    "locations": [
      {
        "label": "Hotel",
        "address": "San Pedro de Atacama",
        "hours": null,
        "website": "https://explora.com",
        "instagram": null,
        "reservationLink": null,
        "phone": null,
        "email": null
      }
    ],
    "es": {
      "name": "Hotel Explora Atacama",
      "subtitle": "Lujo en el desierto",
      "description": ["Descripción en español..."],
      "infoHtml": null,
      "infoHtmlNew": null,
      "category": "Hoteles"
    },
    "en": {
      "name": "Hotel Explora Atacama",
      "subtitle": "Luxury in the desert",
      "description": ["English description..."],
      "infoHtml": null,
      "infoHtmlNew": null,
      "category": "Hotels"
    },
    "categories": ["Hoteles"],
    "categoryFeaturedImages": {
      "hoteles": "https://...supabase.../featured.jpg"
    },
    "communes": ["San Pedro de Atacama"]
  }
]
```

---

## 3. Detalle de post — `GET /api/posts/[slug]`

Devuelve un post específico por su slug.

### Parámetros de ruta

| Parámetro | Descripción                                                |
| --------- | ---------------------------------------------------------- |
| `slug`    | Identificador único del post (ej: `hotel-explora-atacama`) |

### Query params

| Parámetro     | Tipo   | Descripción                     |
| ------------- | ------ | ------------------------------- |
| `previewSite` | string | Forzar el sitio en dev/pruebas. |

---

### Chile Adicto — detalle de post

```http
GET https://chileadictohoteles.cl/api/posts/hotel-explora-atacama
```

---

### Santiago Adicto — detalle de post

```http
GET https://santiagoadicto.cl/api/posts/cerro-san-cristobal
```

---

### Desde localhost (desarrollo)

```http
GET http://localhost:3000/api/posts/hotel-explora-atacama?previewSite=chileadicto
GET http://localhost:3000/api/posts/cerro-san-cristobal?previewSite=santiagoadicto
```

---

### Respuesta 200

Misma forma que el objeto del listado (ver arriba), pero como objeto único (no array).

```json
{
  "slug": "cerro-san-cristobal",
  "site": "santiagoadicto",
  "publicationStatus": "published",
  "featuredImage": "https://...supabase.../cerro.jpg",
  "images": ["https://...supabase.../img1.jpg"],
  "locations": [...],
  "es": {
    "name": "Cerro San Cristóbal",
    "subtitle": "El pulmón verde de Santiago",
    "description": ["..."],
    "infoHtml": null,
    "infoHtmlNew": "<p>Info adicional...</p>",
    "category": "Parques"
  },
  "en": {
    "name": "San Cristobal Hill",
    "subtitle": "Santiago's green lung",
    "description": ["..."],
    "infoHtml": null,
    "infoHtmlNew": null,
    "category": "Parks"
  },
  "categories": ["Parques"],
  "communes": ["Providencia"]
}
```

### Respuesta 404

```json
{ "error": "not_found" }
```

---

## Errores comunes

| Código | Cuerpo                          | Causa                                         |
| ------ | ------------------------------- | --------------------------------------------- |
| `404`  | `{ "error": "not_found" }`      | El slug no existe o el post está despublicado |
| `500`  | `{ "error": "internal_error" }` | Error interno del servidor                    |

---

## Ejemplos con `curl`

```bash
# Categorías de Chile Adicto (producción)
curl https://chileadictohoteles.cl/api/categories?full=1

# Categorías de Santiago Adicto (producción)
curl https://santiagoadicto.cl/api/categories?full=1

# Posts de Santiago Adicto filtrados por categoría
curl "https://santiagoadicto.cl/api/posts?categorySlug=parques&sort=alphabetical"

# Detalle de un post en Chile Adicto
curl https://chileadictohoteles.cl/api/posts/hotel-explora-atacama

# Desde localhost — Forzar sitio con previewSite
curl "http://localhost:3000/api/posts?previewSite=chileadicto&limit=5"
curl "http://localhost:3000/api/posts/cerro-san-cristobal?previewSite=santiagoadicto"
```
