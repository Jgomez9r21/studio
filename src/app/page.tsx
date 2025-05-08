
"use client";

import type React from "react";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { ServiceListing} from '@/services/service-listings';
import { getServiceListings } from '@/services/service-listings';
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Import DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from 'date-fns/locale'; // Import Spanish locale
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Camera,
  Edit,
  Music,
  DollarSign,
  Bot,
  Lightbulb,
  Database,
  ImageIcon,
  User,
  Code,
  Construction,
  School2,
  Dumbbell,
  Palette,
  HomeIcon as LucideHomeIcon // Renamed to avoid conflict
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import Image from 'next/image'; // Import next/image


// Define Category types with explicit icon typing
interface Category {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Categorías de servicios
const categorias: Category[] = [
  { name: 'Todos' },
  { name: 'Instalación Deportiva', icon: Dumbbell }, // Cambiado de Reserva Deportiva
  { name: 'Tecnología', icon: Code },
  { name: 'Entrenador Personal', icon: User },
  { name: 'Contratista', icon: Construction },
  { name: 'Mantenimiento Hogar', icon: LucideHomeIcon },
  { name: 'Profesores', icon: School2 },
  { name: 'Diseñadores', icon: Palette },
  { name: 'Marketing Digital', icon: BarChart },
  { name: 'Video & Animación', icon: Camera },
  { name: 'Redacción & Traducción', icon: Edit },
  { name: 'Música & Audio', icon: Music },
  { name: 'Finanzas', icon: DollarSign },
  { name: 'Crecimiento Personal', icon: Lightbulb },
  { name: 'Datos', icon: Database },
  { name: 'Fotografía', icon: ImageIcon },

];


// Featured Services for Carousel
const featuredServices = [
  { id: 'f1', title: 'Desarrollo Web Completo', description: 'Sitios web modernos y optimizados.', category: 'Tecnología', image: 'https://picsum.photos/400/300?random=1', dataAiHint: "web development code" },
  { id: 'f2', title: 'Reserva de Cancha de Tenis', description: 'Encuentra y reserva tu hora.', category: 'Instalación Deportiva', image: 'https://picsum.photos/400/300?random=2', dataAiHint: "tennis court" },
  { id: 'f3', title: 'Diseño de Logotipos Impactantes', description: 'Crea una identidad visual única.', category: 'Diseñadores', image: 'https://picsum.photos/400/300?random=3', dataAiHint: "logo design graphic" },
  { id: 'f4', title: 'Clases de Inglés Conversacional', description: 'Aprende a comunicarte con fluidez.', category: 'Profesores', image: 'https://picsum.photos/400/300?random=4', dataAiHint: "language class conversation" },
  { id: 'f5', title: 'Reparaciones Eléctricas Urgentes', description: 'Soluciones rápidas y seguras.', category: 'Mantenimiento Hogar', image: 'https://picsum.photos/400/300?random=5', dataAiHint: "electrician repair home" },
];


// Main Content Component for the Landing Page
function LandingPageContent() {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');


  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getServiceListings();
        const updatedData = data.map(listing => ({
          ...listing,
          // Ensure category exists, otherwise default to 'Otros'
          category: categorias.some(cat => cat.name === listing.category) ? listing.category : 'Otros',
          // Use existing imageUrl or provide a default/random one
           imageUrl: listing.imageUrl || `https://picsum.photos/400/300?random=${listing.id}`
        }));
        setListings(updatedData);
      } catch (error) {
        console.error("Fallo al obtener listados de servicios:", error);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing =>
    (selectedCategory === 'Todos' || listing.category === selectedCategory) &&
    (listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentYear = new Date().getFullYear();


  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Hero Section */}
      <section className="mb-6 flex flex-col items-center justify-center text-center px-4 pt-6 md:pt-8 lg:pt-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Encuentra el proveedor de servicios perfecto
        </h1>
        <p className="mt-2 text-md md:text-lg text-muted-foreground">
          Reserva servicios locales con facilidad.
        </p>
        <div className="relative mt-4 w-full max-w-xs sm:max-w-md">
          <Input
            type="search"
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md shadow-sm pr-10 h-10 w-full"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </section>

      {/* Featured Services Carousel */}
      <section className="mb-8 px-4 md:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold mb-4">Servicios Destacados</h2>
         <Carousel
          opts={{
            align: "start",
             loop: true, // Enable looping
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {featuredServices.map((service) => (
              <CarouselItem key={service.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"> {/* Adjust basis for responsiveness */}
                <div className="p-1">
                  <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"> {/* Ensure cards have height */}
                    <CardContent className="flex aspect-video items-center justify-center p-0 relative">
                        <Image src={service.image} alt={service.title} layout="fill" objectFit="cover" data-ai-hint={service.dataAiHint} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                       <div className="absolute bottom-0 left-0 p-4">
                         <CardTitle className="text-lg font-semibold text-white mb-1">{service.title}</CardTitle>
                         <CardDescription className="text-sm text-primary-foreground/80 line-clamp-2">{service.description}</CardDescription> {/* Added line-clamp */}
                       </div>
                    </CardContent>
                    {/* Optional: Add a footer or actions if needed */}
                    {/* <CardFooter className="p-2 pt-2 border-t">
                      <Button size="sm" variant="secondary" className="w-full">Ver Más</Button>
                    </CardFooter> */}
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
           {/* Add controls only if there are enough items to scroll */}
           {featuredServices.length > 1 && (
             <>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
             </>
           )}
        </Carousel>
      </section>


      {/* Category Tabs & Service Listings */}
      <Tabs defaultValue="todos" className="w-full px-4 md:px-6 lg:px-8 pb-4">
         <ScrollArea className="w-full whitespace-nowrap pb-4">
           <TabsList className="inline-flex h-auto sm:h-10 gap-1 p-1 bg-muted rounded-md shadow-sm flex-wrap sm:flex-nowrap">
             {categorias.map(category => (
               <TabsTrigger
                 key={category.name}
                 value={category.name.toLowerCase().replace(/[^a-z0-9]/g, '')}
                 onClick={() => setSelectedCategory(category.name)}
                 className="data-[state=active]:bg-background data-[state=active]:text-foreground px-3 py-1.5 text-xs sm:text-sm flex items-center flex-shrink-0"
               >
                 {category.icon && <category.icon className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />}
                 {category.name}
               </TabsTrigger>
             ))}
           </TabsList>
           <ScrollBar orientation="horizontal" />
         </ScrollArea>


        {/* Render content for the selected category */}
         <TabsContent value={selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '')} className="mt-6">
          <ScrollArea className="h-[600px] w-full rounded-md border shadow-sm p-4 bg-card">
            {filteredListings.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> {/* Adjusted grid for responsiveness */}
                {filteredListings.map(listing => (
                  <Card key={listing.id} className="flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-background">
                     {/* Image Section */}
                     <div className="relative aspect-video w-full overflow-hidden">
                       <Image
                         src={listing.imageUrl || `https://picsum.photos/400/300?random=${listing.id}`} // Fallback if imageUrl is missing
                         alt={listing.title}
                         layout="fill"
                         objectFit="cover"
                         data-ai-hint={`${listing.category} service`} // Generic hint, refine if possible
                       />
                     </div>
                    <CardHeader className="p-4 pb-2"> {/* Adjusted padding */}
                      <CardTitle className="text-lg font-semibold">
                        {listing.title}
                      </CardTitle>
                      <CardDescription>{listing.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col p-4 pt-0">
                      <p className="text-sm text-muted-foreground mb-2 flex-grow">
                        {listing.description}
                      </p>
                      <p className="text-sm font-medium mb-1">
                        Tarifa: ${listing.rate} por hora
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Disponibilidad: {listing.availability.join(', ')}
                      </p>

                      {/* Booking Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">Reservar Servicio</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Reservar {listing.title}</DialogTitle>
                            <DialogDescription>
                              Realiza una solicitud de reserva para programar este servicio.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[1fr_3fr] items-center gap-4">
                              <Label htmlFor={`name-${listing.id}`} className="text-left sm:text-right">Nombre</Label>
                              <Input id={`name-${listing.id}`} defaultValue="Tu Nombre"
                                     className="rounded-md shadow-sm"/>
                            </div>
                             <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[1fr_3fr] items-center gap-4">
                              <Label htmlFor={`date-${listing.id}`} className="text-left sm:text-right">Seleccionar Fecha</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !date && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                    {date ? format(date, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                     captionLayout="dropdown-buttons" // Ensure dropdowns are enabled
                                     fromYear={1900} // Allow past years
                                     toYear={currentYear} // Set current year as max
                                     locale={es} // Set locale to Spanish
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                             <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[1fr_3fr] items-center gap-4">
                                <Label htmlFor={`time-${listing.id}`} className="text-left sm:text-right">
                                    Seleccionar Hora (Cupo)
                                </Label>
                                <Select onValueChange={setSelectedTime} value={selectedTime}>
                                    <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar Cupo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {listing.availability.map((timeSlot) => (
                                        <SelectItem key={timeSlot} value={timeSlot}>
                                        {timeSlot}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                             </div>
                            <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[1fr_3fr] items-start gap-4">
                              <Label htmlFor={`comment-${listing.id}`} className="text-left sm:text-right pt-1.5">Comentario</Label>
                              <Textarea id={`comment-${listing.id}`} placeholder="Añade detalles sobre tu solicitud..."
                                        className="rounded-md shadow-sm"/>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">
                              Realizar solicitud de reserva
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No hay servicios disponibles en esta categoría.
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}


// Main Page Component wrapping content with AppLayout
export default function Page() {
  return (
    <AppLayout>
      <LandingPageContent />
       <Toaster /> {/* Ensure Toaster is included */}
    </AppLayout>
  );
}

    