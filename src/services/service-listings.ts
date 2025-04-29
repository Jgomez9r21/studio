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
  return [
    {
      id: '1',
      title: 'Fitness Training',
      description: 'Personalized fitness training sessions to help you achieve your goals.',
      rate: 50,
      availability: ['Monday 9:00-10:00', 'Wednesday 18:00-19:00'],
      category: 'Fitness',
      location: 'Anywhere'
    },
    {
      id: '2',
      title: 'Web Development',
      description: 'Custom web development services to create your online presence.',
      rate: 75,
      availability: ['Tuesday 14:00-16:00', 'Thursday 10:00-12:00'],
      category: 'Technology',
      location: 'Anywhere'
    },
  ];
}
