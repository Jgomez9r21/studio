/**
 * Representa un listado de servicio con detalles como descripción, tarifas y disponibilidad.
 */
export interface ServiceListing {
  /**
   * El identificador único para el listado de servicio.
   */
  id: string;
  /**
   * El título o nombre del servicio.
   */
  title: string;
  /**
   * Una descripción detallada del servicio.
   */
  description: string;
  /**
   * La tarifa por hora o fija del servicio.
   */
  rate: number;
  /**
   * Un array de horarios disponibles para reservar el servicio.
   */
  availability: string[];
  /**
   * La categoría del servicio (e.g., 'Fitness', 'Tutoría', 'Mantenimiento del Hogar').
   */
  category: string;
  /**
   * La ubicación donde se provee el servicio.
   */
  location: string;
  /**
   * Optional URL for the service image.
   */
  imageUrl?: string;
  /**
   * Optional array of URLs for a service image carousel.
   */
  imageUrls?: string[];
  /**
   * Optional text or link to the service policy.
   */
  policyText?: string;
   /**
    * Optional name of the professional offering the service.
    */
   professionalName?: string;
   /**
    * Optional avatar URL for the professional offering the service.
    */
   professionalAvatar?: string;
}

/**
 * Asynchronously retrieves service listings based on specified criteria.
 *
 * @param category Optional category to filter service listings.
 * @param location Optional location to filter service listings.
 * @returns A promise that resolves to an array of ServiceListing objects.
 */
export async function getServiceListings(category?: string, location?: string): Promise<ServiceListing[]> {
  // TODO: Implement this by calling an external API.
  // Placeholder data, including new categories and imageUrl
  return [
    {
      id: '1',
      title: 'Entrenamiento Fitness Personalizado',
      description: 'Sesiones de entrenamiento personalizadas para ayudarte a alcanzar tus metas de fitness. Planes adaptados a tus necesidades y nivel, con seguimiento constante para maximizar resultados.',
      rate: 50,
      availability: ['Lunes 9:00-10:00', 'Miércoles 18:00-19:00', 'Viernes 9:00-10:00'],
      category: 'Instalación Deportiva', // Changed from 'Deporte'
      location: 'Gimnasio Local Central',
      imageUrl: 'https://picsum.photos/800/600?random=1', // Added placeholder image URL
      imageUrls: [
        'https://picsum.photos/800/600?random=11',
        'https://picsum.photos/800/600?random=12',
        'https://picsum.photos/800/600?random=13',
      ],
      policyText: "Al reservar este servicio, aceptas nuestra política de cancelación con 24 horas de antelación. Las ausencias sin previo aviso no serán reembolsables.",
      professionalName: "Ana García", // Added professional name
      professionalAvatar: "https://picsum.photos/50/50?random=prof-1", // Added professional avatar
    },
    {
      id: '2',
      title: 'Desarrollo Web Frontend',
      description: 'Creación de interfaces de usuario interactivas y responsivas para tu sitio web. Utilizamos las últimas tecnologías para asegurar una experiencia de usuario óptima en todos los dispositivos.',
      rate: 75,
      availability: ['Martes 14:00-16:00', 'Jueves 10:00-12:00'],
      category: 'Tecnología',
      location: 'Remoto',
      imageUrl: 'https://picsum.photos/800/600?random=2', // Added placeholder image URL
      imageUrls: [
        'https://picsum.photos/800/600?random=21',
        'https://picsum.photos/800/600?random=22',
      ],
      policyText: "Todos los proyectos de desarrollo web requieren un depósito inicial del 50%. El saldo restante se abona al finalizar y entregar el proyecto.",
      professionalName: "Carlos Rodriguez",
      professionalAvatar: "https://picsum.photos/50/50?random=prof-2",
    },
     {
      id: '3',
      title: 'Entrenador Personal de Boxeo',
      description: 'Clases de boxeo para todos los niveles, mejora tu técnica y condición física. Entrenamientos dinámicos y personalizados para quemar calorías y ganar fuerza.',
      rate: 60,
      availability: ['Lunes 17:00-18:00', 'Viernes 8:00-9:00', 'Sábado 11:00-12:00'],
      category: 'Entrenador Personal',
      location: 'Club de Boxeo Central',
      imageUrl: 'https://picsum.photos/800/600?random=3', // Added placeholder image URL
      imageUrls: [
         'https://picsum.photos/800/600?random=31',
      ],
      policyText: "Es obligatorio el uso de guantes y vendas propias por higiene y seguridad. Consulta nuestras opciones de alquiler si es necesario.",
      professionalName: "Miguel López",
      professionalAvatar: "https://picsum.photos/50/50?random=prof-3",
    },
    {
      id: '4',
      title: 'Servicios de Contratista General',
      description: 'Remodelaciones, reparaciones y construcciones menores para tu hogar o negocio. Contamos con un equipo de profesionales para garantizar trabajos de calidad.',
      rate: 80, // Assuming a project-based or higher hourly rate
      availability: ['Lunes a Viernes 8:00-17:00'],
      category: 'Contratista',
      location: 'Área Metropolitana',
      imageUrl: 'https://picsum.photos/800/600?random=4', // Added placeholder image URL
      policyText: "Todos los presupuestos son gratuitos y sin compromiso. Los materiales no están incluidos en la tarifa horaria a menos que se especifique.",
       professionalName: "Javier Construcciones",
       professionalAvatar: "https://picsum.photos/50/50?random=prof-4",
    },
    {
      id: '5',
      title: 'Mantenimiento y Reparación del Hogar',
      description: 'Servicios de plomería, electricidad, pintura y reparaciones generales. Soluciones rápidas y eficientes para mantener tu hogar en perfectas condiciones.',
      rate: 55,
      availability: ['Miércoles 9:00-12:00', 'Sábado 10:00-14:00'],
      category: 'Mantenimiento Hogar',
      location: 'Ciudad',
      imageUrl: 'https://picsum.photos/800/600?random=5', // Added placeholder image URL
      policyText: "Garantía de 30 días en todas las reparaciones realizadas. Las visitas de emergencia fuera de horario pueden tener un costo adicional.",
       professionalName: "Repara Hogar Rápido",
       professionalAvatar: "https://picsum.photos/50/50?random=prof-5",
    },
    {
      id: '6',
      title: 'Clases Particulares de Matemáticas',
      description: 'Apoyo escolar y preparación para exámenes de matemáticas, nivel secundario y universitario. Metodología adaptada al ritmo de aprendizaje de cada estudiante.',
      rate: 40,
      availability: ['Martes 16:00-18:00', 'Jueves 17:00-19:00'],
      category: 'Profesores',
      location: 'Online o Presencial',
      imageUrl: 'https://picsum.photos/800/600?random=6', // Added placeholder image URL
      policyText: "Se requiere el pago por adelantado de paquetes de clases. Las cancelaciones deben realizarse con al menos 12 horas de anticipación.",
       professionalName: "Elena Martínez",
       professionalAvatar: "https://picsum.photos/50/50?random=prof-6",
    },
     {
      id: '7',
      title: 'Diseño Gráfico y Branding',
      description: 'Creación de logotipos, identidad visual, materiales de marketing y más. Ayudamos a tu marca a destacar con diseños creativos y profesionales.',
      rate: 65,
      availability: ['Lunes 10:00-13:00', 'Miércoles 14:00-17:00'],
      category: 'Diseñadores',
      location: 'Remoto',
      imageUrl: 'https://picsum.photos/800/600?random=7', // Added placeholder image URL
      imageUrls: [
        'https://picsum.photos/800/600?random=71',
        'https://picsum.photos/800/600?random=72',
        'https://picsum.photos/800/600?random=73',
        'https://picsum.photos/800/600?random=74',
      ],
      policyText: "Cada proyecto incluye hasta 2 rondas de revisión. Revisiones adicionales pueden incurrir en costos extra.",
       professionalName: "Sofía Creativa",
       professionalAvatar: "https://picsum.photos/50/50?random=prof-7",
    },
     {
      id: '8',
      title: 'Marketing Digital Estratégico',
      description: 'Gestión de redes sociales, SEO, SEM y campañas de email marketing. Impulsa tu presencia online y alcanza tus objetivos de negocio.',
      rate: 70,
      availability: ['Consultar disponibilidad'],
      category: 'Marketing Digital',
      location: 'Remoto',
      imageUrl: 'https://picsum.photos/800/600?random=8', // Added placeholder image URL
      policyText: "Los resultados de las campañas de marketing pueden variar. Se requiere un compromiso mínimo de 3 meses para servicios de SEO.",
       professionalName: "Impulso Digital Co",
       professionalAvatar: "https://picsum.photos/50/50?random=prof-8",
    },
     {
        id: '9',
        title: 'Reserva de Cancha de Fútbol 5',
        description: 'Alquila una cancha de césped sintético para tu partido con amigos. Instalaciones de primera calidad con iluminación y vestuarios.',
        rate: 45,
        availability: ['Martes 20:00-21:00', 'Jueves 21:00-22:00', 'Sábado 16:00-17:00'],
        category: 'Instalación Deportiva',
        location: 'Complejo Deportivo Norte',
        imageUrl: 'https://picsum.photos/800/600?random=9', // Added placeholder image URL
        imageUrls: [
            'https://picsum.photos/800/600?random=91',
            'https://picsum.photos/800/600?random=92',
        ],
        policyText: "El alquiler de la cancha es por hora. Se debe abonar el total al momento de la reserva. No se permiten botines con tapones de metal.",
        // No specific professional for facility booking, but could be facility name
         professionalName: "Complejo Deportivo Norte",
         professionalAvatar: "https://picsum.photos/50/50?random=prof-9",
     },
    // Add more listings for other categories as needed
  ];
}

// New function to get a service by ID
export async function getServiceById(id: string): Promise<ServiceListing | undefined> {
  const listings = await getServiceListings(); // Reuse existing function
  return listings.find(listing => listing.id === id);
}
