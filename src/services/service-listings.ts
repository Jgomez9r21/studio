/**
 * Represents a service listing with details like description, rates, and availability.
 */
export interface ServiceListing {
  /**
   * The unique identifier for the service listing.
   */
  id: string;
  /**
   * The title or name of the service.
   */
  title: string;
  /**
   * A detailed description of the service.
   */
  description: string;
  /**
   * The hourly or fixed rate for the service.
   */
  rate: number;
  /**
   * An array of available time slots for booking the service.
   */
  availability: string[];
  /**
   * The category of the service (e.g., 'Fitness', 'Tutoring', 'Home Maintenance').
   */
  category: string;
  /**
   * The location where the service is provided.
   */
  location: string;
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
  // Placeholder data, including new categories
  return [
    {
      id: '1',
      title: 'Entrenamiento Fitness Personalizado',
      description: 'Sesiones de entrenamiento personalizadas para ayudarte a alcanzar tus metas de fitness.',
      rate: 50,
      availability: ['Lunes 9:00-10:00', 'Miércoles 18:00-19:00'],
      category: 'Reserva Deportiva', // Changed from 'Deporte'
      location: 'Gimnasio Local'
    },
    {
      id: '2',
      title: 'Desarrollo Web Frontend',
      description: 'Creación de interfaces de usuario interactivas y responsivas para tu sitio web.',
      rate: 75,
      availability: ['Martes 14:00-16:00', 'Jueves 10:00-12:00'],
      category: 'Tecnología',
      location: 'Remoto'
    },
     {
      id: '3',
      title: 'Entrenador Personal de Boxeo',
      description: 'Clases de boxeo para todos los niveles, mejora tu técnica y condición física.',
      rate: 60,
      availability: ['Lunes 17:00-18:00', 'Viernes 8:00-9:00'],
      category: 'Entrenador Personal',
      location: 'Club de Boxeo Central'
    },
    {
      id: '4',
      title: 'Servicios de Contratista General',
      description: 'Remodelaciones, reparaciones y construcciones menores para tu hogar o negocio.',
      rate: 80, // Assuming a project-based or higher hourly rate
      availability: ['Lunes a Viernes 8:00-17:00'],
      category: 'Contratista',
      location: 'Área Metropolitana'
    },
    {
      id: '5',
      title: 'Mantenimiento y Reparación del Hogar',
      description: 'Servicios de plomería, electricidad, pintura y reparaciones generales.',
      rate: 55,
      availability: ['Miércoles 9:00-12:00', 'Sábado 10:00-14:00'],
      category: 'Mantenimiento Hogar',
      location: 'Ciudad'
    },
    {
      id: '6',
      title: 'Clases Particulares de Matemáticas',
      description: 'Apoyo escolar y preparación para exámenes de matemáticas, nivel secundario y universitario.',
      rate: 40,
      availability: ['Martes 16:00-18:00', 'Jueves 17:00-19:00'],
      category: 'Profesores',
      location: 'Online o Presencial'
    },
     {
      id: '7',
      title: 'Diseño Gráfico y Branding',
      description: 'Creación de logotipos, identidad visual, materiales de marketing y más.',
      rate: 65,
      availability: ['Lunes 10:00-13:00', 'Miércoles 14:00-17:00'],
      category: 'Diseñadores',
      location: 'Remoto'
    },
     {
      id: '8',
      title: 'Marketing Digital Estratégico',
      description: 'Gestión de redes sociales, SEO, SEM y campañas de email marketing.',
      rate: 70,
      availability: ['Consultar disponibilidad'],
      category: 'Marketing Digital',
      location: 'Remoto'
    },
     {
        id: '9',
        title: 'Reserva de Cancha de Fútbol 5',
        description: 'Alquila una cancha de césped sintético para tu partido con amigos.',
        rate: 45,
        availability: ['Martes 20:00-21:00', 'Jueves 21:00-22:00', 'Sábado 16:00-17:00'],
        category: 'Reserva Deportiva',
        location: 'Complejo Deportivo Norte'
     },
    // Add more listings for other categories as needed
  ];
}
