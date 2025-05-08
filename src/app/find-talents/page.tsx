"use client";

import type React from 'react';
import { useState, useEffect } from 'react'; // Added useEffect
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, Filter, BarChart, Camera, Code, Construction, Database, DollarSign, Dumbbell, Edit, HomeIcon as LucideHomeIcon, ImageIcon, Lightbulb, Music, Palette, School2, User } from 'lucide-react'; // Added category icons
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Added ScrollArea and ScrollBar
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs components
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

// Define Category types with explicit icon typing
interface Category {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}


// Available categories for filtering - updated to match home page
const categorias: Category[] = [
    { name: 'Todos' },
    { name: 'Instalación Deportiva', icon: Dumbbell },
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



const FindTalentsContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos'); // Default to 'Todos'
  // Removed locationFilter, minRating, maxRate, isFiltersOpen as they are not used with Tabs UI

  // Filter logic adapted for Tabs
  const filteredTalents = dummyTalents.filter(talent => {
    const matchesCategory = selectedCategory === 'Todos' || talent.category === selectedCategory;
    const matchesSearch = searchQuery === '' || // Show all if search is empty
                          talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          talent.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });


  return (
    <div className="flex flex-col h-full">
      {/* Talent Results Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {/* Search Input */}
        <div className="mb-6 relative w-full max-w-xl mx-auto">
          <Input
            type="search"
            placeholder="Buscar por nombre, título o habilidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md shadow-sm pr-10 h-10 w-full text-sm"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue={selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '')} className="w-full mb-6">
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

          {/* Content area for the selected tab (renders the talent list) */}
          <TabsContent value={selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '')} className="mt-6">
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
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center p-8 border rounded-lg bg-card">
                  <Search className="h-12 w-12 mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No se encontraron talentos</p>
                  <p className="text-sm">Intenta ajustar tu búsqueda o seleccionar otra categoría.</p>
                </div>
              )}
          </TabsContent>
        </Tabs>
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
