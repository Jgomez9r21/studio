"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';


// Dummy talent data
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

// Available categories for filtering (reuse from other pages if possible)
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

  // Filter logic
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

  const FiltersContent = () => (
     <div className="space-y-6 p-4 md:p-0">
         <div>
           <Label htmlFor="category-filter">Categoría</Label>
           <Select value={selectedCategory} onValueChange={setSelectedCategory}>
             <SelectTrigger id="category-filter" className="w-full mt-1">
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
           <Label htmlFor="location-filter">Ubicación</Label>
           <div className="relative mt-1">
             <Input
               id="location-filter"
               type="text"
               placeholder="Ciudad o Remoto"
               value={locationFilter}
               onChange={(e) => setLocationFilter(e.target.value)}
               className="pl-8"
             />
              <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           </div>
         </div>

          <div>
             <Label htmlFor="rating-filter">Valoración Mínima ({minRating.toFixed(1)})</Label>
              <div className="flex items-center gap-2 mt-1">
                 <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
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
             <Label htmlFor="rate-filter">Tarifa Máxima (${maxRate}/hr)</Label>
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

         <Button onClick={() => {
             // Reset filters (optional)
             // setSelectedCategory('Todos');
             // setLocationFilter('');
             // setMinRating(0);
             // setMaxRate(200);
             setIsFiltersOpen(false); // Close sheet after applying/viewing
         }} className="w-full md:hidden">
             Mostrar Resultados
         </Button>
     </div>
  );


  return (
    <div className="flex flex-col h-full">
        {/* Search Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 md:p-6 flex flex-col md:flex-row items-center gap-4">
            <h1 className="text-2xl font-semibold hidden md:block">Buscar Talento</h1>
            <div className="relative w-full md:flex-1">
                <Input
                type="search"
                placeholder="Buscar por nombre, título o habilidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-md shadow-sm pr-10 h-10 w-full"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
             {/* Mobile Filters Trigger */}
             <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                 <SheetTrigger asChild>
                    <Button variant="outline" className="md:hidden w-full">
                       <Filter className="mr-2 h-4 w-4" /> Filtros
                     </Button>
                 </SheetTrigger>
                 <SheetContent side="left" className="w-full max-w-xs p-0">
                    <SheetHeader className='p-4 border-b'>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100%-4rem)]"> {/* Adjust height based on header */}
                        <FiltersContent />
                    </ScrollArea>
                 </SheetContent>
            </Sheet>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden md:block w-64 lg:w-72 border-r p-4 lg:p-6 overflow-y-auto flex-shrink-0">
                <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                 <FiltersContent />
            </aside>

            {/* Talent Results Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {filteredTalents.length > 0 ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredTalents.map(talent => (
                    <Card key={talent.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <CardHeader className="flex flex-row items-start gap-4 p-4">
                            <Avatar className="h-16 w-16 border">
                                <AvatarImage src={talent.image} alt={talent.name} data-ai-hint={talent.dataAiHint} />
                                <AvatarFallback>{talent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                             <div className="flex-1">
                                <CardTitle className="text-lg">{talent.name}</CardTitle>
                                <CardDescription className="text-sm">{talent.title}</CardDescription>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                   <MapPin className="h-3 w-3" /> {talent.location}
                                </div>
                             </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-3 flex-grow">
                             <div className="flex items-center gap-1 mb-2">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-semibold">{talent.rating.toFixed(1)}</span>
                                <span className="text-xs text-muted-foreground">({talent.reviews} reseñas)</span>
                             </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                                {talent.skills.slice(0, 4).map(skill => ( // Limit visible skills
                                <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                                ))}
                                {talent.skills.length > 4 && <Badge variant="outline">+{talent.skills.length - 4}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Tarifa: <span className="font-medium text-foreground">${talent.rate}</span> / hora
                            </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                             <Button className="w-full">Ver Perfil</Button>
                             {/* Add contact/booking button later */}
                        </CardFooter>
                    </Card>
                    ))}
                </div>
                ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    No se encontraron talentos con esos criterios.
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
