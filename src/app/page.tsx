"use client";

import {useEffect, useState} from 'react';
import {getServiceListings, ServiceListing} from '@/services/service-listings';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {ScrollArea} from "@/components/ui/scroll-area"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Textarea} from "@/components/ui/textarea"
import {Label} from "@/components/ui/label"
import {toast} from "@/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {Calendar} from "@/components/ui/calendar"
import {cn} from "@/lib/utils"
import {format} from "date-fns"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Search, Menu} from "lucide-react"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {Checkbox} from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {Home, Users, Settings, CreditCard, UserPlus, Briefcase} from "lucide-react";
import {usePathname} from 'next/navigation';
import {BarChart, Camera, Edit, Music, DollarSign, Bot, Leaf, Lightbulb, Database, Image, User, Code, Construction, School2} from "lucide-react";

const categorias = [
  {name: 'Todos', icon: null},
  {name: 'Deporte', icon: Leaf},
  {name: 'Tecnología', icon: Code},
  {name: 'Entrenador Personal', icon: User},
  {name: 'Contratista', icon: Construction},
  {name: 'Profesores', icon: School2},
  {name: 'Marketing Digital', icon: BarChart},
  {name: 'Video & Animación', icon: Camera},
  {name: 'Redacción & Traducción', icon: Edit},
  {name: 'Música & Audio', icon: Music},
  {name: 'Negocios', icon: Briefcase},
  {name: 'Finanzas', icon: DollarSign},
  {name: 'Servicios de IA', icon: Bot},
  {name: 'Crecimiento Personal', icon: Lightbulb},
  {name: 'Datos', icon: Database},
  {name: 'Fotografía', icon: Image},
];

const rappiCategories = [
  {name: 'Restaurantes', imageUrl: 'https://picsum.photos/200/150', color: '#FF5733'},
  {name: 'Mercados', imageUrl: 'https://picsum.photos/200/150', color: '#33FF57'},
  {name: 'Farmacia', imageUrl: 'https://picsum.photos/200/150', color: '#3390FF'},
  {name: 'Tiendas', imageUrl: 'https://picsum.photos/200/150', color: '#FF33E9'},
  {name: 'Turbo', imageUrl: 'https://picsum.photos/200/150', color: '#33FFBD'},
  {name: 'Licores', imageUrl: 'https://picsum.photos/200/150', color: '#FFBD33'},
  {name: 'Rappi Travel', imageUrl: 'https://picsum.photos/200/150', color: '#33A2FF'},
  {name: 'SOAT', imageUrl: 'https://picsum.photos/200/150', color: '#FFDD33'},
];

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

function LandingPageContent() {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const pathname = usePathname();
  const {isMobile} = useSidebar();

  useEffect(() => {
    const fetchListings = async () => {
      const data = await getServiceListings();
      setListings(data);
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing =>
    (selectedCategory === 'Todos' || listing.category === selectedCategory) &&
    (listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Hero Section */}
      <section className="mb-6 flex flex-col items-center justify-center text-center">
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
            className="rounded-md shadow-sm focus-visible:ring-2 focus-visible:ring-primary pr-10"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground"/>
        </div>
      </section>

      {/* Rappi-like Categories */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">¿Necesitas algo más?</h2>
        <div className="flex items-center justify-start space-x-4 overflow-x-auto">
          {rappiCategories.map((category) => (
            <div key={category.name} className="relative w-48 h-48 rounded-md shadow-md overflow-hidden flex-shrink-0">
              <div
                className="absolute inset-0"
                style={{backgroundColor: category.color, opacity: 0.7}}
              ></div>
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-32 object-cover relative z-10"
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-center relative z-10">
                {category.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Tabs */}
      <Tabs defaultValue="todos" className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="inline-flex gap-1 p-1 bg-muted rounded-md shadow-sm">
            {categorias.map(category => (
              <TabsTrigger
                key={category.name}
                value={category.name.toLowerCase()}
                onClick={() => setSelectedCategory(category.name)}
                className="data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                {category.icon && <category.icon className="w-4 h-4 mr-2"/>}
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {/* Service Listings */}
        {categorias.map(category => (
          <TabsContent value={category.name.toLowerCase()} key={category.name} className="mt-8">
            <ScrollArea className="h-[600px] w-full rounded-md border shadow-sm">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map(listing => (
                  <Card key={listing.id}>
                    <CardHeader>
                      <CardTitle>
                        {listing.title}
                      </CardTitle>
                      <CardDescription>{listing.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>
                        {listing.description}
                      </p>
                      <p>
                        Tarifa: ${listing.rate}/hr
                      </p>
                      <p>
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
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="name">Nombre</Label>
                              <Input id="name" value="John Doe"
                                     className="col-span-3 rounded-md shadow-sm focus-visible:ring-2 focus-visible:ring-primary"/>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="date">Seleccionar Fecha</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-[240px] justify-start text-left font-normal",
                                      !date && "text-muted-foreground"
                                    )}
                                  >
                                    <Calendar className="mr-2 h-4 w-4"/>
                                    {date ? format(date, "PPP") : <span>Elige una fecha</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={(date) =>
                                      date < new Date()
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="comment">Comentario</Label>
                              <Textarea id="comment"
                                        className="col-span-3 rounded-md shadow-sm focus-visible:ring-2 focus-visible:ring-primary"/>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">
                              Realizar
                              solicitud de reserva
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

export default function LandingPage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="w-60">
          <SidebarHeader>
            <Avatar className="ml-2">
              <AvatarImage src="https://picsum.photos/50/50" alt="Avatar"/>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h3 className="ml-3 font-bold">SkillHub Connect</h3>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navegacion.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton href={item.href}>
                    <item.icon className="h-4 w-4"/>
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            © {new Date().getFullYear()} SkillHub Connect
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 overflow-auto p-4">
          <LandingPageContent />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

