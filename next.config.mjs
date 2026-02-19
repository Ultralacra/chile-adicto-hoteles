/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "azure-seal-918691.hostingersite.com",
      },
      {
        protocol: "https",
        hostname: "xtctddbjwmmeirjltatm.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/Neutra-:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/bannerHome/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/sliderHome/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  async rewrites() {
    // Rutas "bonitas":
    // - Categorías sin prefijo: /iconos -> /categoria/iconos, etc.
    // - Posts sin prefijo: /mi-post -> /lugar/mi-post (evitando colisiones con rutas reservadas)
    const categoryPattern =
      ':slug(iconos|ninos|arquitectura|barrios|mercados|miradores|museos|palacios|parques|paseos-fuera-de-santiago|restaurantes|monumentos-nacionales|cafes)';
    return [
      // Categorías sin prefijo
      {
        source: `/:${categoryPattern}`.replace('::', ':'),
        destination: '/categoria/:slug',
      },
      // Posts sin prefijo (excluir rutas reservadas mediante negative lookahead)
      {
        source:
          '/:slug((?!admin|api|categoria|lugar|_next|favicon\\.ico|robots\\.txt|sitemap\\.xml|imagenes-slider|slider-desktop|slider-movil|flags|public).+)',
        destination: '/lugar/:slug',
      },
    ];
  },
};

export default nextConfig
