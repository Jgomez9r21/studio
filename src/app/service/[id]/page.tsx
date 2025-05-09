
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
import { format, isSameDay, isSunday, startOfDay } from 'date-fns';
import type { DayModifiers } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils'; // Import cn utility
import { HOURLY_RATE_CATEGORIES } from '@/lib/config';

// Example holiday data (replace with actual holiday logic if needed)
const holidays: Date[] = [
  new Date(2024, 7, 19), // Example: August 19, 2024
  new Date(2024, 11, 25), // Christmas Day
  new Date(2025, 0, 1),  // New Year's Day
  new Date(2025, 4, 1), // May 1, 2025 (Labor Day example)
];

// Example daily availability data structure (replace with actual data fetching)
type DailyAvailabilityStatus = 'full' | 'partial' | 'none';
const dummyDailyAvailability: Record<string, DailyAvailabilityStatus> = {
  [format(new Date(2024, 7, 20), 'yyyy-MM-dd')]: 'full', // Aug 20
  [format(new Date(2024, 7, 21), 'yyyy-MM-dd')]: 'partial', // Aug 21
  [format(new Date(2024, 7, 22), 'yyyy-MM-dd')]: 'none',    // Aug 22 (Should be red)
  [format(new Date(2024, 7, 23), 'yyyy-MM-dd')]: 'full',    // Aug 23
  [format(new Date(2024, 7, 26), 'yyyy-MM-dd')]: 'partial', // Aug 26
  [format(new Date(2024, 7, 27), 'yyyy-MM-dd')]: 'full',    // Aug 27
  // Example for May 2025 to test new green styling
  [format(new Date(2025, 4, 5), 'yyyy-MM-dd')]: 'full', // May 5, 2025
  [format(new Date(2025, 4, 6), 'yyyy-MM-dd')]: 'full', // May 6, 2025
  [format(new Date(2025, 4, 9), 'yyyy-MM-dd')]: 'partial', // May 9, 2025 (yellow)
  [format(new Date(2025, 4, 10), 'yyyy-MM-dd')]: 'full', // May 10, 2025 (green)
  [format(new Date(2025, 4, 31), 'yyyy-MM-dd')]: 'partial', // May 31, 2025 (yellow)
  // Sundays in May 2025: 4, 11, 18, 25 (Should be gray)
  // May 1, 2025 is a Holiday (Should be gray)
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
  const [dailyAvailability, setDailyAvailability] = useState<Record<string, DailyAvailabilityStatus>>(dummyDailyAvailability);
  const [today, setToday] = useState<Date | undefined>(undefined);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());


  useEffect(() => {
    setToday(startOfDay(new Date()));
    setCurrentYear(new Date().getFullYear());
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
                professionalAvatar: fetchedService.professionalAvatar || `https://picsum.photos/50/50?random=prof-${fetchedService.id}`
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
      // Only show slots if not Sunday, not Holiday, and availability is not 'none'
      if (!isSunday(selectedDate) && !isHoliday(selectedDate) && dailyAvailability[dateString] !== 'none') {
        setAvailableTimeSlots(service.availability || []);
      } else {
         setAvailableTimeSlots([]);
      }
    }
  }, [service, selectedDate, dailyAvailability]); // isHoliday is not directly in deps, but part of logic

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


  const isHoliday = (date: Date): boolean => {
    const startOfGivenDate = startOfDay(date);
    return holidays.some(holiday => isSameDay(startOfGivenDate, startOfDay(holiday)));
  };

  const modifiers: DayModifiers = {
    sunday: isSunday,
    holiday: isHoliday,
    available: (date: Date) => dailyAvailability[format(date, 'yyyy-MM-dd')] === 'full' && !isSunday(date) && !isHoliday(date),
    partial: (date: Date) => dailyAvailability[format(date, 'yyyy-MM-dd')] === 'partial' && !isSunday(date) && !isHoliday(date),
    unavailable: (date: Date) => !isSunday(date) && !isHoliday(date) && dailyAvailability[format(date, 'yyyy-MM-dd')] === 'none',
  };

  const modifiersClassNames = {
    sunday: 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 opacity-75 !cursor-not-allowed',
    holiday: 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 opacity-75 !cursor-not-allowed',
    available: 'bg-green-500 text-white hover:bg-green-600 focus:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 rounded-md',
    partial: 'bg-yellow-400 text-black hover:bg-yellow-500 focus:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 rounded-md',
    unavailable: 'bg-red-500 text-white opacity-75 line-through !cursor-not-allowed dark:bg-red-700 dark:text-red-200 rounded-md',
    selected: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-md',
  };

   const calendarClassNames = {
     day_today: 'bg-transparent text-foreground font-bold',
   };
   
   const disabledDays = (date: Date): boolean => {
    if (!today) return true; // Disable all days if today is not set yet (client-side init)
    return (
      date < today || // Past dates
      isSunday(date) || // Sundays
      isHoliday(date) || // Holidays
      (!isSunday(date) && !isHoliday(date) && dailyAvailability[format(date, 'yyyy-MM-dd')] === 'none') // Unavailable non-Sun/Hol days
    );
  };


  if (isLoading || !today) { // Also wait for today to be set
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


           <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-start pt-6 border-t">
              <div className="space-y-4">
                 <h3 className="text-xl font-semibold text-foreground flex items-center">
                     <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                     Seleccionar Fecha
                 </h3>
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={disabledDays}
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    classNames={calendarClassNames}
                    className="rounded-md border shadow-sm p-0 w-full"
                    locale={es}
                    captionLayout="dropdown-buttons"
                    fromYear={currentYear}
                    toYear={currentYear + 2}
                 />
               </div>

               <div className="space-y-4">
                 <h3 className="text-xl font-semibold text-foreground flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Seleccionar Hora (Cupo)
                 </h3>
                 {selectedDate ? (
                   availableTimeSlots.length > 0 ? (
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
                       { (isSunday(selectedDate) || isHoliday(selectedDate))
                          ? 'Los domingos y festivos no hay servicio.'
                          : 'No hay cupos disponibles para este día.'
                       }
                     </p>
                   )
                 ) : (
                    <p className="text-sm text-muted-foreground italic pt-2">
                        Selecciona una fecha para ver los cupos disponibles.
                    </p>
                 ) }
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

