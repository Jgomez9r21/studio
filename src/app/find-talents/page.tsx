
"use client";

import type React from 'react';
import { useState, useEffect } from 'react'; // Added useEffect
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, Filter, X } from 'lucide-react'; // Added Filter, X; Removed category specific icons
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster"; // Added Toaster
import { Label } from "@/components/ui/label"; // Added Label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select components
import { Slider } from "@/components/ui/slider"; // Added Slider
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"; // Added Sheet components


// Define Category types - Simplified
interface Category {
  name: string;
}

// Available categories for filtering - simplified for Select dropdown
const categorias: Category[] = [
    { name: 'Todos' },
    { name: 'Instalación Deportiva'},
    { name: 'Tecnología' },
    { name: 'Entrenador Personal' },
    { name: 'Contratista' },
    { name: 'Mantenimiento Hogar'},
    { name: 'Profesores' },
    { name: 'Diseñadores' },
    { name: 'Marketing Digital' },
    { name: 'Video & Animación'},
    { name: 'Redacción & Traducción'},
    { name: 'Música & Audio'},
    { name: 'Finanzas'},
    { name: 'Crecimiento Personal'},
    { name: 'Datos'},
    { name: 'Fotografía'},
];


// Dummy talent data - kept as is
const dummyTalents = [
  {
    id: 't1',
    name: 'Ana García',
    title: 'Entrenadora Personal Certificada',
    location: 'Ciudad Central',
    rate: 55, // Per hour
    rating: 4.8,
    reviews: 32,
    category: 'Entrenador Personal',
    skills: ['Pérdida de Peso', 'Entrenamiento de Fuerza', 'Nutrición Deportiva'],
    image: 'https://picsum.photos/100/100?random=t1',
    dataAiHint: "personal trainer fitness woman"
  },
  {
    id: 't2',
    name: 'Carlos Rodriguez',
    title: 'Desarrollador Web Full-Stack',
    location: 'Remoto',
    rate: 70, // Per hour
    rating: 4.9,
    reviews: 45,
    category: 'Tecnología',
    skills: ['React', 'Node.js', 'TypeScript', 'Bases de Datos SQL'],
    image: 'https://picsum.photos/100/100?random=t2',
    dataAiHint: "web developer man code"
  },
   {
    id: 't3',
    name: 'Elena Martínez',
    title: 'Profesora de Inglés (Nativos)',
    location: 'Online',
    rate: 40, // Per hour
    rating: 4.7,
    reviews: 28,
    category: 'Profesores',
    skills: ['Inglés Conversacional', 'Preparación TOEFL', 'Inglés de Negocios'],
    image: 'https://picsum.photos/100/100?random=t3',
    dataAiHint: "english teacher woman online"
  },
   {
    id: 't4',
    name: 'Javier López',
    title: 'Contratista General - Remodelaciones',
    location: 'Zona Norte',
    rate: 85, // Can be project based too
    rating: 4.6,
    reviews: 19,
    category: 'Contratista',
    skills: ['Remodelación de Cocinas', 'Baños', 'Ampliaciones', 'Pintura'],
    image: 'https://picsum.photos/100/100?random=t4',
    dataAiHint: "general contractor man construction"
  },
   {
    id: 't5',
    name: 'Sofía Fernández',
    title: 'Diseñadora Gráfica & Branding',
    location: 'Remoto',
    rate: 65, // Per hour
    rating: 4.9,
    reviews: 51,
    category: 'Diseñadores',
    skills: ['Logotipos', 'Identidad Visual', 'Diseño Web UI/UX', 'Illustrator'],
    image: 'https://picsum.photos/100/100?random=t5',
    dataAiHint: "graphic designer woman creative"
  },
    {
    id: 't6',
    name: 'Ricardo Morales',
    title: 'Experto en Mantenimiento del Hogar',
    location: 'Ciudad Sur',
    rate: 50, // Per hour
    rating: 4.5,
    reviews: 25,
    category: 'Mantenimiento Hogar',
    skills: ['Plomería', 'Electricidad Básica', 'Reparaciones Menores'],
    image: 'https://picsum.photos/100/100?random=t6',
    dataAiHint: "handyman home repair tools"
  },
    // Add more talent examples for different categories if needed
    {
      id: 't7',
      name: 'Laura Gómez',
      title: 'Instructora de Yoga y Pilates',
      location: 'Estudio Sol',
      rate: 45, // Per class/hour
      rating: 4.9,
      reviews: 40,
      category: 'Instalación Deportiva', // Example for sport facility related
      skills: ['Yoga Vinyasa', 'Pilates Mat', 'Meditación Guiada'],
      image: 'https://picsum.photos/100/100?random=t7',
      dataAiHint: "yoga instructor woman studio"
    },
     {
      id: 't8',
      name: 'Miguel Ángel Torres',
      title: 'Especialista en Marketing Digital SEO/SEM',
      location: 'Remoto',
      rate: 75, // Per hour
      rating: 4.8,
      reviews: 38,
      category: 'Marketing Digital',
      skills: ['Optimización SEO', 'Google Ads', 'Marketing de Contenidos', 'Analítica Web'],
      image: 'https://picsum.photos/100/100?random=t8',
      dataAiHint: "marketing specialist man digital"
    },
];

// Component for Filter Controls (used in Sheet and potentially sidebar)
const FiltersContent = ({
    selectedCategory, setSelectedCategory,
    locationFilter, setLocationFilter,
    minRating, setMinRating,
    maxRate, setMaxRate,
    onApplyFilters // Callback to close sheet on mobile
}: {
    selectedCategory: string; setSelectedCategory: (cat: string) => void;
    locationFilter: string; setLocationFilter: (loc: string) => void;
    minRating: number; setMinRating: (rate: number) => void;
    maxRate: number; setMaxRate: (rate: number) => void;
    onApplyFilters: () => void;
}) => {

    return (
     <div className="space-y-6 p-4 h-full flex flex-col"> {/* Added padding and flex layout */}
         {/* Category Select */}
         <div className="space-y-2">
             <Label htmlFor="category-select">Categoría</Label>
             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                 <SelectTrigger id="category-select">
                     <SelectValue placeholder="Selecciona una categoría" />
                 </SelectTrigger>
                 <SelectContent>
                     {categorias.map(category => (
                         <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                     ))}
                 </SelectContent>
             </Select>
         </div>

         {/* Location Input */}
         <div className="space-y-2">
             <Label htmlFor="location-input">Ubicación</Label>
             <div className="relative">
                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                     id="location-input"
                     placeholder="Ciudad o Remoto"
                     value={locationFilter}
                     onChange={(e) => setLocationFilter(e.target.value)}
                     className="pl-9" // Add padding for the icon
                 />
             </div>
         </div>

         {/* Minimum Rating Slider */}
         <div className="space-y-2">
             <Label htmlFor="rating-slider">Valoración Mínima</Label>
              <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                 <Slider
                     id="rating-slider"
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

         {/* Maximum Rate Slider */}
         <div className="space-y-2">
             <Label htmlFor="rate-slider">Tarifa Máxima (${maxRate}/hr)</Label>
             <Slider
                 id="rate-slider"
                 min={0}
                 max={200} // Adjust max rate as needed
                 step={5}
                 value={[maxRate]}
                 onValueChange={(value) => setMaxRate(value[0])}
             />
         </div>

         {/* Spacer to push button to bottom */}
          <div className="flex-grow"></div>

         {/* Close button for mobile sheet - kept outside the immediate form elements for layout */}
          <SheetClose asChild>
              <Button className="w-full" onClick={onApplyFilters}>Mostrar Resultados</Button>{/* Apply filters and close sheet */}
          </SheetClose>
     </div>
    );
};



const FindTalentsContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [locationFilter, setLocationFilter] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxRate, setMaxRate] = useState(200); // Default max rate
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State for mobile filter sheet

  // Filter logic using the state values
  const filteredTalents = dummyTalents.filter(talent => {
    const matchesCategory = selectedCategory === 'Todos' || talent.category === selectedCategory;
    const matchesLocation = locationFilter === '' || talent.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesRating = talent.rating >= minRating;
    const matchesRate = talent.rate <= maxRate;
    const matchesSearch = searchQuery === '' ||
                          talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          talent.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesLocation && matchesRating && matchesRate && matchesSearch;
  });

  // Function to apply filters (used by button in Sheet)
  const handleApplyFilters = () => {
    setIsSheetOpen(false); // Close the sheet
    // Filtering happens automatically based on state change
  };

  return (
    <div className="flex flex-col h-full">

         {/* Top Bar with Search and Filter Button */}
         <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4 sm:px-6">
             <h1 className="text-xl font-semibold mr-auto">Buscar Talento</h1>

             {/* Search Input */}
             <div className="relative w-full max-w-sm sm:max-w-md flex-grow sm:flex-grow-0">
                 <Input
                     type="search"
                     placeholder="Buscar por nombre, título..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="rounded-md shadow-sm pr-10 h-9 text-sm w-full"
                 />
                 <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             </div>

             {/* Mobile Filters Trigger using Sheet */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                      <Button variant="outline" className="flex-shrink-0 h-9 text-xs px-3">
                          <Filter className="mr-2 h-4 w-4" /> Filtros
                      </Button>
                  </SheetTrigger>
                  <SheetContent className="p-0 w-[85%] sm:w-[400px] flex flex-col"> {/* Remove padding, control width */}
                      <SheetHeader className="p-4 border-b">
                          <SheetTitle>Filtros</SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="flex-grow"> {/* Make ScrollArea take remaining height */}
                          <FiltersContent
                              selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                              locationFilter={locationFilter} setLocationFilter={setLocationFilter}
                              minRating={minRating} setMinRating={setMinRating}
                              maxRate={maxRate} setMaxRate={setMaxRate}
                              onApplyFilters={handleApplyFilters}
                          />
                      </ScrollArea>
                  </SheetContent>
              </Sheet>
          </header>


      {/* Talent Results Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

        {/* Talent Grid */}
        {filteredTalents.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> {/* Adjusted grid */}
            {filteredTalents.map(talent => (
              <Card key={talent.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <CardHeader className="flex flex-row items-start gap-3 p-4">
                  <Avatar className="h-12 w-12 border flex-shrink-0">
                    <AvatarImage src={talent.image} alt={talent.name} data-ai-hint={talent.dataAiHint} />
                    <AvatarFallback>{talent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg truncate">{talent.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm line-clamp-2">{talent.title}</CardDescription>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{talent.location}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 flex-grow space-y-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    <span className="font-semibold text-sm">{talent.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({talent.reviews} reseñas)</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {talent.skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs font-normal">{skill}</Badge>
                    ))}
                    {talent.skills.length > 3 && <Badge variant="outline" className="text-xs font-normal">+{talent.skills.length - 3}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground pt-1">
                    Tarifa: <span className="font-medium text-foreground">${talent.rate}</span> / hora
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button size="sm" className="w-full h-9 text-xs sm:text-sm">Ver Perfil</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center p-8 border rounded-lg bg-card mt-6">
            <Search className="h-12 w-12 mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No se encontraron talentos</p>
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
       <Toaster /> {/* Ensure Toaster is included */}
     </AppLayout>
  );
};

export default FindTalents;

