
"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, Filter, X, Heart, Building, Users, Sun, LayoutGrid, Home as HomeIcon, Target, Footprints, Waves, Shield, ListChecks, Dumbbell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Image from 'next/image';
import { HOURLY_RATE_CATEGORIES } from '@/lib/config';
import { cn } from "@/lib/utils";

// Define Category type
interface Category {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Updated categories for sports facilities based on user request
const categoriasDisponibles: Category[] = [
    { name: 'Todos', icon: Building },
    { name: 'Canchas de fútbol salón', icon: Building },
    { name: 'Canchas de fútbol', icon: Building },
    { name: 'Canchas de baloncesto', icon: Building },
    { name: 'Canchas de vóleibol', icon: Building },
    { name: 'Canchas múltiples', icon: LayoutGrid },
    { name: 'Gimnasios cubiertos', icon: Dumbbell },
    { name: 'Salones de yoga, pilates o danza', icon: Users },
    { name: 'Piscinas olímpicas o recreativas', icon: Waves },
    { name: 'Estudios de entrenamiento funcional o crossfit', icon: Dumbbell },
    { name: 'Canchas de tenis', icon: Building },
    { name: 'Canchas de squash', icon: Building },
    { name: 'Canchas de pádel', icon: Building },
];


// Define SportsFacility interface
interface SportsFacility {
  id: string;
  name: string;
  type: string;
  location: string;
  rate: number;
  rating: number;
  reviews: number;
  category: 'Instalación Deportiva';
  description: string;
  image: string;
  dataAiHint: string;
  amenities?: string[];
}

// Dummy sports facility data reflecting new categories
const dummySportsFacilities: SportsFacility[] = [
  {
    id: 'sf1',
    name: 'Cancha Sintética "La Bombonera"',
    type: 'Fútbol salón techado',
    location: 'Chapinero Alto, Bogotá',
    rate: 80000, rating: 4.7, reviews: 25, category: 'Instalación Deportiva',
    description: 'Cancha sintética cubierta para fútbol de salón, con iluminación LED y graderías.',
    image: 'https://picsum.photos/400/300?random=sf1', dataAiHint: "futsal court indoor",
    amenities: ['Cubierta', 'Iluminación LED', 'Graderías', 'Baños', 'Fútbol Salón'],
  },
  {
    id: 'sf9',
    name: 'Estadio El Campín (Cancha Auxiliar)',
    type: 'Cancha de fútbol 11, grama natural',
    location: 'Teusaquillo, Bogotá',
    rate: 150000, rating: 4.5, reviews: 60, category: 'Instalación Deportiva',
    description: 'Cancha auxiliar de grama natural para fútbol 11, bien mantenida.',
    image: 'https://picsum.photos/400/300?random=sf9', dataAiHint: "football field grass",
    amenities: ['Grama Natural', 'Fútbol 11', 'Camerinos', 'Parqueadero'],
  },
  {
    id: 'sf2',
    name: 'Gimnasio "Músculos de Acero"',
    type: 'Gimnasio completo y funcional cubierto',
    location: 'Usaquén, Bogotá',
    rate: 15000, rating: 4.9, reviews: 72, category: 'Instalación Deportiva',
    description: 'Gimnasio totalmente equipado con máquinas y zona funcional.',
    image: 'https://picsum.photos/400/300?random=sf2', dataAiHint: "gym fitness equipment",
    amenities: ['Máquinas Cardio', 'Pesas Libres', 'Clases Grupales', 'Vestuarios'],
  },
  {
    id: 'sf3',
    name: 'Piscina Olímpica "El Tritón"',
    type: 'Piscina olímpica al aire libre',
    location: 'Salitre, Bogotá',
    rate: 25000, rating: 4.6, reviews: 40, category: 'Instalación Deportiva',
    description: 'Piscina de 50 metros, ideal para natación y entrenamiento. Carriles disponibles.',
    image: 'https://picsum.photos/400/300?random=sf3', dataAiHint: "swimming pool water",
    amenities: ['Olímpica', 'Carriles de Nado', 'Clases de Natación', 'Lockers'],
  },
  {
    id: 'sf4',
    name: 'Club de Tenis "El Grand Slam"',
    type: 'Canchas de tenis de arcilla al aire libre',
    location: 'Suba, Bogotá',
    rate: 50000, rating: 4.8, reviews: 33, category: 'Instalación Deportiva',
    description: 'Complejo con 4 canchas de tenis de arcilla. Iluminación nocturna.',
    image: 'https://picsum.photos/400/300?random=sf4', dataAiHint: "tennis court clay",
    amenities: ['Arcilla', 'Iluminación Nocturna', 'Alquiler de Raquetas', 'Cafetería'],
  },
  {
    id: 'sf5',
    name: 'Dojo "Bushido"', 
    type: 'Tatami para artes marciales (Karate, Judo) interior',
    location: 'Kennedy, Bogotá',
    rate: 30000, rating: 4.5, reviews: 15, category: 'Instalación Deportiva',
    description: 'Espacio tradicional para la práctica de artes marciales, con equipo completo.',
    image: 'https://picsum.photos/400/300?random=sf5', dataAiHint: "dojo martial arts",
    amenities: ['Tatami', 'Espejos', 'Equipo de protección', 'Vestuarios'],
  },
   {
    id: 'sf6',
    name: 'Estudio "Zen Yoga"',
    type: 'Salón de Yoga y Pilates interior',
    location: 'La Candelaria, Bogotá',
    rate: 20000, rating: 4.9, reviews: 50, category: 'Instalación Deportiva',
    description: 'Ambiente tranquilo y acogedor para clases de yoga, pilates y meditación.',
    image: 'https://picsum.photos/400/300?random=sf6', dataAiHint: "yoga studio zen",
    amenities: ['Mats de Yoga', 'Bloques', 'Música Ambiental', 'Té de cortesía'],
  },
  {
    id: 'sf8',
    name: 'Polideportivo El Salitre', 
    type: 'Canchas múltiples (baloncesto, vóleibol) techado',
    location: 'Salitre, Bogotá',
    rate: 60000, rating: 4.5, reviews: 80, category: 'Instalación Deportiva',
    description: 'Amplio espacio con canchas demarcadas para baloncesto y voleibol, graderías.',
    image: 'https://picsum.photos/400/300?random=sf8', dataAiHint: "sports complex indoor",
    amenities: ['Techado', 'Graderías', 'Baloncesto', 'Vóleibol', 'Baños'],
  }
];

// Helper function to match facility type with filter category
const typeMatchesFilter = (facilityType: string, filterCategory: string): boolean => {
    const typeLower = facilityType.toLowerCase();
    const filterLower = filterCategory.toLowerCase();

    if (filterLower === 'todos') return true;

    // Keywords for matching facility types to filter categories
    const categoryKeywords: Record<string, string[]> = {
        'canchas de fútbol salón': ['fútbol salón', 'futbol sala', 'futsal', 'microfutbol', 'fútbol de salón'],
        'canchas de fútbol': ['fútbol', 'futbol', 'soccer', 'cancha de 11', 'cancha de 7', 'cancha de 9', 'football', 'grama natural', 'grama sintética'],
        'canchas de baloncesto': ['baloncesto', 'basketball', 'basket'],
        'canchas de vóleibol': ['vóleibol', 'voleibol', 'volleyball'],
        'canchas múltiples': ['múltiple', 'multiuso', 'polivalente', 'multifuncional', 'polideportivo'],
        'gimnasios cubiertos': ['gimnasio', 'gym', 'fitness center'],
        'salones de yoga, pilates o danza': ['yoga', 'pilates', 'danza', 'baile', 'meditación'],
        'piscinas olímpicas o recreativas': ['piscina', 'swimming', 'nado', 'acuático', 'olímpica', 'recreativa'],
        'estudios de entrenamiento funcional o crossfit': ['funcional', 'crossfit', 'hiit', 'entrenamiento en circuito', 'training studio'],
        'canchas de tenis': ['tenis', 'tennis', 'campo de tenis'],
        'canchas de squash': ['squash', 'cancha de squash'],
        'canchas de pádel': ['pádel', 'padel', 'cancha de pádel'],
    };

    const keywords = categoryKeywords[filterCategory];
    if (keywords) {
        return keywords.some(keyword => typeLower.includes(keyword.toLowerCase()));
    }
    
    const firstFilterWord = filterLower.split(' ')[0];
    return typeLower.includes(firstFilterWord);
};


// Component for Filter Controls
const FiltersContent = ({
    currentFilterCategory, setCurrentFilterCategory,
    currentFilterLocation, setCurrentFilterLocation,
    currentFilterMinRating, setCurrentFilterMinRating,
    currentFilterMaxRate, setCurrentFilterMaxRate,
    onApplyFilters,
}: {
    currentFilterCategory: string; setCurrentFilterCategory: (cat: string) => void;
    currentFilterLocation: string; setCurrentFilterLocation: (loc: string) => void;
    currentFilterMinRating: number; setCurrentFilterMinRating: (rate: number) => void;
    currentFilterMaxRate: number; setCurrentFilterMaxRate: (rate: number) => void;
    onApplyFilters: () => void;
}) => {
    return (
     <div className="space-y-6 p-4 h-full flex flex-col">
         <div className="space-y-2">
             <Label htmlFor="category-select">Categoría</Label>
             <Select value={currentFilterCategory} onValueChange={setCurrentFilterCategory}>
                 <SelectTrigger id="category-select">
                     <SelectValue placeholder="Selecciona un tipo de instalación" />
                 </SelectTrigger>
                 <SelectContent>
                     {categoriasDisponibles.map(category => (
                         <SelectItem key={category.name} value={category.name}>
                            {category.icon && <category.icon className="inline-block h-4 w-4 mr-2 text-muted-foreground" />}
                            {category.name}
                         </SelectItem>
                     ))}
                 </SelectContent>
             </Select>
         </div>

         <div className="space-y-2">
             <Label htmlFor="location-input">Ubicación</Label>
             <div className="relative">
                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                     id="location-input"
                     placeholder="Ciudad, Localidad o Barrio"
                     value={currentFilterLocation}
                     onChange={(e) => setCurrentFilterLocation(e.target.value)}
                     className="pl-9"
                 />
             </div>
         </div>

         <div className="space-y-2">
             <Label htmlFor="rating-slider">Valoración Mínima</Label>
              <div className="flex items-center gap-2">
                 <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                 <Slider
                     id="rating-slider"
                     min={0}
                     max={5}
                     step={0.1}
                     value={[currentFilterMinRating]}
                     onValueChange={(value) => setCurrentFilterMinRating(value[0])}
                     className="flex-grow"
                 />
                 <span className="text-sm font-medium w-8 text-right">{currentFilterMinRating.toFixed(1)}</span>
             </div>
         </div>

         <div className="space-y-2">
             <Label htmlFor="rate-slider">Tarifa Máxima (${currentFilterMaxRate.toLocaleString('es-CO')}/hr)</Label>
             <Slider
                 id="rate-slider"
                 min={0}
                 max={200000} 
                 step={5000}
                 value={[currentFilterMaxRate]}
                 onValueChange={(value) => setCurrentFilterMaxRate(value[0])}
             />
         </div>

          <div className="mt-auto pt-6 border-t">
            {/* This button is always present for applying filters from the sheet */}
            <SheetClose asChild>
                <Button className="w-full" onClick={onApplyFilters}>Mostrar Resultados</Button>
            </SheetClose>
         </div>
     </div>
    );
};

const FindTalentsContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [favoritedItems, setFavoritedItems] = useState<Set<string>>(new Set());

  const [currentFilterCategory, setCurrentFilterCategory] = useState('Todos');
  const [currentFilterLocation, setCurrentFilterLocation] = useState('');
  const [currentFilterMinRating, setCurrentFilterMinRating] = useState(0);
  const [currentFilterMaxRate, setCurrentFilterMaxRate] = useState(200000);

  const [appliedFilters, setAppliedFilters] = useState({
    category: 'Todos',
    location: '',
    rating: 0,
    rate: 200000,
  });

  useEffect(() => {
    setCurrentFilterCategory(appliedFilters.category);
    setCurrentFilterLocation(appliedFilters.location);
    setCurrentFilterMinRating(appliedFilters.rating);
    setCurrentFilterMaxRate(appliedFilters.rate);
  }, [appliedFilters]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({
      category: currentFilterCategory,
      location: currentFilterLocation,
      rating: currentFilterMinRating,
      rate: currentFilterMaxRate,
    });
    setIsSheetOpen(false); 
  }, [currentFilterCategory, currentFilterLocation, currentFilterMinRating, currentFilterMaxRate]);


  const filteredFacilities = dummySportsFacilities.filter(facility => {
    const isSportsFacilityCategory = facility.category === 'Instalación Deportiva';
    const matchesCategory = appliedFilters.category === 'Todos' || typeMatchesFilter(facility.type, appliedFilters.category);
    const matchesLocation = appliedFilters.location === '' || facility.location.toLowerCase().includes(appliedFilters.location.toLowerCase());
    const matchesRating = facility.rating >= appliedFilters.rating;
    const matchesRate = facility.rate <= appliedFilters.rate;
    const matchesSearch = searchQuery === '' ||
                          facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          facility.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (facility.amenities && facility.amenities.some(amenity => amenity.toLowerCase().includes(searchQuery.toLowerCase())));

    return isSportsFacilityCategory && matchesCategory && matchesLocation && matchesRating && matchesRate && matchesSearch;
  });

  const toggleFavorite = (itemId: string) => {
    setFavoritedItems(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="flex flex-col h-full">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4 sm:px-6 flex-shrink-0">
            <h1 className="text-lg font-semibold mr-auto">Espacios Deportivos</h1>

            <div className="relative w-full max-w-xs sm:max-w-sm ml-auto">
                <Input
                    type="search"
                    placeholder="Buscar espacios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-md shadow-sm pr-10 h-9 text-sm w-full"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0 h-9 text-xs px-3">
                      <Filter className="mr-2 h-4 w-4" /> Filtros
                  </Button>
              </SheetTrigger>
              <SheetContent className="p-0 w-[85%] sm:w-[320px] flex flex-col">
                  <SheetHeader className="p-4 border-b">
                      <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="flex-grow">
                      <FiltersContent
                          currentFilterCategory={currentFilterCategory} setCurrentFilterCategory={setCurrentFilterCategory}
                          currentFilterLocation={currentFilterLocation} setCurrentFilterLocation={setCurrentFilterLocation}
                          currentFilterMinRating={currentFilterMinRating} setCurrentFilterMinRating={setCurrentFilterMinRating}
                          currentFilterMaxRate={currentFilterMaxRate} setCurrentFilterMaxRate={setCurrentFilterMaxRate}
                          onApplyFilters={handleApplyFilters}
                      />
                  </ScrollArea>
              </SheetContent>
           </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {filteredFacilities.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {filteredFacilities.map(facility => (
                <Card key={facility.id} className="flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-card">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                            src={facility.image || `https://picsum.photos/400/300?random=${facility.id}`}
                            alt={facility.name}
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint={facility.dataAiHint}
                        />
                    </div>
                    <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex-grow">
                                <CardTitle className="text-lg font-semibold">
                                    {facility.name}
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground line-clamp-1">{facility.type}</CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive flex-shrink-0 -mt-1 -mr-1"
                              onClick={() => toggleFavorite(facility.id)}
                              aria-label={favoritedItems.has(facility.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
                            >
                              <Heart className={cn("h-5 w-5", favoritedItems.has(facility.id) && "fill-destructive text-destructive")} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow p-4 pt-0 space-y-1.5">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {facility.description}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                            <span>{facility.location}</span>
                        </div>
                        {facility.amenities && facility.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                                {facility.amenities.slice(0,3).map(amenity => (
                                    <Badge key={amenity} variant="secondary" className="text-xs">{amenity}</Badge>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                            <span className="font-semibold text-foreground">{facility.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({facility.reviews} reseñas)</span>
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-2 border-t mt-auto bg-muted/30">
                        <div className="flex justify-between items-center w-full">
                             <p className="text-sm">
                                Tarifa: <span className="font-bold text-lg text-primary">${facility.rate.toLocaleString('es-CO')}</span>
                                {HOURLY_RATE_CATEGORIES.includes('Instalación Deportiva') ? <span className="text-xs text-muted-foreground">/hr</span> : ''}
                            </p>
                            <Button size="sm" className="h-8 text-xs sm:text-sm">Ver Detalles</Button>
                        </div>
                    </CardFooter>
              </Card>
            ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center p-8 border rounded-lg bg-card mt-6">
            <Search className="h-12 w-12 mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No se encontraron espacios deportivos</p>
            <p className="text-sm">Intenta ajustar tu búsqueda o los filtros.</p>
            </div>
        )}
        </main>
    </div>
  );
};

const FindTalents = () => {
  return (
     <AppLayout>
       <FindTalentsContent />
       <Toaster />
     </AppLayout>
  );
};

export default FindTalents;
