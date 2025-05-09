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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, MapPin, Clock, Info, User, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay, startOfDay, addMonths, getYear, getMonth, isBefore, isSunday, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { HOURLY_RATE_CATEGORIES } from '@/lib/config';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type AvailabilityStatus = 'available' | 'partial' | 'occupied' | 'unavailable';

// Example holiday data (can be fetched or configured elsewhere)
const holidays: Date[] = [
  new Date(new Date().getFullYear(), 0, 1), // New Year's Day
  new Date(new Date().getFullYear(), 4, 1), // Labor Day
  new Date(new Date().getFullYear(), 11, 25), // Christmas Day current year
  new Date(new Date().getFullYear() + 1, 0, 1),  // New Year's Day next year
];


const generateDummyAvailability = (): Record<string, AvailabilityStatus> => {
    const availability: Record<string, AvailabilityStatus> = {};
    const today = startOfDay(new Date());
    const startDate = today;
    const endDate = addMonths(today, 6); // Generate for a few months ahead

    const intervalDates = eachDayOfInterval({ start: startDate, end: endDate });

    intervalDates.forEach(date => {
        const dateString = format(date, 'yyyy-MM-dd');

        if (isBefore(date, today) && !isSameDay(date, today)) {
            availability[dateString] = 'unavailable'; // Past dates are unavailable
            return;
        }
        if (isSunday(date) || holidays.some(h => isSameDay(h, date))) {
            availability[dateString] = 'unavailable'; // Sundays and holidays are unavailable by default
            return;
        }

        // Simulate varied availability for other days
        const rand = Math.random();
        if (rand < 0.5) { // 50% available
            availability[dateString] = 'available';
        } else if (rand < 0.75) { // 25% partial
            availability[dateString] = 'partial';
        } else { // 25% occupied
            availability[dateString] = 'occupied';
        }
    });
    return availability;
};


const ServiceDetailPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isLoggedIn, user, openLoginDialog } = useAuth();

  const serviceId = typeof params.id === 'string' ? params.id : undefined;

  const [service, setService] = useState<ServiceListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>();
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [dailyAvailability, setDailyAvailability] = useState<Record<string, AvailabilityStatus>>({});
  
  const today = startOfDay(new Date());
  const currentYear = getYear(today);


  useEffect(() => {
    setDailyAvailability(generateDummyAvailability());
  }, []);


  useEffect(() => {
    if (serviceId) {
      const fetchService = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedService = await getServiceById(serviceId);
          if (fetchedService) {
            const serviceWithProfessional = {
                ...fetchedService,
                professionalName: fetchedService.professionalName || `Profesional de ${fetchedService.category}`,
                professionalAvatar: fetchedService.professionalAvatar || `https://picsum.photos/50/50?random=prof-${fetchedService.id}`,
                imageUrls: fetchedService.imageUrls && fetchedService.imageUrls.length > 0
                           ? fetchedService.imageUrls
                           : (fetchedService.imageUrl ? [fetchedService.imageUrl] : [`https://picsum.photos/800/600?random=service-${fetchedService.id}`]),
                description: fetchedService.description || "No hay descripción disponible para este servicio."
            };
            setService(serviceWithProfessional);
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
    setAvailableTimeSlots([]);
    setSelectedTimeSlot(undefined);
    if (service && selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const dayStatus = dailyAvailability[dateString];
      
      if (dayStatus === 'available' || dayStatus === 'partial') {
         if (service.availability && service.availability.length > 0) {
            setAvailableTimeSlots(service.availability);
         } else {
            setAvailableTimeSlots(['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM']); 
         }
      } else {
         setAvailableTimeSlots([]);
      }
    }
  }, [service, selectedDate, dailyAvailability]);

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
    if (!policyAccepted && service?.policyText) {
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
  };

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

  const isDayDisabled = (date: Date): boolean => {
    const dateOnly = startOfDay(date);
    if (isBefore(dateOnly, today) && !isSameDay(dateOnly, today)) return true;
    
    const status = dailyAvailability[format(dateOnly, 'yyyy-MM-dd')];
    if (status === 'occupied' || status === 'unavailable') return true;
    
    // Sundays and holidays are disabled unless explicitly 'available' or 'partial'
    if ((isSunday(dateOnly) || holidays.some(h => isSameDay(h, dateOnly)))) {
        return !(status === 'available' || status === 'partial');
    }
    return false;
  };

  const modifiers = {
    available: (date: Date) => dailyAvailability[format(startOfDay(date), 'yyyy-MM-dd')] === 'available' && !isDayDisabled(date),
    partial: (date: Date) => dailyAvailability[format(startOfDay(date), 'yyyy-MM-dd')] === 'partial' && !isDayDisabled(date),
    occupied: (date: Date) => dailyAvailability[format(startOfDay(date), 'yyyy-MM-dd')] === 'occupied',
    // 'unavailable' days will be handled by the default disabled styling if isDayDisabled returns true
    // and no other color modifier applies.
  };

  const modifiersClassNames = {
    available: 'rdp-day_available',
    partial: 'rdp-day_partial',
    occupied: 'rdp-day_occupied',
    // No specific class for 'unavailable' as it's covered by the general disabled style in globals.css
  };


  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 md:py-8 max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-primary hover:text-primary/80 px-2">
        <ArrowLeft className="mr-2 h-5 w-5" />
        Volver a la búsqueda
      </Button>

      <Card className="overflow-hidden shadow-xl rounded-xl">
        <CardHeader className="p-0">
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
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-t-xl"
                        data-ai-hint={`service image ${index + 1}`}
                        priority={index === 0}
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
          <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{service.title}</CardTitle>
          
          {service.professionalName && (
            <div className="flex items-center gap-3 pt-2">
                <Avatar className="h-10 w-10 border">
                <AvatarImage src={service.professionalAvatar} alt={service.professionalName} data-ai-hint="professional avatar" />
                <AvatarFallback><User className="h-5 w-5 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div>
                <p className="text-sm font-medium text-foreground">{service.professionalName}</p>
                <p className="text-xs text-muted-foreground">{service.category}</p>
                </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-muted-foreground border-t pt-4">
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              {service.location}
            </div>
            <div className="text-lg font-semibold text-primary">
              ${service.rate}{HOURLY_RATE_CATEGORIES.includes(service.category) ? '/hr' : ''}
            </div>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Descripción del Servicio</h3>
            <p className={cn("text-base leading-relaxed text-foreground/80", !isDescriptionExpanded && service.description.length > 200 && "line-clamp-3")}>
              {service.description}
            </p>
            {service.description.length > 200 && (
              <Button
                variant="link"
                className="p-0 h-auto text-primary text-sm mt-1"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
              </Button>
            )}
          </div>

          <div className="space-y-6 pt-6 border-t">
            <div className="space-y-3">
              <Label htmlFor="calendar-booking" className="text-md font-semibold text-foreground flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                  Seleccionar Fecha
              </Label>
              <div className="flex justify-center">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDayDisabled}
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    locale={es}
                    defaultMonth={startOfDay(new Date())} // Start with current month view
                    fromMonth={startOfDay(new Date())} // Prevent navigating to past months
                    toYear={currentYear + 2} 
                    captionLayout="dropdown-buttons"
                    className="rounded-md border shadow-md p-2 bg-card"
                />
              </div>
              {selectedDate && <p className="text-sm text-muted-foreground pt-2 text-center">Fecha seleccionada: {format(selectedDate, "PPP", { locale: es })}</p>}
            </div>


            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4">
              <Label htmlFor={`time-slot-${service.id}`} className="text-md font-semibold text-foreground flex items-center whitespace-nowrap">
                <Clock className="mr-2 h-5 w-5 text-primary flex-shrink-0" />
                Hora (Cupo)
              </Label>
              <div>
                {selectedDate ? (
                  availableTimeSlots.length > 0 ? (
                    <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                      <SelectTrigger id={`time-slot-${service.id}`} className="w-full">
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
                     <p className="text-sm text-muted-foreground italic pt-1">
                        { (dailyAvailability[format(selectedDate, 'yyyy-MM-dd')] === 'occupied' || dailyAvailability[format(selectedDate, 'yyyy-MM-dd')] === 'unavailable' ) || isDayDisabled(selectedDate)
                            ? 'Día no disponible para reserva.'
                            : 'No hay cupos disponibles para este día.'
                        }
                    </p>
                  )
                ) : (
                   <p className="text-sm text-muted-foreground italic pt-1">
                       Selecciona una fecha para ver los cupos disponibles.
                   </p>
                ) }
              </div>
            </div>
          </div>


          {service.policyText && (
            <Alert className="mt-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Política del Servicio</AlertTitle>
              <AlertDescription>{service.policyText}</AlertDescription>
            </Alert>
          )}

          {service.policyText && (
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

        <CardFooter className="bg-muted/30 p-4 md:p-6 border-t flex justify-end">
            <Button
              onClick={handleBooking}
              size="lg"
              className="w-full sm:w-auto"
              disabled={isLoading || !selectedDate || !selectedTimeSlot || (!!service.policyText && !policyAccepted)}
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

