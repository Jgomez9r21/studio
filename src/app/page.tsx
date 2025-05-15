
"use client";

import type React from "react";
import { useEffect, useState, useCallback, useRef }
from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ServiceListing} from '@/services/service-listings';
import { getServiceListings } from '@/services/service-listings';
import AppLayout from '@/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader as ShadSheetHeader,
  SheetTitle as ShadSheetTitle,
  SheetTrigger,
  SheetClose as ShadSheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { CalendarIcon, Search, MapPin, Heart, Filter, Star, ArrowLeft, Asterisk, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  BarChart,
  Camera,
  Edit,
  Music,
  DollarSign,
  Lightbulb,
  Database,
  ImageIcon,
  User,
  Code,
  Construction,
  School2,
  Palette,
  HomeIcon as LucideHomeIcon,
  Info,
  Briefcase,
  Building
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
import Image from 'next/image';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { HOURLY_RATE_CATEGORIES } from '@/lib/config';
import { Dialog, DialogContent as ShadDialogContent, DialogDescription as ShadDialogDescription, DialogFooter as ShadDialogFooter, DialogHeader as ShadDialogHeader, DialogTitle as ShadDialogTitle, DialogTrigger as ShadDialogTrigger, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';


interface Category {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const categorias: Category[] = [
  { name: 'Todos', icon: ArrowLeft },
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
  { name: 'Fotografía', icon: ImageIcon },
];

const featuredServices = [
  { id: 'f1', title: 'Desarrollo Web Completo', description: 'Sitios web modernos y optimizados.', category: 'Tecnología', image: 'https://placehold.co/400x300.png', dataAiHint: "web development code" },
  { id: 'f3', title: 'Diseño de Logotipos Impactantes', description: 'Crea una identidad visual única.', category: 'Diseñadores', image: 'https://placehold.co/400x300.png', dataAiHint: "logo design graphic" },
  { id: 'f4', title: 'Clases de Inglés Conversacional', description: 'Aprende a comunicarte con fluidez.', category: 'Profesores', image: 'https://placehold.co/400x300.png', dataAiHint: "language class conversation" },
  { id: 'f5', title: 'Reparaciones Eléctricas Urgentes', description: 'Soluciones rápidas y seguras.', category: 'Mantenimiento Hogar', image: 'https://placehold.co/400x300.png', dataAiHint: "electrician repair home" },
];


const ServiceFiltersContent = ({
    selectedCategory, setSelectedCategory,
    locationFilter, setLocationFilter,
    minRating, setMinRating,
    maxRate, setMaxRate,
    onApplyFilters
}: {
    selectedCategory: string; setSelectedCategory: (cat: string) => void;
    locationFilter: string; setLocationFilter: (loc: string) => void;
    minRating: number; setMinRating: (rate: number) => void;
    maxRate: number; setMaxRate: (rate: number) => void;
    onApplyFilters: () => void;
}) => {
    return (
     <div className="space-y-6 p-4 h-full flex flex-col">
         <div className="space-y-2">
             <Label htmlFor="category-filter-select">Categoría</Label>
             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                 <SelectTrigger id="category-filter-select">
                     <SelectValue placeholder="Selecciona una categoría" />
                 </SelectTrigger>
                 <SelectContent>
                     {categorias.map(category => (
                         <SelectItem key={category.name} value={category.name}>
                           {category.icon && <category.icon className="inline-block h-4 w-4 mr-2 text-muted-foreground" />}
                           {category.name}
                         </SelectItem>
                     ))}
                 </SelectContent>
             </Select>
         </div>

         <div className="space-y-2">
             <Label htmlFor="location-filter-input">Ubicación</Label>
             <div className="relative">
                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                     id="location-filter-input"
                     placeholder="Ciudad o Remoto"
                     value={locationFilter}
                     onChange={(e) => setLocationFilter(e.target.value)}
                     className="pl-9"
                 />
             </div>
         </div>

         <div className="space-y-2">
             <Label htmlFor="rating-filter-slider">Valoración Mínima</Label>
              <div className="flex items-center gap-2">
                 <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                 <Slider
                     id="rating-filter-slider"
                     min={0}
                     max={5}
                     step={0.1}
                     value={[minRating]}
                     onValueChange={(value) => setMinRating(value[0])}
                     className="flex-grow"
                 />
                 <span className="text-sm font-medium w-8 text-right">{minRating.toFixed(1)}</span>
             </div>
         </div>

         <div className="space-y-2">
             <Label htmlFor="rate-filter-slider">Tarifa Máxima</Label>
             <Slider
                 id="rate-filter-slider"
                 min={0}
                 max={500000}
                 step={10000}
                 value={[maxRate]}
                 onValueChange={(value) => setMaxRate(value[0])}
             />
          </div>
          <div className="flex-grow"></div>
          <ShadSheetClose asChild>
              <Button className="w-full" onClick={onApplyFilters}>Mostrar Resultados</Button>
          </ShadSheetClose>
     </div>
    );
};


function LandingPageContent() {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedCategoryState, setSelectedCategoryState] = useState<string>('Todos');
  const [favoritedListings, setFavoritedListings] = useState<Set<string>>(new Set());

  const [locationFilter, setLocationFilter] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxRate, setMaxRate] = useState(500000);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();


  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getServiceListings();
        const updatedData = data.map(listing => ({
          ...listing,
          category: categorias.some(cat => cat.name === listing.category) ? listing.category : 'Otros',
           imageUrl: listing.imageUrl || `https://placehold.co/400x300.png`,
           imageUrls: listing.imageUrls && listing.imageUrls.length > 0 ? listing.imageUrls : (listing.imageUrl ? [listing.imageUrl] : [`https://placehold.co/800x600.png`]),
        }));
        setListings(updatedData);
      } catch (error) {
        console.error("Fallo al obtener listados de servicios:", error);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    let targetCategory = 'Todos';

    if (categoryFromUrl) {
      const decodedCategory = decodeURIComponent(categoryFromUrl);
      const foundCategory = categorias.find(cat => cat.name === decodedCategory);
      if (foundCategory) {
        targetCategory = foundCategory.name;
      }
    }

    if (selectedCategoryState !== targetCategory) {
      setSelectedCategoryState(targetCategory);
    }
  }, [searchParams, selectedCategoryState]);


  const filteredListings = listings.filter(listing => {
    const matchesCategory = selectedCategoryState === 'Todos' || listing.category === selectedCategoryState;
    const matchesSearch = searchQuery === '' ||
                          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (listing.description && listing.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = locationFilter === '' || (listing.location && listing.location.toLowerCase().includes(locationFilter.toLowerCase()));
    const matchesRate = listing.rate <= maxRate;
    const matchesRating = listing.rating !== undefined ? listing.rating >= minRating : minRating === 0;

    return matchesCategory && matchesSearch && matchesLocation && matchesRate && matchesRating;
  });


  const currentYear = new Date().getFullYear();

  const toggleFavorite = (listingId: string) => {
    setFavoritedListings(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
      } else {
        newFavorites.add(listingId);
      }
      return newFavorites;
    });
  };

  const handleApplyFiltersFromSheet = () => {
    setIsFilterSheetOpen(false);
  };


  return (
    <div className="p-4 md:p-6 lg:p-8">
      <section className="mb-6 flex flex-col items-center justify-center text-center px-4 py-12 md:py-16 lg:py-20">
        
        <p className="mt-2 text-md md:text-lg text-muted-foreground max-w-xl">
          Tu plataforma para conectar con profesionales y reservar espacios deportivos y servicios de manera fácil y rápida.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 w-full max-w-lg">
          <div className="relative w-full flex-grow">
            <Input
              type="search"
              placeholder="Buscar servicios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-md shadow-sm pr-10 h-10 w-full"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-10 flex-shrink-0 w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Filtros
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0 w-[85%] sm:w-[320px] flex flex-col">
              <ShadSheetHeader className="p-4 border-b">
                <ShadSheetTitle>Filtros de Servicios</ShadSheetTitle>
              </ShadSheetHeader>
              <ScrollArea className="flex-grow">
                <ServiceFiltersContent
                    selectedCategory={selectedCategoryState} setSelectedCategory={setSelectedCategoryState}
                    locationFilter={locationFilter} setLocationFilter={setLocationFilter}
                    minRating={minRating} setMinRating={setMinRating}
                    maxRate={maxRate} setMaxRate={setMaxRate}
                    onApplyFilters={handleApplyFiltersFromSheet}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      <section className="mb-8 px-4 md:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold mb-4">Servicios Destacados</h2>
         <Carousel
          opts={{
            align: "start",
             loop: featuredServices.length > 1,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {featuredServices.map((service) => (
              <CarouselItem key={service.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="p-1">
                  <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                    <CardContent className="flex aspect-video items-center justify-center p-0 relative">
                        <Image src={service.image} alt={service.title} layout="fill" objectFit="cover" data-ai-hint={service.dataAiHint} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                       <div className="absolute bottom-0 left-0 p-4">
                         <CardTitle className="text-lg font-semibold text-white mb-1">{service.title}</CardTitle>
                         <CardDescription className="text-sm text-primary-foreground/80 line-clamp-2">{service.description}</CardDescription>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
           {featuredServices.length > 1 && (
             <>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
             </>
           )}
        </Carousel>
      </section>

      <div className="relative w-full px-4 md:px-6 lg:px-8 pb-4">
          <Tabs
              value={selectedCategoryState.toLowerCase().replace(/[^a-z0-9]/g, '') || 'todos'}
              onValueChange={(value) => {
              const categoryName = categorias.find(cat => cat.name.toLowerCase().replace(/[^a-z0-9]/g, '') === value)?.name || 'Todos';
              setSelectedCategoryState(categoryName);
              if (categoryName === 'Todos') {
                  router.push(pathname, { scroll: false });
              } else {
                  router.push(`${pathname}?category=${encodeURIComponent(categoryName)}`, { scroll: false });
              }
              }}
              className="w-full"
          >
             <div className="bg-muted rounded-md shadow-sm p-1 overflow-hidden relative">
                <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                  <CarouselContent>
                    <CarouselItem className="basis-auto"> {/* Single item for the whole TabsList */}
                      <TabsList className="inline-flex flex-nowrap h-auto p-0 bg-transparent shadow-none space-x-1">
                        {categorias.map((category) => (
                            <TabsTrigger
                                key={category.name}
                                value={category.name.toLowerCase().replace(/[^a-z0-9]/g, '')}
                                className={cn(
                                "px-3 py-1.5 text-xs sm:text-sm flex items-center flex-shrink-0 rounded-md hover:bg-primary/10",
                                "data-[state=inactive]:text-primary data-[state=inactive]:bg-transparent",
                                "data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:border data-[state=active]:border-border data-[state=active]:shadow-sm data-[state=active]:font-medium"
                                )}
                            >
                                {category.icon && <category.icon className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />}
                                {category.name}
                            </TabsTrigger>
                        ))}
                      </TabsList>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-muted/50 hover:bg-muted rounded-full hidden sm:flex" />
                  <CarouselNext variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-muted/50 hover:bg-muted rounded-full hidden sm:flex" />
                </Carousel>
              </div>
              <TabsContent value={selectedCategoryState.toLowerCase().replace(/[^a-z0-9]/g, '') || 'todos'} className="mt-6">
                  {filteredListings.length > 0 ? (
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredListings.map(listing => (
                       <Dialog key={`dialog-wrapper-${listing.id}`}>
                        <Card key={listing.id} className="flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-card">
                            <div className="relative aspect-video w-full overflow-hidden">
                            <Image
                                src={listing.imageUrl || `https://placehold.co/400x300.png`}
                                alt={listing.title}
                                layout="fill"
                                objectFit="cover"
                                data-ai-hint={`${listing.category} service`}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-white bg-black/30 hover:bg-black/50 hover:text-destructive"
                                onClick={() => toggleFavorite(listing.id)}
                                aria-label={favoritedListings.has(listing.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
                                >
                                <Heart className={cn("h-5 w-5", favoritedListings.has(listing.id) && "fill-destructive text-destructive")} />
                            </Button>
                            </div>
                            <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-grow">
                                <CardTitle className="text-lg font-semibold leading-tight">
                                    {listing.title}
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground pt-1">{listing.category}</CardDescription>
                                </div>

                            </div>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col p-4 pt-0 space-y-2">
                            <p className="text-sm">
                                <span className="text-muted-foreground">Tarifa: </span>
                                <span className="font-medium text-foreground">${listing.rate.toLocaleString('es-CO')}{HOURLY_RATE_CATEGORIES.includes(listing.category) ? ' por hora' : ''}</span>
                            </p>
                            {listing.professionalName && (
                                <p className="text-sm">
                                <span className="text-muted-foreground">Profesional: </span>
                                <span className="text-foreground">{listing.professionalName}</span>
                                </p>
                            )}
                            {listing.rating !== undefined && (
                                <div className="flex items-center text-sm">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1 flex-shrink-0" />
                                    <span className="font-semibold text-foreground">{listing.rating.toFixed(1)}</span>
                                </div>
                            )}
                            <p className="text-sm text-foreground line-clamp-1 flex items-center">
                                <MapPin className="w-3 h-3 mr-1 text-muted-foreground flex-shrink-0" />
                                {listing.location}
                            </p>
                            </CardContent>
                            <CardFooter className="p-4 pt-3 border-t">
                            <ShadDialogTrigger asChild>
                              <Button variant="outline" className="w-full">Reservar Servicio</Button>
                            </ShadDialogTrigger>
                            </CardFooter>
                        </Card>
                        <ShadDialogContent className="sm:max-w-md p-0 overflow-hidden">
                                  <ScrollArea className="max-h-[80vh]">
                                  <div className="p-6">
                                      <ShadDialogHeader className="pb-4 border-b mb-4">
                                      <ShadDialogTitle>Reservar {listing.title}</ShadDialogTitle>
                                      <ShadDialogDescription>
                                          Realiza una solicitud de reserva para programar este servicio.
                                      </ShadDialogDescription>
                                      </ShadDialogHeader>
                                      <div className="space-y-4">
                                      {listing.imageUrls && listing.imageUrls.length > 0 && (
                                          <Carousel className="w-full rounded-md overflow-hidden shadow-md">
                                          <CarouselContent>
                                              {listing.imageUrls.map((url, index) => (
                                              <CarouselItem key={index}>
                                                  <AspectRatio ratio={16 / 9} className="bg-muted">
                                                  <Image
                                                      src={url}
                                                      alt={`${listing.title} - Imagen ${index + 1}`}
                                                      layout="fill"
                                                      objectFit="cover"
                                                      data-ai-hint="service booking image"
                                                  />
                                                  </AspectRatio>
                                              </CarouselItem>
                                              ))}
                                          </CarouselContent>
                                          {listing.imageUrls.length > 1 && (
                                              <>
                                              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background text-foreground" />
                                              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background text-foreground" />
                                              </>
                                          )}
                                          </Carousel>
                                      )}
                                      {listing.professionalName && (
                                          <div className="flex items-center gap-2 pt-2">
                                              <Avatar className="h-8 w-8">
                                                  <AvatarImage src={listing.professionalAvatar || `https://placehold.co/50x50.png`} alt={listing.professionalName} data-ai-hint="professional avatar"/>
                                                  <AvatarFallback>{listing.professionalName.substring(0,1)}</AvatarFallback>
                                              </Avatar>
                                              <p className="text-sm font-medium text-foreground">Especialista: {listing.professionalName}</p>
                                          </div>
                                      )}
                                          <div className="pt-2">
                                          <p className="text-sm text-muted-foreground">{listing.description}</p>
                                          </div>
                                      <div className="grid grid-cols-[auto_1fr] items-center gap-4 pt-2">
                                          <Label htmlFor={`date-${listing.id}`} className="text-left text-sm whitespace-nowrap">Seleccionar Fecha</Label>
                                          <Popover>
                                          <PopoverTrigger asChild>
                                              <Button
                                              variant={"outline"}
                                              className={cn(
                                                  "w-full justify-start text-left font-normal col-span-1",
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
                                                  captionLayout="dropdown-buttons"
                                                  fromYear={currentYear}
                                                  toYear={currentYear + 5}
                                                  locale={es}
                                              />
                                          </PopoverContent>
                                          </Popover>
                                      </div>
                                          <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                                          <Label htmlFor={`time-slot-${listing.id}`} className="text-left text-sm whitespace-nowrap">
                                              Hora (Cupo)
                                          </Label>
                                          <Select onValueChange={setSelectedTime} value={selectedTime}>
                                              <SelectTrigger className="w-full col-span-1">
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
                                      </div>
                                      <ShadDialogFooter className="pt-6 mt-4 border-t">
                                      <DialogClose asChild>
                                          <Button type="submit" className="w-full">
                                              Realizar solicitud de reserva
                                          </Button>
                                      </DialogClose>
                                      </ShadDialogFooter>
                                  </div>
                                  </ScrollArea>
                              </ShadDialogContent>
                        </Dialog>
                      ))}
                  </div>
                  ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground p-8 border rounded-lg bg-card">
                      No hay servicios disponibles que coincidan con tus filtros.
                  </div>
                  )}
              </TabsContent>
          </Tabs>
        </div>
      <Toaster />
    </div>
  );
}


export default function Page() {
  return (
    <AppLayout>
      <LandingPageContent />
    </AppLayout>
  );
}

