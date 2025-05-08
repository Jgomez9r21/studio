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
      description: 'Sesiones de entrenamiento personalizadas para ayudarte a alcanzar tus metas de fitness.',
      rate: 50,
      availability: ['Lunes 9:00-10:00', 'Miércoles 18:00-19:00'],
      category: 'Instalación Deportiva', // Changed from 'Deporte'
      location: 'Gimnasio Local',
      imageUrl: 'https://picsum.photos/400/300?random=1' // Added placeholder image URL
    },
    {
      id: '2',
      title: 'Desarrollo Web Frontend',
      description: 'Creación de interfaces de usuario interactivas y responsivas para tu sitio web.',
      rate: 75,
      availability: ['Martes 14:00-16:00', 'Jueves 10:00-12:00'],
      category: 'Tecnología',
      location: 'Remoto',
      imageUrl: 'https://picsum.photos/400/300?random=2' // Added placeholder image URL
    },
     {
      id: '3',
      title: 'Entrenador Personal de Boxeo',
      description: 'Clases de boxeo para todos los niveles, mejora tu técnica y condición física.',
      rate: 60,
      availability: ['Lunes 17:00-18:00', 'Viernes 8:00-9:00'],
      category: 'Entrenador Personal',
      location: 'Club de Boxeo Central',
      imageUrl: 'https://picsum.photos/400/300?random=3' // Added placeholder image URL
    },
    {
      id: '4',
      title: 'Servicios de Contratista General',
      description: 'Remodelaciones, reparaciones y construcciones menores para tu hogar o negocio.',
      rate: 80, // Assuming a project-based or higher hourly rate
      availability: ['Lunes a Viernes 8:00-17:00'],
      category: 'Contratista',
      location: 'Área Metropolitana',
      imageUrl: 'https://picsum.photos/400/300?random=4' // Added placeholder image URL
    },
    {
      id: '5',
      title: 'Mantenimiento y Reparación del Hogar',
      description: 'Servicios de plomería, electricidad, pintura y reparaciones generales.',
      rate: 55,
      availability: ['Miércoles 9:00-12:00', 'Sábado 10:00-14:00'],
      category: 'Mantenimiento Hogar',
      location: 'Ciudad',
      imageUrl: 'https://picsum.photos/400/300?random=5' // Added placeholder image URL
    },
    {
      id: '6',
      title: 'Clases Particulares de Matemáticas',
      description: 'Apoyo escolar y preparación para exámenes de matemáticas, nivel secundario y universitario.',
      rate: 40,
      availability: ['Martes 16:00-18:00', 'Jueves 17:00-19:00'],
      category: 'Profesores',
      location: 'Online o Presencial',
      imageUrl: 'https://picsum.photos/400/300?random=6' // Added placeholder image URL
    },
     {
      id: '7',
      title: 'Diseño Gráfico y Branding',
      description: 'Creación de logotipos, identidad visual, materiales de marketing y más.',
      rate: 65,
      availability: ['Lunes 10:00-13:00', 'Miércoles 14:00-17:00'],
      category: 'Diseñadores',
      location: 'Remoto',
      imageUrl: 'https://picsum.photos/400/300?random=7' // Added placeholder image URL
    },
     {
      id: '8',
      title: 'Marketing Digital Estratégico',
      description: 'Gestión de redes sociales, SEO, SEM y campañas de email marketing.',
      rate: 70,
      availability: ['Consultar disponibilidad'],
      category: 'Marketing Digital',
      location: 'Remoto',
      imageUrl: 'https://picsum.photos/400/300?random=8' // Added placeholder image URL
    },
     {
        id: '9',
        title: 'Reserva de Cancha de Fútbol 5',
        description: 'Alquila una cancha de césped sintético para tu partido con amigos.',
        rate: 45,
        availability: ['Martes 20:00-21:00', 'Jueves 21:00-22:00', 'Sábado 16:00-17:00'],
        category: 'Instalación Deportiva',
        location: 'Complejo Deportivo Norte',
        imageUrl: 'https://picsum.photos/400/300?random=9' // Added placeholder image URL
     },
    // Add more listings for other categories as needed
  ];
}