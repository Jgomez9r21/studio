
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
   /**
    * Optional rating of the service, typically out of 5.
    */
   rating?: number;
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
      id: '2',
      title: 'Desarrollo Web Frontend',
      description: 'Creación de interfaces de usuario interactivas y responsivas para tu sitio web. Utilizamos las últimas tecnologías para asegurar una experiencia de usuario óptima en todos los dispositivos.',
      rate: 75000, // Adjusted rate to COP
      availability: ['Lunes a Viernes 09:00-12:00', 'Lunes a Viernes 14:00-18:00', 'Sábado 10:00-14:00'],
      category: 'Tecnología',
      location: 'Remoto',
      imageUrl: 'https://placehold.co/800x600.png',
      imageUrls: [
        'https://placehold.co/800x600.png',
        'https://placehold.co/800x600.png',
      ],
      policyText: "Todos los proyectos de desarrollo web requieren un depósito inicial del 50%. El saldo restante se abona al finalizar y entregar el proyecto.",
      professionalName: "Carlos Rodriguez",
      professionalAvatar: "https://placehold.co/50x50.png",
      rating: 4.7,
    },
     {
      id: '3',
      title: 'Entrenador Personal de Boxeo',
      description: 'Clases de boxeo para todos los niveles, mejora tu técnica y condición física. Entrenamientos dinámicos y personalizados para quemar calorías y ganar fuerza.',
      rate: 60000, // Adjusted rate to COP
      availability: ['Lunes 17:00-18:00', 'Viernes 8:00-9:00', 'Sábado 11:00-12:00'],
      category: 'Entrenador Personal',
      location: 'Club de Boxeo Central, Bogotá, Colombia',
      imageUrl: 'https://placehold.co/800x600.png',
      imageUrls: [
         'https://placehold.co/800x600.png',
      ],
      policyText: "Es obligatorio el uso de guantes y vendas propias por higiene y seguridad. Consulta nuestras opciones de alquiler si es necesario.",
      professionalName: "Miguel López",
      professionalAvatar: "https://placehold.co/50x50.png",
      rating: 4.8,
    },
    {
      id: '4',
      title: 'Servicios de Contratista General',
      description: 'Remodelaciones, reparaciones y construcciones menores para tu hogar o negocio. Contamos con un equipo de profesionales para garantizar trabajos de calidad.',
      rate: 80000, // Adjusted rate to COP
      availability: ['Lunes a Viernes 8:00-17:00'],
      category: 'Contratista',
      location: 'Bogotá y Alrededores, Colombia',
      imageUrl: 'https://placehold.co/800x600.png',
      policyText: "Todos los presupuestos son gratuitos y sin compromiso. Los materiales no están incluidos en la tarifa horaria a menos que se especifique.",
       professionalName: "Javier Construcciones",
       professionalAvatar: "https://placehold.co/50x50.png",
       rating: 4.5,
    },
    {
      id: '5',
      title: 'Mantenimiento y Reparación del Hogar',
      description: 'Servicios de plomería, electricidad, pintura y reparaciones generales. Soluciones rápidas y eficientes para mantener tu hogar en perfectas condiciones.',
      rate: 55000, // Adjusted rate to COP
      availability: ['Miércoles 9:00-12:00', 'Sábado 10:00-14:00'],
      category: 'Mantenimiento Hogar',
      location: 'Bogotá, Colombia',
      imageUrl: 'https://placehold.co/800x600.png',
      policyText: "Garantía de 30 días en todas las reparaciones realizadas. Las visitas de emergencia fuera de horario pueden tener un costo adicional.",
       professionalName: "Repara Hogar Rápido",
       professionalAvatar: "https://placehold.co/50x50.png",
       rating: 4.6,
    },
    {
      id: '6',
      title: 'Clases Particulares de Matemáticas',
      description: 'Apoyo escolar y preparación para exámenes de matemáticas, nivel secundario y universitario. Metodología adaptada al ritmo de aprendizaje de cada estudiante.',
      rate: 40000, // Adjusted rate to COP
      availability: ['Martes 16:00-18:00', 'Jueves 17:00-19:00'],
      category: 'Profesores',
      location: 'Remoto',
      imageUrl: 'https://placehold.co/800x600.png',
      policyText: "Se requiere el pago por adelantado de paquetes de clases. Las cancelaciones deben realizarse con al menos 12 horas de anticipación.",
       professionalName: "Elena Martínez",
       professionalAvatar: "https://placehold.co/50x50.png",
       rating: 4.9,
    },
     {
      id: '7',
      title: 'Diseño Gráfico y Branding',
      description: 'Creación de logotipos, identidad visual, materiales de marketing y más. Ayudamos a tu marca a destacar con diseños creativos y profesionales.',
      rate: 65000, // Adjusted rate to COP
      availability: ['Lunes 10:00-13:00', 'Miércoles 14:00-17:00'],
      category: 'Diseñadores',
      location: 'Remoto',
      imageUrl: 'https://placehold.co/800x600.png',
      imageUrls: [
        'https://placehold.co/800x600.png',
        'https://placehold.co/800x600.png',
        'https://placehold.co/800x600.png',
        'https://placehold.co/800x600.png',
      ],
      policyText: "Cada proyecto incluye hasta 2 rondas de revisión. Revisiones adicionales pueden incurrir en costos extra.",
       professionalName: "Sofía Creativa",
       professionalAvatar: "https://placehold.co/50x50.png",
       rating: 5.0,
    },
     {
      id: '8',
      title: 'Marketing Digital Estratégico',
      description: 'Gestión de redes sociales, SEO, SEM y campañas de email marketing. Impulsa tu presencia online y alcanza tus objetivos de negocio.',
      rate: 70000, // Adjusted rate to COP
      availability: ['Consultar disponibilidad'],
      category: 'Marketing Digital',
      location: 'Remoto',
      imageUrl: 'https://placehold.co/800x600.png',
      policyText: "Los resultados de las campañas de marketing pueden variar. Se requiere un compromiso mínimo de 3 meses para servicios de SEO.",
       professionalName: "Impulso Digital Co",
       professionalAvatar: "https://placehold.co/50x50.png",
       rating: 4.3,
    },
  ];
}

// New function to get a service by ID
export async function getServiceById(id: string): Promise<ServiceListing | undefined> {
  const listings = await getServiceListings(); // Reuse existing function
  return listings.find(listing => listing.id === id);
}
