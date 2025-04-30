
"use client";

import type { ComponentProps, ReactNode } from "react";
import { useEffect, useState } from 'react';
import type { ServiceListing} from '@/services/service-listings';
import { getServiceListings } from '@/services/service-listings';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Added ScrollBar
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, Menu } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Users, Settings, CreditCard, UserPlus, Briefcase } from "lucide-react";
import { usePathname } from 'next/navigation';
import {
  BarChart,
  Camera,
  Edit,
  Music,
  DollarSign,
  Bot,
  Leaf,
  Lightbulb,
  Database,
  Image as ImageIcon, // Renamed to avoid conflict with Image component
  User,
  Code,
  Construction,
  School2,
  Dumbbell,
  Palette,
  HomeIcon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel" // Added Carousel imports

// Define Category types with explicit icon typing
interface Category {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Service Categories
const categorias: Category[] = [
  { name: 'Todos' },
  { name: 'Deporte', icon: Dumbbell },
  { name: 'Tecnología', icon: Code },
  { name: 'Entrenador Personal', icon: User },
  { name: 'Contratista', icon: Construction },
  { name: 'Mantenimiento Hogar', icon: HomeIcon },
  { name: 'Profesores', icon: School2 },
  { name: 'Diseñadores', icon: Palette },
  { name: 'Marketing Digital', icon: BarChart },
  { name: 'Video & Animación', icon: Camera },
  { name: 'Redacción & Traducción', icon: Edit },
  { name: 'Música & Audio', icon: Music },
  { name: 'Negocios', icon: Briefcase },
  { name: 'Finanzas', icon: DollarSign },
  { name: 'Servicios de IA', icon: Bot },
  { name: 'Crecimiento Personal', icon: Lightbulb },
  { name: 'Datos', icon: Database },
  { name: 'Fotografía', icon: ImageIcon },
];

// Navigation Items
const navegacion = [
  {
    title: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    title: "Buscar Talento",
    href: "/find-talents",
    icon: Users,
  },
  {
    title: "Publicar un Trabajo",
    href: "/post-job",
    icon: UserPlus,
  },
  {
    title: "Reservar un Servicio",
    href: "/book-service",
    icon: Briefcase,
  },
  {
    title: "Facturación",
    href: "/billing",
    icon: CreditCard,
  },
  {
    title: "Configuración",
    href: "/settings",
    icon: Settings,
  },
];

// Featured Services for Carousel
const featuredServices = [
  { id: 'f1', title: 'Desarrollo Web Completo', description: 'Sitios web modernos y optimizados.', category: 'Tecnología', image: 'https://picsum.photos/400/300?random=1' },
  { id: 'f2', title: 'Entrenamiento Funcional', description: 'Mejora tu fuerza y resistencia.', category: 'Deporte', image: 'https://picsum.photos/400/300?random=2' },
  { id: 'f3', title: 'Diseño de Logotipos Impactantes', description: 'Crea una identidad visual única.', category: 'Diseñadores', image: 'https://picsum.photos/400/300?random=3' },
  { id: 'f4', title: 'Clases de Inglés Conversacional', description: 'Aprende a comunicarte con fluidez.', category: 'Profesores', image: 'https://picsum.photos/400/300?random=4' },
  { id: 'f5', title: 'Reparaciones Eléctricas Urgentes', description: 'Soluciones rápidas y seguras.', category: 'Mantenimiento Hogar', image: 'https://picsum.photos/400/300?random=5' },
];

// Main Content Component
function LandingPageContent() {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const pathname = usePathname();


  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getServiceListings();
        const updatedData = data.map(listing => ({
          ...listing,
          category: categorias.find(cat => cat.name === listing.category) ? listing.category : 'Otros'
        }));
        setListings(updatedData);
      } catch (error) {
        console.error("Failed to fetch service listings:", error);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing =>
    (selectedCategory === 'Todos' || listing.category === selectedCategory) &&
    (listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Hero Section */}
      <section className="mb-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Encuentra el proveedor de servicios perfecto
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Reserva servicios locales con facilidad.
        </p>
        <div className="relative mt-4 w-full max-w-md">
          <Input
            type="search"
            placeholder="Buscar servicios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md shadow-sm pr-10 h-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </section>

      {/* Featured Services Carousel */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Servicios Destacados</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {featuredServices.map((service) => (
              <CarouselItem key={service.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="flex aspect-video items-center justify-center p-0 relative">
                       <img src={service.image} alt={service.title} className="object-cover w-full h-full" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                       <div className="absolute bottom-0 left-0 p-4">
                         <CardTitle className="text-lg font-semibold text-white mb-1">{service.title}</CardTitle>
                         <CardDescription className="text-sm text-primary-foreground/80">{service.description}</CardDescription>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
        </Carousel>
      </section>


      {/* Category Tabs & Service Listings */}
      <Tabs defaultValue="todos" className="w-full">
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <TabsList className="inline-flex gap-1 p-1 bg-muted rounded-md shadow-sm">
            {categorias.map(category => (
              <TabsTrigger
                key={category.name}
                value={category.name.toLowerCase().replace(/[^a-z0-9]/g, '')}
                onClick={() => setSelectedCategory(category.name)}
                className="data-[state=active]:bg-background data-[state=active]:text-foreground px-3 py-1.5 text-sm"
              >
                {category.icon && <category.icon className="w-4 h-4 mr-2 flex-shrink-0" />}
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Render content for the selected category */}
        <TabsContent value={selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '')} className="mt-8">
          <ScrollArea className="h-[600px] w-full rounded-md border shadow-sm p-4">
            {filteredListings.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map(listing => (
                  <Card key={listing.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        {listing.title}
                      </CardTitle>
                      <CardDescription>{listing.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <p className="text-sm text-muted-foreground mb-2 flex-grow">
                        {listing.description}
                      </p>
                      <p className="text-sm font-medium mb-1">
                        Tarifa: ${listing.rate}/hr
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
                            <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                              <Label htmlFor={`name-${listing.id}`} className="text-right">Nombre</Label>
                              <Input id={`name-${listing.id}`} defaultValue="John Doe"
                                     className="rounded-md shadow-sm"/>
                            </div>
                             <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                              <Label htmlFor={`date-${listing.id}`} className="text-right">Seleccionar Fecha</Label>
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
                                    {date ? format(date, "PPP") : <span>Elige una fecha</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                             <div className="grid grid-cols-[1fr_3fr] items-center gap-4">
                                <Label htmlFor={`time-${listing.id}`} className="text-right">
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
                            <div className="grid grid-cols-[1fr_3fr] items-start gap-4">
                              <Label htmlFor={`comment-${listing.id}`} className="text-right pt-1.5">Comentario</Label>
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

// Main Page Component wrapping content with SidebarProvider
export default function Page() {
  return (
     <SidebarProvider>
         <LandingPage/>
     </SidebarProvider>
  );
}


// Layout Component that uses the sidebar context
function LandingPage() {
    const { isMobile } = useSidebar(); // Correctly call useSidebar within SidebarProvider's descendant

    return (
       <div className="flex min-h-screen">
         <Sidebar className="w-60 hidden md:flex"> {/* Hide sidebar on mobile initially */}
           <SidebarHeader className="p-4 border-b flex items-center">
             <Avatar className="h-8 w-8">
               <AvatarImage src="https://picsum.photos/50/50" alt="SkillHub Connect Logo" />
               <AvatarFallback>SC</AvatarFallback>
             </Avatar>
             <h3 className="ml-3 font-bold text-lg">SkillHub Connect</h3>
           </SidebarHeader>
           <SidebarContent className="flex-grow p-2">
             <SidebarMenu>
               {navegacion.map((item) => (
                 <SidebarMenuItem key={item.title}>
                   <SidebarMenuButton href={item.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
                     <item.icon className="h-4 w-4"/>
                     <span>{item.title}</span>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
               ))}
             </SidebarMenu>
           </SidebarContent>
           <SidebarFooter className="p-4 border-t text-xs text-muted-foreground">
             © {new Date().getFullYear()} SkillHub Connect
           </SidebarFooter>
         </Sidebar>

         <SidebarInset className="flex-1 overflow-y-auto">
           {/* Mobile Header with Sidebar Trigger */}
           <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
             <h3 className="font-semibold text-lg">SkillHub Connect</h3>
             <SidebarTrigger>
               <Menu className="h-6 w-6" />
             </SidebarTrigger>
           </header>
           <main>
             <LandingPageContent />
           </main>
         </SidebarInset>

         {/* Mobile Sidebar (Sheet) */}
         <Sidebar className="md:hidden"> {/* Only renders Sheet on mobile */}
           <SidebarHeader className="p-4 border-b flex items-center">
             <Avatar className="h-8 w-8">
               <AvatarImage src="https://picsum.photos/50/50" alt="SkillHub Connect Logo" />
               <AvatarFallback>SC</AvatarFallback>
             </Avatar>
             <h3 className="ml-3 font-bold text-lg">SkillHub Connect</h3>
           </SidebarHeader>
           <SidebarContent className="flex-grow p-2">
             <SidebarMenu>
               {navegacion.map((item) => (
                 <SidebarMenuItem key={item.title}>
                   <SidebarMenuButton href={item.href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
                     <item.icon className="h-4 w-4"/>
                     <span>{item.title}</span>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
               ))}
             </SidebarMenu>
           </SidebarContent>
           <SidebarFooter className="p-4 border-t text-xs text-muted-foreground">
             © {new Date().getFullYear()} SkillHub Connect
           </SidebarFooter>
         </Sidebar>
       </div>
    );
}

    