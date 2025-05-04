
"use client";

import type React from 'react';
import { useState } from 'react'; // Removed useEffect as it's not used directly here
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'; // Added SheetClose
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';


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
];

// Available categories for filtering - kept as is
const categories = [
  'Todos', 'Instalación Deportiva', 'Entrenador Personal', 'Tecnología', 'Profesores', 'Contratista', 'Diseñadores', 'Mantenimiento Hogar', 'Marketing Digital', 'Video & Animación', 'Redacción & Traducción', 'Música & Audio', 'Finanzas', 'Crecimiento Personal', 'Datos', 'Fotografía',
];


const FindTalentsContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [locationFilter, setLocationFilter] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxRate, setMaxRate] = useState<number>(200); // Example max rate
  const [isFiltersOpen, setIsFiltersOpen] = useState(false); // For mobile filters sheet

  // Filter logic - kept as is
  const filteredTalents = dummyTalents.filter(talent => {
    const matchesCategory = selectedCategory === 'Todos' || talent.category === selectedCategory;
    const matchesSearch = talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          talent.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = locationFilter === '' || talent.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesRating = talent.rating >= minRating;
    const matchesRate = talent.rate <= maxRate;

    return matchesCategory && matchesSearch && matchesLocation && matchesRating && matchesRate;
  });

  // Component for rendering filters content (used in sidebar and mobile sheet)
  // Removed the `isMobile` prop as the button is removed
  const FiltersContent = () => (
     <div className="space-y-6 p-4 md:p-0"> {/* Adjusted padding */}
         <div>
           <Label htmlFor="category-filter" className="text-sm font-medium">Categoría</Label> {/* Styled label */}
           <Select value={selectedCategory} onValueChange={setSelectedCategory}>
             <SelectTrigger id="category-filter" className="w-full mt-1 h-9 rounded-md text-xs sm:text-sm"> {/* Adjusted size and text */}
               <SelectValue placeholder="Seleccionar Categoría" />
             </SelectTrigger>
             <SelectContent>
               {categories.map(cat => (
                 <SelectItem key={cat} value={cat}>{cat}</SelectItem>
               ))}
             </SelectContent>
           </Select>
         </div>

         <div>
           <Label htmlFor="location-filter" className="text-sm font-medium">Ubicación</Label> {/* Styled label */}
           <div className="relative mt-1">
             <Input
               id="location-filter"
               type="text"
               placeholder="Ciudad o Remoto"
               value={locationFilter}
               onChange={(e) => setLocationFilter(e.target.value)}
               className="pl-8 h-9 rounded-md text-xs sm:text-sm" // Adjusted size and text
             />
              <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           </div>
         </div>

          <div>
             <Label htmlFor="rating-filter" className="text-sm font-medium">Valoración Mínima ({minRating.toFixed(1)})</Label> {/* Styled label */}
              <div className="flex items-center gap-2 mt-1">
                 <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" /> {/* Added flex-shrink-0 */}
                 <Slider
                     id="rating-filter"
                     min={0}
                     max={5}
                     step={0.1}
                     value={[minRating]}
                     onValueChange={(value) => setMinRating(value[0])}
                     className="w-full"
                 />
             </div>
         </div>
          <div>
             <Label htmlFor="rate-filter" className="text-sm font-medium">Tarifa Máxima (${maxRate}/hr)</Label> {/* Styled label */}
             <Slider
                 id="rate-filter"
                 min={0}
                 max={200} // Adjust max rate as needed
                 step={5}
                 value={[maxRate]}
                 onValueChange={(value) => setMaxRate(value[0])}
                 className="w-full mt-1"
             />
         </div>

         {/* Removed the conditional "Mostrar Resultados" button */}
     </div>
  );


  return (
    <div className="flex flex-col h-full">
        {/* Search Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 md:p-6 flex flex-col md:flex-row items-center gap-2 md:gap-4"> {/* Adjusted gap */}
            <h1 className="text-xl md:text-2xl font-semibold hidden md:block mr-4">Buscar Talento</h1> {/* Adjusted size */}
            <div className="relative w-full md:flex-1">
                <Input
                type="search"
                placeholder="Buscar por nombre, título o habilidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                 className="rounded-md shadow-sm pr-10 h-9 md:h-10 w-full text-xs sm:text-sm" // Adjusted size and text
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" /> {/* Adjusted size */}
            </div>
             {/* Filters Trigger */}
             <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                 <SheetTrigger asChild>
                    <Button variant="outline" className="w-full mt-2 md:mt-0 md:w-auto flex-shrink-0 h-9 md:h-10 text-xs sm:text-sm px-3 md:px-4"> {/* Adjusted size, text, padding */}
                       <Filter className="mr-2 h-4 w-4" /> Filtros
                     </Button>
                 </SheetTrigger>
                 {/* Sheet content for mobile */}
                 <SheetContent side="left" className="w-[280px] p-0 md:hidden"> {/* Adjusted width, hide on md+, padding removed */}
                    <SheetHeader className='p-4 border-b'>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100%-4rem)]"> {/* Adjust height based on header */}
                        <FiltersContent /> {/* Render filters without props */}
                    </ScrollArea>
                 </SheetContent>
            </Sheet>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden md:block w-64 lg:w-72 border-r p-4 lg:p-6 overflow-y-auto flex-shrink-0 bg-muted/40"> {/* Added background */}
                <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                 <FiltersContent /> {/* Render filters */}
            </aside>

            {/* Talent Results Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {filteredTalents.length > 0 ? (
                 <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> {/* Responsive grid */}
                    {filteredTalents.map(talent => (
                    <Card key={talent.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
                         <CardHeader className="flex flex-row items-start gap-3 p-4"> {/* Reduced gap */}
                            <Avatar className="h-12 w-12 border flex-shrink-0"> {/* Adjusted size */}
                                <AvatarImage src={talent.image} alt={talent.name} data-ai-hint={talent.dataAiHint} />
                                <AvatarFallback>{talent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                             <div className="flex-1 min-w-0"> {/* Added min-w-0 for text wrap */}
                                <CardTitle className="text-base md:text-lg truncate">{talent.name}</CardTitle> {/* Added truncate */}
                                <CardDescription className="text-xs sm:text-sm line-clamp-2">{talent.title}</CardDescription> {/* Added line-clamp */}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                   <MapPin className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{talent.location}</span> {/* Added truncate */}
                                </div>
                             </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-3 flex-grow space-y-2"> {/* Added space-y */}
                             <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                <span className="font-semibold text-sm">{talent.rating.toFixed(1)}</span>
                                <span className="text-xs text-muted-foreground">({talent.reviews} reseñas)</span>
                             </div>
                            <div className="flex flex-wrap gap-1">
                                {talent.skills.slice(0, 3).map(skill => ( // Limit visible skills
                                <Badge key={skill} variant="secondary" className="text-xs font-normal">{skill}</Badge> // Adjusted font weight
                                ))}
                                {talent.skills.length > 3 && <Badge variant="outline" className="text-xs font-normal">+{talent.skills.length - 3}</Badge>} {/* Adjusted font weight */}
                            </div>
                            <p className="text-sm text-muted-foreground pt-1"> {/* Added padding-top */}
                                Tarifa: <span className="font-medium text-foreground">${talent.rate}</span> / hora
                            </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                             <Button size="sm" className="w-full h-9 text-xs sm:text-sm">Ver Perfil</Button> {/* Adjusted size */}
                        </CardFooter>
                    </Card>
                    ))}
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-8">
                    <Search className="h-12 w-12 mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No se encontraron talentos</p>
                    <p className="text-sm">Intenta ajustar tus filtros o términos de búsqueda.</p>
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
     </AppLayout>
  );
};

export default FindTalents;


    