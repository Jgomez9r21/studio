
"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, Filter, X, Heart, Building, Users } from 'lucide-react';
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
import { Dumbbell } from 'lucide-react'; // Specific icon for Gimnasio

// Define Category type
interface Category {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Updated categories for sports facilities
const categoriasDisponibles: Category[] = [
    { name: 'Todos', icon: Building },
    { name: 'Cancha de Fútbol', icon: Building }, // Placeholder, ideally specific icon like a soccer ball
    { name: 'Gimnasio', icon: Dumbbell },
    { name: 'Cancha de Tenis', icon: Building }, // Placeholder, ideally specific icon like a tennis racket/ball
    { name: 'Piscina', icon: Building }, // Placeholder, ideally specific icon for swimming
];

// Define SportsFacility interface
interface SportsFacility {
  id: string;
  name: string; // e.g., "Cancha Sintética El Campín"
  type: string; // e.g., "Fútbol 5", "Gimnasio Completo", "Piscina Semiolímpica", "Canchas de Arcilla"
  location: string;
  rate: number; // Per hour or session
  rating: number;
  reviews: number;
  category: 'Instalación Deportiva'; // Fixed category, used to identify items as sports facilities
  description: string;
  image: string;
  dataAiHint: string; // e.g., "soccer field", "basketball court"
  amenities?: string[];
}

// Dummy sports facility data
const dummySportsFacilities: SportsFacility[] = [
  {
    id: 'sf1',
    name: 'Cancha Sintética "La Bombonera"',
    type: 'Fútbol 5', // Matches 'Cancha de Fútbol'
    location: 'Chapinero Alto, Bogotá',
    rate: 80000,
    rating: 4.7,
    reviews: 25,
    category: 'Instalación Deportiva',
    description: 'Cancha sintética cubierta con iluminación LED y graderías para espectadores. Ideal para partidos amistosos y torneos.',
    image: 'https://picsum.photos/400/300?random=sf1',
    dataAiHint: "soccer field indoor",
    amenities: ['Cubierta', 'Iluminación LED', 'Graderías', 'Baños'],
  },
  {
    id: 'sf2',
    name: 'Gimnasio "Músculos de Acero"',
    type: 'Gimnasio Completo', // Matches 'Gimnasio'
    location: 'Usaquén, Bogotá',
    rate: 15000,
    rating: 4.9,
    reviews: 72,
    category: 'Instalación Deportiva',
    description: 'Gimnasio totalmente equipado con máquinas de última generación, zona de pesas libres y clases grupales.',
    image: 'https://picsum.photos/400/300?random=sf2',
    dataAiHint: "gym fitness equipment",
    amenities: ['Máquinas Cardio', 'Pesas Libres', 'Clases Grupales', 'Vestuarios', 'Duchas'],
  },
  {
    id: 'sf3',
    name: 'Piscina Olímpica "El Tritón"',
    type: 'Piscina Semiolímpica', // Matches 'Piscina'
    location: 'Salitre, Bogotá',
    rate: 25000,
    rating: 4.6,
    reviews: 40,
    category: 'Instalación Deportiva',
    description: 'Piscina climatizada de 25 metros, ideal para natación recreativa y entrenamiento. Carriles disponibles.',
    image: 'https://picsum.photos/400/300?random=sf3',
    dataAiHint: "swimming pool water",
    amenities: ['Climatizada', 'Carriles de Nado', 'Clases de Natación', 'Lockers'],
  },
  {
    id: 'sf4',
    name: 'Canchas de Tenis "El Grand Slam"',
    type: 'Canchas de Arcilla', // Matches 'Cancha de Tenis'
    location: 'Suba, Bogotá',
    rate: 50000,
    rating: 4.8,
    reviews: 33,
    category: 'Instalación Deportiva',
    description: 'Complejo con 4 canchas de tenis de arcilla en excelente estado. Iluminación disponible para juego nocturno.',
    image: 'https://picsum.photos/400/300?random=sf4',
    dataAiHint: "tennis court clay",
    amenities: ['Arcilla', 'Iluminación Nocturna', 'Alquiler de Raquetas', 'Cafetería'],
  },
];

// Component for Filter Controls
const FiltersContent = ({
    currentFilterCategory, setCurrentFilterCategory,
    currentFilterLocation, setCurrentFilterLocation,
    currentFilterMinRating, setCurrentFilterMinRating,
    currentFilterMaxRate, setCurrentFilterMaxRate,
    onApplyFilters,
    isSheet = false
}: {
    currentFilterCategory: string; setCurrentFilterCategory: (cat: string) => void;
    currentFilterLocation: string; setCurrentFilterLocation: (loc: string) => void;
    currentFilterMinRating: number; setCurrentFilterMinRating: (rate: number) => void;
    currentFilterMaxRate: number; setCurrentFilterMaxRate: (rate: number) => void;
    onApplyFilters: () => void;
    isSheet?: boolean;
}) => {
    const buttonText = isSheet ? "Mostrar Resultados" : "Aplicar Filtros";
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
            {isSheet ? (
                <SheetClose asChild>
                    <Button className="w-full" onClick={onApplyFilters}>{buttonText}</Button>
                </SheetClose>
            ) : (
                <Button className="w-full" onClick={onApplyFilters}>{buttonText}</Button>
            )}
         </div>
     </div>
    );
};

const FindTalentsContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [favoritedItems, setFavoritedItems] = useState<Set<string>>(new Set());

  // States for filters currently being edited in the panel
  const [currentFilterCategory, setCurrentFilterCategory] = useState('Todos');
  const [currentFilterLocation, setCurrentFilterLocation] = useState('');
  const [currentFilterMinRating, setCurrentFilterMinRating] = useState(0);
  const [currentFilterMaxRate, setCurrentFilterMaxRate] = useState(200000);

  // States for applied filters used in search results
  const [appliedFilters, setAppliedFilters] = useState({
    category: 'Todos',
    location: '',
    rating: 0,
    rate: 200000,
  });

  // Sync current editing filters with applied filters when appliedFilters change (e.g. initial load)
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
    if (isSheetOpen) {
      setIsSheetOpen(false);
    }
  }, [currentFilterCategory, currentFilterLocation, currentFilterMinRating, currentFilterMaxRate, isSheetOpen, setIsSheetOpen]);


  const filteredFacilities = dummySportsFacilities.filter(facility => {
    const isSportsFacilityCategory = facility.category === 'Instalación Deportiva';

    let matchesTypeFilter = false;
    if (appliedFilters.category === 'Todos') {
        matchesTypeFilter = true;
    } else if (appliedFilters.category === 'Cancha de Fútbol') {
        matchesTypeFilter = facility.type.toLowerCase().includes('fútbol');
    } else if (appliedFilters.category === 'Gimnasio') {
        matchesTypeFilter = facility.type.toLowerCase().includes('gimnasio');
    } else if (appliedFilters.category === 'Cancha de Tenis') {
        matchesTypeFilter = facility.type.toLowerCase().includes('tenis') || facility.type.toLowerCase().includes('arcilla');
    } else if (appliedFilters.category === 'Piscina') {
        matchesTypeFilter = facility.type.toLowerCase().includes('piscina');
    } else {
        matchesTypeFilter = facility.type === appliedFilters.category;
    }
    
    const matchesLocation = appliedFilters.location === '' || facility.location.toLowerCase().includes(appliedFilters.location.toLowerCase());
    const matchesRating = facility.rating >= appliedFilters.rating;
    const matchesRate = facility.rate <= appliedFilters.rate;
    const matchesSearch = searchQuery === '' ||
                          facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          facility.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (facility.amenities && facility.amenities.some(amenity => amenity.toLowerCase().includes(searchQuery.toLowerCase())));

    return isSportsFacilityCategory && matchesTypeFilter && matchesLocation && matchesRating && matchesRate && matchesSearch;
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
    <div className="flex flex-col md:flex-row h-full">
        {/* Desktop Filter Panel */}
        <aside className="hidden md:block w-64 lg:w-72 border-r bg-card p-0">
            <ScrollArea className="h-full">
                 <div className="p-4 border-b sticky top-0 bg-card z-10">
                    <h2 className="text-lg font-semibold">Filtros</h2>
                </div>
                <FiltersContent
                    currentFilterCategory={currentFilterCategory} setCurrentFilterCategory={setCurrentFilterCategory}
                    currentFilterLocation={currentFilterLocation} setCurrentFilterLocation={setCurrentFilterLocation}
                    currentFilterMinRating={currentFilterMinRating} setCurrentFilterMinRating={setCurrentFilterMinRating}
                    currentFilterMaxRate={currentFilterMaxRate} setCurrentFilterMaxRate={setCurrentFilterMaxRate}
                    onApplyFilters={handleApplyFilters}
                    isSheet={false}
                />
            </ScrollArea>
        </aside>

        <div className="flex-1 flex flex-col">
             <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4 sm:px-6 flex-shrink-0">
                <h1 className="text-xl font-semibold mr-auto hidden md:block">Buscar Espacios Deportivos</h1>
                <h1 className="text-lg font-semibold mr-auto md:hidden">Espacios Deportivos</h1>

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

                {/* Mobile Filter Trigger Button */}
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                      <Button variant="outline" className="md:hidden flex-shrink-0 h-9 text-xs px-3">
                          <Filter className="mr-2 h-4 w-4" /> Filtros
                      </Button>
                  </SheetTrigger>
                  <SheetContent className="p-0 w-[85%] sm:w-[320px] flex flex-col">
                      <SheetHeader className="p-4 border-b">
                          <SheetTitle>Filtros</SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="flex-grow"> {/* Ensure ScrollArea takes remaining height */}
                          <FiltersContent
                              currentFilterCategory={currentFilterCategory} setCurrentFilterCategory={setCurrentFilterCategory}
                              currentFilterLocation={currentFilterLocation} setCurrentFilterLocation={setCurrentFilterLocation}
                              currentFilterMinRating={currentFilterMinRating} setCurrentFilterMinRating={setCurrentFilterMinRating}
                              currentFilterMaxRate={currentFilterMaxRate} setCurrentFilterMaxRate={setCurrentFilterMaxRate}
                              onApplyFilters={handleApplyFilters}
                              isSheet={true}
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
                                    {HOURLY_RATE_CATEGORIES.includes(facility.category) ? <span className="text-xs text-muted-foreground">/hr</span> : ''}
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

