
"use client";

import type React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import AppLayout from '@/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, MapPin, DollarSign, ListChecks, CalendarDays, Clock } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HOURLY_RATE_CATEGORIES } from '@/lib/config';

// Import the facility data and type directly from the find-talents page
import type { SportsFacility } from '@/app/find-talents/page'; // Import type
import { dummySportsFacilities } from '@/app/find-talents/page'; // Import data


// A simple function to simulate fetching a facility by ID from the dummy data
async function getFacilityById(id: string): Promise<SportsFacility | undefined> {
  // Simulate async delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return dummySportsFacilities.find(facility => facility.id === id);
}

const FacilityDetailPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const facilityId = typeof params.id === 'string' ? params.id : undefined;

  const [facility, setFacility] = useState<SportsFacility | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (facilityId) {
      const fetchFacility = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedFacility = await getFacilityById(facilityId);
          if (fetchedFacility) {
            setFacility(fetchedFacility);
          } else {
            setError('Instalación deportiva no encontrada.');
          }
        } catch (e) {
          console.error('Error al obtener la instalación:', e);
          setError('No se pudo cargar la instalación deportiva.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchFacility();
    } else {
      setError('ID de instalación inválido.');
      setIsLoading(false);
    }
  }, [facilityId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-muted-foreground">Instalación no disponible.</p>
        <Button onClick={() => router.back()} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 md:py-8 max-w-6xl"> {/* Increased max-width */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-primary hover:text-primary/80 px-2">
        <ArrowLeft className="mr-2 h-5 w-5" />
        Volver a la búsqueda
      </Button>

      <Card className="overflow-hidden shadow-xl rounded-xl">
        <CardHeader className="p-0">
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <Image
              src={facility.image || `https://placehold.co/800x450.png`}
              alt={facility.name}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-t-xl"
              data-ai-hint={facility.dataAiHint || "sports facility"}
              priority
            />
          </AspectRatio>
        </CardHeader>

        <CardContent className="p-4 md:p-6 lg:p-8 space-y-6">
          <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{facility.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{facility.type}</CardDescription>

          <Separator />

          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 gap-y-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Location and Rate section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-semibold mb-2 text-foreground flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    Ubicación
                  </h3>
                  <p className="text-base text-foreground/80">{facility.location}</p>
                </div>
                <div>
                  <h3 className="text-md font-semibold mb-2 text-foreground flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-primary" />
                    Tarifa
                  </h3>
                  <p className="text-base text-foreground/80">
                    ${facility.rate.toLocaleString('es-CO')}
                    {HOURLY_RATE_CATEGORIES.includes('Instalación Deportiva') ? <span className="text-xs text-muted-foreground"> /hr</span> : ''}
                  </p>
                </div>
              </div>

              {/* Description */}
              {facility.description && (
                <div>
                  <h3 className="text-md font-semibold mb-2 text-foreground">Descripción</h3>
                  <p className="text-base leading-relaxed text-foreground/80">{facility.description}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Amenities */}
              {facility.amenities && facility.amenities.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-2 text-foreground flex items-center">
                    <ListChecks className="mr-2 h-5 w-5 text-primary" />
                    Comodidades
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {facility.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Separator if amenities exist before booking section */}
              {facility.amenities && facility.amenities.length > 0 && <Separator className="lg:hidden" />}


              {/* Placeholder for booking section */}
              <div className="pt-0"> {/* Removed pt-4 to rely on parent space-y */}
                 <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                    Reservar Espacio
                 </h3>
                <p className="text-muted-foreground">La funcionalidad de reserva para espacios deportivos estará disponible próximamente.</p>
                <Button className="mt-4" disabled>
                    <Clock className="mr-2 h-4 w-4" />
                    Ver Disponibilidad (Próximamente)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FacilityDetailPage = () => {
  return (
    <AppLayout>
      <FacilityDetailPageContent />
    </AppLayout>
  );
};

export default FacilityDetailPage;
