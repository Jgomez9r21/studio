"use client";

import type React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  getServiceById,
  type ServiceListing,
} from '@/services/service-listings';
import AppLayout from '@/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, MapPin, CalendarDays, Clock, Info, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils'; // Import cn utility

const ServiceDetailPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isLoggedIn, user, openLoginDialog } = useAuth();

  const serviceId = typeof params.id === 'string' ? params.id : undefined;

  const [service, setService] = useState<ServiceListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>();
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false); // State for description expansion

  useEffect(() => {
    if (serviceId) {
      const fetchService = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedService = await getServiceById(serviceId);
          if (fetchedService) {
            setService(fetchedService);
            // Add professional name placeholder to the fetched service
            const serviceWithProfessional = {
                ...fetchedService,
                professionalName: fetchedService.professionalName || `Profesional de ${fetchedService.category}`, // Add placeholder
                professionalAvatar: fetchedService.professionalAvatar || `https://picsum.photos/50/50?random=prof-${fetchedService.id}` // Placeholder avatar
            };
            setService(serviceWithProfessional);
            setAvailableTimeSlots(fetchedService.availability || []);
          } else {
            setError('Servicio no encontrado.');
          }
        } catch (e) {
          console.error('Error al obtener el servicio:', e);
          setError('No se pudo cargar el servicio.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchService();
    } else {
      setError('ID de servicio inválido.');
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (service && selectedDate) {
      // Placeholder: In a real app, filter service.availability based on selectedDate
      // For now, we assume all listed slots are for any selected date.
      setAvailableTimeSlots(service.availability || []);
      setSelectedTimeSlot(undefined);
    }
  }, [service, selectedDate]);

  const handleBooking = () => {
    if (!isLoggedIn) {
      toast({
        title: 'Inicio de Sesión Requerido',
        description: 'Debes iniciar sesión para reservar un servicio.',
        variant: 'destructive',
      });
      openLoginDialog();
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      toast({
        title: 'Información Incompleta',
        description: 'Por favor, selecciona una fecha y hora.',
        variant: 'destructive',
      });
      return;
    }
    if (!policyAccepted && service?.policyText) { // Only require policy if it exists
      toast({
        title: 'Política no Aceptada',
        description: 'Debes aceptar la política de servicio.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Booking details:', {
      serviceId: service?.id,
      serviceTitle: service?.title,
      date: selectedDate ? format(selectedDate, "PPP", { locale: es }) : 'N/A',
      time: selectedTimeSlot,
      user: user?.email,
    });
    toast({
      title: 'Reserva Solicitada',
      description: `Tu solicitud para "${service?.title}" el ${selectedDate ? format(selectedDate, "PPP", { locale: es }) : ''} a las ${selectedTimeSlot} ha sido enviada.`,
    });
    // Consider redirecting or showing a success message confirmation state
    // router.push('/book-service');
  };

  const currentYear = new Date().getFullYear();

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

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-muted-foreground">Servicio no disponible.</p>
         <Button onClick={() => router.back()} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  const imagesToShow = service.imageUrls && service.imageUrls.length > 0 ? service.imageUrls : (service.imageUrl ? [service.imageUrl] : []);


  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 md:py-8 max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-primary hover:text-primary/80 px-2">
        <ArrowLeft className="mr-2 h-5 w-5" />
        Volver a la búsqueda
      </Button>

      <Card className="overflow-hidden shadow-xl rounded-xl">
        <CardHeader className="p-0">
          {/* Image Carousel */}
          {imagesToShow.length > 0 ? (
            <Carousel
              opts={{ loop: imagesToShow.length > 1 }}
              className="w-full rounded-t-xl overflow-hidden"
            >
              <CarouselContent>
                {imagesToShow.map((imgUrl, index) => (
                  <CarouselItem key={index}>
                    <AspectRatio ratio={16 / 9} className="bg-muted">
                      <Image
                        src={imgUrl}
                        alt={`${service.title} - imagen ${index + 1}`}
                        fill // Use fill instead of layout="fill"
                        style={{ objectFit: "cover" }} // Use style object for objectFit
                        className="rounded-t-xl"
                        data-ai-hint={`service image ${index + 1}`}
                        priority={index === 0} // Prioritize loading the first image
                      />
                    </AspectRatio>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {imagesToShow.length > 1 && (
                <>
                  <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background text-foreground" />
                  <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background text-foreground" />
                </>
              )}
            </Carousel>
          ) : (
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-t-xl">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Imagen no disponible
              </div>
            </AspectRatio>
          )}
        </CardHeader>

        <CardContent className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Service Title */}
          <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{service.title}</CardTitle>

          {/* Professional Info */}
          <div className="flex items-center gap-3 pt-2">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={service.professionalAvatar} alt={service.professionalName || 'Profesional'} data-ai-hint="professional avatar" />
              <AvatarFallback><User className="h-5 w-5 text-muted-foreground" /></AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{service.professionalName || 'Nombre del Profesional'}</p>
              <p className="text-xs text-muted-foreground">{service.category}</p>
            </div>
          </div>

          {/* Location and Rate */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-muted-foreground border-t pt-4">
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              {service.location}
            </div>
            <div className="text-lg font-semibold text-primary">
              ${service.rate}/hr
            </div>
          </div>

          {/* Description with Read More */}
            <div className="border-t pt-4 mt-4">
               <h3 className="text-lg font-semibold mb-2 text-foreground">Descripción del Servicio</h3>
               <p className={cn("text-base leading-relaxed text-foreground/80", !isDescriptionExpanded && "line-clamp-3")}>
                 {service.description}
               </p>
               {service.description.length > 200 && ( // Show button only if description is long enough
                 <Button
                   variant="link"
                   className="p-0 h-auto text-primary text-sm mt-1"
                   onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                 >
                   {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
                 </Button>
               )}
            </div>


           {/* Booking Section: Calendar and Time Slots */}
           <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-start pt-6 border-t">
              {/* Calendar for Date Selection */}
              <div className="space-y-4">
                 <h3 className="text-xl font-semibold text-foreground flex items-center">
                     <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                     Seleccionar Fecha
                 </h3>
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(day) => day < new Date(new Date().setHours(0,0,0,0))}
                    className="rounded-md border shadow-sm p-0 w-full"
                    locale={es}
                    captionLayout="dropdown-buttons"
                    fromYear={currentYear}
                    toYear={currentYear + 2}
                 />
               </div>

               {/* Time Slot Selection */}
               <div className="space-y-4">
                 <h3 className="text-xl font-semibold text-foreground flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Seleccionar Hora (Cupo)
                 </h3>
                 {availableTimeSlots.length > 0 ? (
                    <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                      <SelectTrigger id="time-slot" className="w-full">
                        <SelectValue placeholder="Selecciona un cupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                     <p className="text-sm text-muted-foreground italic pt-2">
                       No hay cupos específicos listados o selecciona una fecha para ver disponibilidad.
                     </p>
                  )}
               </div>
           </div>


          {/* Service Policy */}
          {service.policyText && (
            <Alert className="mt-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Política del Servicio</AlertTitle>
              <AlertDescription>{service.policyText}</AlertDescription>
            </Alert>
          )}

          {/* Policy Acceptance Checkbox */}
          {service.policyText && ( // Only show checkbox if policy exists
            <div className="flex items-center space-x-3 mt-6 pt-6 border-t">
                <Checkbox
                    id="policy-acceptance"
                    checked={policyAccepted}
                    onCheckedChange={(checked) => setPolicyAccepted(checked as boolean)}
                    aria-labelledby="policy-acceptance-label"
                />
                <Label htmlFor="policy-acceptance" id="policy-acceptance-label" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    He leído y acepto la política de servicio.
                </Label>
            </div>
           )}
        </CardContent>

        {/* Booking Button Footer */}
        <CardFooter className="bg-muted/30 p-4 md:p-6 border-t flex justify-end">
            <Button
              onClick={handleBooking}
              size="lg"
              className="w-full sm:w-auto"
              disabled={isLoading || !selectedDate || !selectedTimeSlot || (!!service.policyText && !policyAccepted)} // Disable logic updated
            >
                Aceptar y Reservar
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
};


const ServiceDetailPage = () => {
  return (
    <AppLayout>
      <ServiceDetailPageContent />
    </AppLayout>
  );
};

export default ServiceDetailPage;
