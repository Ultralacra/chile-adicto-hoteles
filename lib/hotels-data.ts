export interface HotelTranslation {
  name: string
  subtitle: string
  description: string[]
  category: string
  location: string
  distance: string
  distanceFromCalama?: string
  amenities: string[]
}

export interface Hotel {
  slug: string
  es: HotelTranslation
  en: HotelTranslation
  website: string
  instagram: string
  images: string[]
  categories: string[]
}

export const hotelsData: Hotel[] = [
  // SANTIAGO HOTELS
  {
    slug: "w-santiago",
    es: {
      name: "W SANTIAGO",
      subtitle: "UN LUGAR PARA CONECTAR",
      description: [
        "W Santiago estratégicamente ubicado en el sofisticado barrio El Golf, epicentro financiero y de entretenimiento de la ciudad, es la opción perfecta para energizarse, celebrar y conectarse con el entorno local. Con 196 habitaciones, 11 salas de reuniones, parte de un complejo que incluye un centro comercial y oficinas, W Santiago se posiciona como el destino ideal para quienes buscan una experiencia vibrante y cosmopolita.",
        "El hotel ofrece una experiencia única que combina diseño contemporáneo, gastronomía de primer nivel y un ambiente energético que refleja el espíritu de la ciudad.",
      ],
      category: "HOTEL 5 ESTRELLAS",
      location: "UBICACIÓN: SANTIAGO/BARRIO EL GOLF",
      distance: "EN EL CORAZÓN DE SANTIAGO",
      amenities: ["196 HABITACIONES", "11 SALAS DE REUNIONES", "RESTAURANT & BAR", "GIMNASIO", "PISCINA"],
    },
    en: {
      name: "W SANTIAGO",
      subtitle: "A PLACE TO CONNECT",
      description: [
        "Strategically located in the sophisticated El Golf neighborhood, Santiago's financial and entertainment hub, W Santiago is the perfect choice to recharge, celebrate, and connect with the local scene. With 196 rooms, 11 meeting spaces, and a complex that includes a shopping center and offices, W Santiago positions itself as the ideal destination for those seeking a vibrant and cosmopolitan experience.",
        "The hotel offers a unique experience that combines contemporary design, world-class gastronomy, and an energetic atmosphere that reflects the spirit of the city.",
      ],
      category: "5-STAR HOTEL",
      location: "LOCATION: SANTIAGO/EL GOLF DISTRICT",
      distance: "IN THE HEART OF SANTIAGO",
      amenities: ["196 ROOMS", "11 MEETING SPACES", "RESTAURANT & BAR", "GYM", "POOL"],
    },
    website: "WWW.MARRIOTT.COM/WSANTIAGO",
    instagram: "@WSANTIAGO",
    images: [
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/09/portada-w-santiago2.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/09/w-santiago-1-2.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/09/w-santiago-2.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/09/w-santiago-3.webp",
    ],
    categories: ["SANTIAGO", "TODOS"],
  },
  {
    slug: "luciano-k-hotel",
    es: {
      name: "LUCIANO K HOTEL",
      subtitle: "HOTEL BOUTIQUE - DISEÑO ART DECO - ARQUITECTURA - HISTORIA - UBICACIÓN",
      description: [
        "Ubicado en el principal barrio bohemio y cultural de Santiago, Luciano K es un hotel boutique de 38 habitaciones, una mezcla de carácter antiguo y diseño art deco.",
        "El hotel cuenta con un hall de entrada, bar, sauna y restaurante en el primer piso. Un rooftop de 300 metros cuadrados con bar, piscina temperada y espectaculares vistas de 360 grados de la ciudad y la cordillera de Los Andes.",
      ],
      category: "HOTEL BOUTIQUE",
      location: "UBICACIÓN: SANTIAGO/BARRIO LASTARRIA",
      distance: "EN EL CORAZÓN CULTURAL DE SANTIAGO",
      amenities: ["38 HABITACIONES", "ROOFTOP CON PISCINA", "RESTAURANT & BAR", "SAUNA", "VISTAS 360°"],
    },
    en: {
      name: "LUCIANO K HOTEL",
      subtitle: "BOUTIQUE HOTEL - ART DECO DESIGN - ARCHITECTURE - HISTORY - LOCATION",
      description: [
        "Located in Santiago's main bohemian and cultural district, Luciano K is a boutique hotel with 38 rooms, blending vintage charm with Art Deco design.",
        "The hotel features a lobby, bar, sauna, and restaurant on the ground floor. Its 300-square-meter rooftop offers a bar, heated pool, and spectacular 360-degree views of the city and the Andes Mountains.",
      ],
      category: "BOUTIQUE HOTEL",
      location: "LOCATION: SANTIAGO/LASTARRIA DISTRICT",
      distance: "IN THE CULTURAL HEART OF SANTIAGO",
      amenities: ["38 ROOMS", "ROOFTOP WITH POOL", "RESTAURANT & BAR", "SAUNA", "360° VIEWS"],
    },
    website: "WWW.LUCIANOKHOTEL.CL",
    instagram: "@LUCIANOKHOTEL",
    images: [
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/05/Luciano-portadaa.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/05/Luciano-1.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/05/Luciano-2.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/05/Luciano-3.webp",
    ],
    categories: ["SANTIAGO", "TODOS"],
  },
  {
    slug: "ac-hotel-santiago-costanera",
    es: {
      name: "AC HOTEL SANTIAGO CENCO COSTANERA",
      subtitle: "VIVE LO MEJOR DE SANTIAGO DESDE UN HOTEL DE PRIMER NIVEL",
      description: [
        "Ubicado en una de las zonas más vibrantes de Santiago de Chile, AC Hotel Santiago Cenco Costanera es un hotel de inspiración europea, rodeado de las zonas de negocios de Las Condes y Vitacura; reconocido por su diseño moderno, sus espectaculares vistas a la cordillera de Los Andes y su excepcional gastronomía y coctelería de autor.",
        "El hotel ofrece una experiencia premium con servicios de primera clase y una ubicación estratégica para explorar lo mejor de Santiago.",
      ],
      category: "HOTEL 5 ESTRELLAS",
      location: "UBICACIÓN: SANTIAGO/LAS CONDES",
      distance: "ZONA EMPRESARIAL DE SANTIAGO",
      amenities: ["DISEÑO EUROPEO", "VISTAS A LA CORDILLERA", "RESTAURANT & BAR", "GIMNASIO", "UBICACIÓN PREMIUM"],
    },
    en: {
      name: "AC HOTEL SANTIAGO CENCO COSTANERA",
      subtitle: "EXPERIENCE THE BEST OF SANTIAGO FROM A FIRST-CLASS HOTEL",
      description: [
        "Located in one of the most vibrant areas of Santiago de Chile, AC Hotel Santiago Cenco Costanera is a European-inspired hotel surrounded by the business districts of Las Condes and Vitacura. Known for its modern design, spectacular views of the Andes, and exceptional gastronomy and signature cocktails.",
        "The hotel offers a premium experience with first-class services and a strategic location to explore the best of Santiago.",
      ],
      category: "5-STAR HOTEL",
      location: "LOCATION: SANTIAGO/LAS CONDES",
      distance: "SANTIAGO BUSINESS DISTRICT",
      amenities: ["EUROPEAN DESIGN", "ANDES VIEWS", "RESTAURANT & BAR", "GYM", "PREMIUM LOCATION"],
    },
    website: "WWW.MARRIOTT.COM/ACSANTIAGO",
    instagram: "@ACHOTELSANTIAGO",
    images: [
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/05/AC-MIRROT-PORTADA.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/05/AC-MIRROT-1.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/05/ac-marriot-2.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2025/05/ac-marriot-3.webp",
    ],
    categories: ["SANTIAGO", "TODOS"],
  },
  {
    slug: "debaines-hotel",
    es: {
      name: "DEBAINES HOTEL",
      subtitle: "SANTIAGO HISTÓRICO, LUJO MODERNO",
      description: [
        "Las cumbres nevadas de los Andes son el telón de fondo incomparable del Debaines Hotel Santiago. Ubicado entre los lugares más famosos de la ciudad y al lado del Teatro Municipal, este paraíso urbano combina la arquitectura clásica con un interior contemporáneo.",
        "El hotel ofrece una experiencia única que fusiona la historia de Santiago con el confort moderno, creando un ambiente sofisticado y acogedor.",
      ],
      category: "HOTEL BOUTIQUE",
      location: "UBICACIÓN: SANTIAGO/CENTRO HISTÓRICO",
      distance: "JUNTO AL TEATRO MUNICIPAL",
      amenities: ["ARQUITECTURA HISTÓRICA", "DISEÑO CONTEMPORÁNEO", "RESTAURANT & BAR", "UBICACIÓN CENTRAL"],
    },
    en: {
      name: "DEBAINES HOTEL",
      subtitle: "HISTORIC SANTIAGO, MODERN LUXURY",
      description: [
        "The snow-capped Andes create an unrivaled backdrop for the Debaines Hotel Santiago. Situated among the city's most iconic landmarks and next to the Municipal Theater, this urban oasis seamlessly blends classic architecture with contemporary interiors.",
        "The hotel offers a unique experience that fuses Santiago's history with modern comfort, creating a sophisticated and welcoming atmosphere.",
      ],
      category: "BOUTIQUE HOTEL",
      location: "LOCATION: SANTIAGO/HISTORIC CENTER",
      distance: "NEXT TO MUNICIPAL THEATER",
      amenities: ["HISTORIC ARCHITECTURE", "CONTEMPORARY DESIGN", "RESTAURANT & BAR", "CENTRAL LOCATION"],
    },
    website: "WWW.DEBAINESHOTEL.COM",
    instagram: "@DEBAINESHOTEL",
    images: [
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/12/hotel-debaines-portada.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/12/hotel-debaines-1.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/12/hotel-debaines-2.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/12/hotel-debaines-3.webp",
    ],
    categories: ["SANTIAGO", "TODOS"],
  },
  {
    slug: "hotel-cumbres-lastarria",
    es: {
      name: "HOTEL CUMBRES LASTARRIA",
      subtitle: "CONCEPTO PREMIUM BOUTIQUE EN EL CORAZÓN DE LASTARRIA",
      description: [
        "A un costado de la Plaza Mulato Gil y a pasos del Parque Forestal y el Museo Nacional de Bellas Artes, se encuentra Hotel Cumbres Lastarria con un estilo arquitectónico contemporáneo y ecléctico que atrapa las miradas de turistas y visitantes.",
        "El hotel ofrece una experiencia premium boutique en el barrio más cultural y bohemio de Santiago, con servicios de primera clase y una ubicación privilegiada.",
      ],
      category: "HOTEL BOUTIQUE PREMIUM",
      location: "UBICACIÓN: SANTIAGO/BARRIO LASTARRIA",
      distance: "JUNTO AL PARQUE FORESTAL",
      amenities: ["DISEÑO CONTEMPORÁNEO", "UBICACIÓN CULTURAL", "RESTAURANT & BAR", "TERRAZA"],
    },
    en: {
      name: "HOTEL CUMBRES LASTARRIA",
      subtitle: "PREMIUM BOUTIQUE EXPERIENCE IN THE HEART OF LASTARRIA",
      description: [
        "Nestled alongside the iconic Plaza Mulato Gil and just steps away from Parque Forestal and the National Museum of Fine Arts, Hotel Cumbres Lastarria boasts a contemporary and eclectic architectural style that captures the attention of tourists and visitors alike.",
        "The hotel offers a premium boutique experience in Santiago's most cultural and bohemian neighborhood, with first-class services and a privileged location.",
      ],
      category: "PREMIUM BOUTIQUE HOTEL",
      location: "LOCATION: SANTIAGO/LASTARRIA DISTRICT",
      distance: "NEXT TO PARQUE FORESTAL",
      amenities: ["CONTEMPORARY DESIGN", "CULTURAL LOCATION", "RESTAURANT & BAR", "TERRACE"],
    },
    website: "WWW.HOTELCUMBRES.COM",
    instagram: "@HOTELCUMBRESLASTARRIA",
    images: [
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/10/hotel-cumbres-lastarria-portada.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/10/hotel-cumbres-lastarria-1.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/10/hotel-cumbres-lastarria-2.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/10/hotel-cumbres-lastarria3.webp",
    ],
    categories: ["SANTIAGO", "TODOS"],
  },
  {
    slug: "the-singular-santiago",
    es: {
      name: "HOTEL THE SINGULAR SANTIAGO",
      subtitle: "MÁXIMO LUJO Y ESTILO EN EL BARRIO HISTÓRICO DE SANTIAGO",
      description: [
        "Con un estilo neoclásico, en el barrio de origen de la ciudad, The Singular Santiago, Lastarria hotel fue construido como tributo al entorno cultural e histórico en el que se inserta. Su distinguida arquitectura, elegante ambientación y gastronomía sofisticada están perfectamente integradas con el patrimonio cultural del barrio.",
        "El hotel representa el máximo exponente del lujo y la sofisticación en Santiago, ofreciendo una experiencia única que combina historia, cultura y confort de primer nivel.",
      ],
      category: "HOTEL 5 ESTRELLAS LUJO",
      location: "UBICACIÓN: SANTIAGO/BARRIO LASTARRIA",
      distance: "BARRIO HISTÓRICO DE SANTIAGO",
      amenities: ["ARQUITECTURA NEOCLÁSICA", "GASTRONOMÍA SOFISTICADA", "SPA", "BAR & RESTAURANT", "LUJO MÁXIMO"],
    },
    en: {
      name: "HOTEL THE SINGULAR SANTIAGO",
      subtitle: "ULTIMATE LUXURY AND STYLE IN SANTIAGO'S HISTORIC DISTRICT",
      description: [
        "With a neoclassical style, The Singular Santiago, Lastarria Hotel, located in the city's historic neighborhood, was built as a tribute to the cultural and historical surroundings it is part of. Its distinguished architecture, elegant décor, and sophisticated gastronomy are perfectly integrated with the neighborhood's cultural heritage.",
        "The hotel represents the ultimate expression of luxury and sophistication in Santiago, offering a unique experience that combines history, culture, and first-class comfort.",
      ],
      category: "5-STAR LUXURY HOTEL",
      location: "LOCATION: SANTIAGO/LASTARRIA DISTRICT",
      distance: "SANTIAGO'S HISTORIC DISTRICT",
      amenities: [
        "NEOCLASSICAL ARCHITECTURE",
        "SOPHISTICATED GASTRONOMY",
        "SPA",
        "BAR & RESTAURANT",
        "ULTIMATE LUXURY",
      ],
    },
    website: "WWW.THESINGULAR.COM",
    instagram: "@THESINGULARSANTIAGO",
    images: [
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/hotel-the-singular-santiago-portada.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/hotel-the-singular-santiago-01.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/hotel-the-singular-santiago-02.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/hotel-the-singular-santiago-2.webp",
    ],
    categories: ["SANTIAGO", "TODOS"],
  },
  {
    slug: "wyndham-santiago-pettra",
    es: {
      name: "HOTEL WYNDHAM SANTIAGO PETTRA",
      subtitle: "PARA DISFRUTAR AL MÁXIMO",
      description: [
        "Bienvenido a Hoteles Wyndham Pettra tu destino ideal para disfrutar al máximo somos parte de Wyndham Hotels & Resorts la mayor compañía de franquicias hoteleras del mundo con presencia en Santiago Concepción y Antofagasta.",
        "Te invitamos a descansar en un tranquilo y cómodo lugar, con todas las comodidades que necesitas para una estadía perfecta en Santiago.",
      ],
      category: "HOTEL 4 ESTRELLAS",
      location: "UBICACIÓN: SANTIAGO/PROVIDENCIA",
      distance: "ZONA CÉNTRICA DE SANTIAGO",
      amenities: ["CONFORT", "UBICACIÓN ESTRATÉGICA", "RESTAURANT & BAR", "GIMNASIO"],
    },
    en: {
      name: "HOTEL WYNDHAM SANTIAGO PETTRA",
      subtitle: "FOR THE ULTIMATE EXPERIENCE",
      description: [
        "Welcome to Wyndham Pettra Hotels, your ideal destination for the ultimate experience. We are part of Wyndham Hotels & Resorts, the largest hotel franchise company in the world, with locations in Santiago, Concepción, and Antofagasta.",
        "We invite you to relax in a peaceful and comfortable setting, with all the amenities you need for a perfect stay in Santiago.",
      ],
      category: "4-STAR HOTEL",
      location: "LOCATION: SANTIAGO/PROVIDENCIA",
      distance: "CENTRAL SANTIAGO AREA",
      amenities: ["COMFORT", "STRATEGIC LOCATION", "RESTAURANT & BAR", "GYM"],
    },
    website: "WWW.WYNDHAMHOTELS.COM",
    instagram: "@WYNDHAMHOTELS",
    images: [
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/HOTEL-WYNDHAM-SANTIAGO-PETTRA-PORTADA.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/HOTEL-WYNDHAM-SANTIAGO-PETTRA1.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/HOTEL-WYNDHAM-SANTIAGO-PETTRA3.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/HOTEL-WYNDHAM-SANTIAGO-PETTRA4.webp",
    ],
    categories: ["SANTIAGO", "TODOS"],
  },
]

export function getHotelBySlug(slug: string): Hotel | undefined {
  return hotelsData.find((hotel) => hotel.slug === slug)
}

export function getHotelsByCategory(category: string): Hotel[] {
  if (category === "TODOS") return hotelsData
  return hotelsData.filter((hotel) => hotel.categories.includes(category))
}
