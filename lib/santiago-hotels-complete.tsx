export interface HotelData {
  id: number;
  slug: string;
  es: {
    name: string;
    subtitle: string;
    excerpt: string;
    fullContent: string;
    categories: string[];
  };
  en: {
    name: string;
    subtitle: string;
    excerpt: string;
    fullContent: string;
    categories: string[];
  };
  featuredImage: string;
  galleryImages: string[];
  website?: string;
  instagram?: string;
  location?: string;
  rating?: string;
}

export const santiagoHotelsComplete: HotelData[] = [
  {
    id: 6410,
    slug: "wyndham-santiago-pettra",
    es: {
      name: "HOTEL WYNDHAM SANTIAGO PETTRA",
      subtitle: "PARA DISFRUTAR AL MAXIMO",
      excerpt:
        "Bienvenido a Hoteles Wyndham Pettra tu destino ideal para disfrutar al máximo somos parte de Wyndham Hotels & Resorts la mayor compañía de franquicias hoteleras del mundo con presencia en Santiago Concepción y Antofagasta.",
      fullContent: `
        <p>Bienvenido a Hoteles Wyndham Pettra tu destino ideal para disfrutar al máximo somos parte de Wyndham Hotels & Resorts la mayor compañía de franquicias hoteleras del mundo con presencia en Santiago Concepción y Antofagasta.</p>

        <p>Te invitamos a descansar en un tranquilo y cómodo lugar en la zona nororiente de la ciudad en el exclusivo barrio Lo Barnechea. El hotel ofrece excelente conectividad con las zonas turísticas está cerca de los mejores centros de ski del país y se ubica frente al centro comercial Portal La Dehesa.</p>

        <p>Nuestro hotel cuenta con 105 habitaciones y suites amplias terrazas un wine bar un spa con piscina temperada interior una piscina exterior un gimnasio y el prestigioso restaurante Malakita que ofrece cocina tradicional chilena.</p>

        <p>También puedes planificar una reunión o celebración en nuestras salas de eventos que pueden acomodar hasta 200 personas. Nuestro personal está disponible 24/7 para brindarte el mejor servicio y hospitalidad durante tu estadía.</p>

        <h3>Restaurante Malakita</h3>
        <p>Desayuno buffet de 6:30 AM</p>
        <p>Room Service: servicio 24 horas</p>
        <p>El restaurante ofrece un menú variado que incluye un Menú Ejecutivo de lunes a martes con 3 opciones de entradas platos principales y postres y After Office con buffet de snacks fríos y calientes todos los martes y jueves.</p>
        <p>Los miércoles disfruta de la Cena del Chef para grupos de 6 a 10 personas.</p>

        <h3>Gimnasio</h3>
        <p>Horario de funcionamiento: 8:00 AM a 9:00 PM de lunes a viernes 9:00 AM a 9:00 PM los sábados y 10:00 AM a 6:00 PM los domingos y festivos.</p>
        <p>Ideal para ejercicios de cardio en un ambiente cálido y tranquilo.</p>

        <h3>Piscinas Interior y Exterior</h3>
        <p>Piscina temperada interior. Horario de funcionamiento: 8:00 AM a 9:00 PM de lunes a viernes 9:00 AM a 9:00 PM los sábados y 10:00 AM a 6:00 PM los domingos y festivos.</p>
        <p>Piscina exterior. Horario de funcionamiento: 8:00 AM a 9:00 PM de lunes a viernes 9:00 AM a 9:00 PM los sábados y 10:00 AM a 6:00 PM los domingos y festivos.</p>

        <h3>Spa</h3>
        <p>Abierto diariamente de 8:00 AM a 8:00 PM. Relájate en el circuito de piscinas sauna y circuito de vapor disfruta de un masaje relajante o experimenta la terapia de cápsulas Cocoon Pro basada en calor piedras de jade y luz infrarroja que proporciona drenaje automático a tu cuerpo. Los tratamientos de belleza incluyen tratamientos faciales y corporales con tecnología LPG.</p>

        <h3>Reuniones y Eventos</h3>
        <p>El hotel ofrece 4 salas de eventos espaciosas y completamente equipadas con capacidad audiovisual para hasta 200 personas. Para reuniones más privadas también disponemos de una sala de juntas.</p>

        <p><a href="https://www.wyndhampettra.com" target="_blank" rel="noopener">WWW.WYNDHAMPETTRA.COM</a></p>
        <p>@WYNDHAMPETTRA</p>

        <p>5-STAR HOTEL</p>
        <p>UBICACIÓN: SANTIAGO CHILE 34 MINUTOS EN AUTO DESDE EL AEROPUERTO DE SANTIAGO</p>
        <p>1 HORA EN AUTO DESDE EL HOTEL A LOS PRINCIPALES CENTROS DE SKI</p>
        <p>FULL SPA</p>
        <p>RESTAURANTE & BAR</p>
      `,
      categories: ["TODOS", "SANTIAGO"],
    },
    en: {
      name: "HOTEL WYNDHAM SANTIAGO PETTRA",
      subtitle: "FOR THE ULTIMATE EXPERIENCE",
      excerpt:
        "Welcome to Wyndham Pettra Hotels, your ideal destination for maximum enjoyment. We are part of Wyndham Hotels & Resorts, the world's largest hotel franchise company, with locations in Santiago, Concepción, and Antofagasta.",
      fullContent: `
        <p>Welcome to Wyndham Pettra Hotels, your ideal destination for maximum enjoyment. We are part of Wyndham Hotels & Resorts, the world's largest hotel franchise company, with locations in Santiago, Concepción, and Antofagasta.</p>

        <p>We invite you to relax in a peaceful and comfortable setting in the northeastern part of the city, in the exclusive Lo Barnechea neighborhood. The hotel offers excellent connectivity to tourist areas, is close to the best ski resorts in the country, and is located opposite the Portal La Dehesa shopping center.</p>

        <p>Our hotel features 105 rooms and suites, spacious terraces, a wine bar, a spa with a heated indoor pool, an outdoor pool, a gym, and the prestigious Malakita restaurant, offering traditional Chilean cuisine.</p>

        <p>You can also plan a meeting or celebration in our event rooms, which can accommodate up to 200 people. Our staff is available 24/7 to provide you with the best service and hospitality during your stay.</p>

        <h3>Malakita Restaurant</h3>
        <p>Buffet breakfast from 6:30 AM</p>
        <p>Room Service: 24-hour service</p>
        <p>The restaurant offers a varied menu, including an Executive Menu from Monday to Tuesday with 3 choices of starters, main courses, and desserts, and After Office with a buffet of cold and hot snacks every Tuesday and Thursday.</p>
        <p>On Wednesdays, enjoy the Chef's Dinner for groups of 6 to 10 people.</p>

        <h3>Gym</h3>
        <p>Operating hours: 8:00 AM to 9:00 PM from Monday to Friday, 9:00 AM to 9:00 PM on Saturdays, and 10:00 AM to 6:00 PM on Sundays and holidays.</p>
        <p>Ideal for cardio exercises in a warm and peaceful environment.</p>

        <h3>Indoor and Outdoor Pools</h3>
        <p>Heated indoor pool. Operating hours: 8:00 AM to 9:00 PM from Monday to Friday, 9:00 AM to 9:00 PM on Saturdays, and 10:00 AM to 6:00 PM on Sundays and holidays.</p>
        <p>Outdoor pool. Operating hours: 8:00 AM to 9:00 PM from Monday to Friday, 9:00 AM to 9:00 PM on Saturdays, and 10:00 AM to 6:00 PM on Sundays and holidays.</p>

        <h3>Spa</h3>
        <p>Open daily from 8:00 AM to 8:00 PM. Relax in the pool circuit, sauna, and steam circuit, enjoy a relaxing massage, or experience the Cocoon Pro capsule therapy based on heat, jade stones, and infrared light, providing automatic drainage. Beauty treatments include facial and body treatments with LPG technology.</p>

        <h3>Meetings and Events</h3>
        <p>The hotel offers 4 spacious and fully equipped event rooms with audiovisual capacity for up to 200 people. For more private meetings, we also have a boardroom.</p>



        <p><a href="https://www.wyndhampettra.com" target="_blank" rel="noopener">WWW.WYNDHAMPETTRA.COM</a></p>
        <p>@WYNDHAMPETTRA</p>

        <p>5-STAR HOTEL</p>
        <p>LOCATION: SANTIAGO, CHILE 34 MINUTES BY CAR FROM SANTIAGO AIRPORT</p>
        <p>1 HOUR BY CAR FROM THE HOTEL TO THE MAIN SKI RESORTS</p>
        <p>FULL SPA</p>
        <p>RESTAURANT & BAR</p>
      `,
      categories: ["ALL", "SANTIAGO"],
    },
    featuredImage:
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/HOTEL-WYNDHAM-SANTIAGO-PETTRA-PORTADA.webp",
    galleryImages: [
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/HOTEL-WYNDHAM-SANTIAGO-PETTRA1.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/HOTEL-WYNDHAM-SANTIAGO-PETTRA3.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/HOTEL-WYNDHAM-SANTIAGO-PETTRA4.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/HOTEL-WYNDHAM-SANTIAGO-PETTRA5.webp",
      "https://mistyrose-alligator-301884.hostingersite.com/wp-content/uploads/2024/09/HOTEL-WYNDHAM-SANTIAGO-PETTRA6.webp",
    ],
    website: "WWW.WYNDHAMPETTRA.COM",
    instagram: "@WYNDHAMPETTRA",
    location: "SANTIAGO, CHILE",
    rating: "5-STAR HOTEL",
  },
];

export function getHotelBySlug(slug: string): HotelData | undefined {
  return santiagoHotelsComplete.find((hotel) => hotel.slug === slug);
}
