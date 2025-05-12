
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar, // Import useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import { Home, Users, Settings, CreditCard, UserPlus, Briefcase, Menu, LogIn, User as UserIcon, CalendarDays, Heart, Info, Dumbbell } from "lucide-react"; // Added Dumbbell
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle as ShadDialogTitle, // Renamed to avoid conflict with SheetTitle if used directly
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, getYear } from "date-fns";
import { es } from 'date-fns/locale';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';


// Navigation Items (centralized)
const navegacion = [
  {
    title: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    title: "Reserva Deportiva",
    href: "/?category=Instalaci%C3%B3n%20Deportiva", // Links to homepage with sports category pre-selected
    icon: Dumbbell, // Changed from Users
  },
  {
    title: "Publica tu Espacio Deportivo",
    href: "/post-job",
    icon: Dumbbell, // Was UserPlus, changed to Dumbbell for consistency
  },
  {
    title: "Mis Reservas",
    href: "/book-service",
    icon: Briefcase,
  },
  {
    title: "Mis Favoritos",
    href: "/favorites",
    icon: Heart,
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


// Dummy country list for signup form
const countries = [
  { code: "AR", name: "Argentina" },
  { code: "BO", name: "Bolivia" },
  { code: "BR", name: "Brasil" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "EC", name: "Ecuador" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Perú" },
  { code: "UY", name: "Uruguay" },
  { code: "VE", name: "Venezuela" },
];

const documentTypes = [
    { value: "cc", label: "Cédula de Ciudadanía" },
    { value: "ce", label: "Cédula de Extranjería" },
    { value: "passport", label: "Pasaporte" },
    { value: "other", label: "Otro" },
]

const genders = [
    { value: "male", label: "Masculino" },
    { value: "female", label: "Femenino" },
    { value: "other", label: "Otro" },
    { value: "prefer_not_say", label: "Prefiero no decir" },
]

const profileTypes = [
    { value: "usuario", label: "Usuario" },
    { value: "profesional", label: "Profesional" },
]

// Zod Schemas for Login and Signup
const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
  password: z.string().min(1, "La contraseña es requerida."),
});
type LoginValues = z.infer<typeof loginSchema>;

const signupStep1Schema = z.object({
  firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres."),
  lastName: z.string().min(2, "Apellido debe tener al menos 2 caracteres."),
  country: z.string().min(1, "Debes seleccionar un país."),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Número inválido. Incluye código de país (ej: +57...).").optional().or(z.literal("")), // Updated validation
  profileType: z.string().min(1, "Debes seleccionar un tipo de perfil."),
});

const signupStep2Schema = z.object({
  dob: z.date({ required_error: "La fecha de nacimiento es requerida." }).optional(),
  gender: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres."),
});

const signupSchema = signupStep1Schema.merge(signupStep2Schema);
type SignupValues = z.infer<typeof signupSchema>;


export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const { isMobile, toggleSidebar: toggleDesktopSidebar, state: desktopSidebarState } = useSidebar(); // Get sidebar state


  // Use auth context
  const {
    user,
    isLoggedIn,
    isLoading,
    showLoginDialog,
    showProfileDialog,
    handleOpenChange,
    handleLogout,
    openLoginDialog,
    openProfileDialog,
    setCurrentView,
    loginError,
    handleLoginSubmit: contextHandleLoginSubmit, // Renamed to avoid conflict
    signupStep,
    setSignupStep,
    handleSignupSubmit: contextHandleSignupSubmit, // Renamed to avoid conflict
    handleNextStep: contextHandleNextStep, // Renamed to avoid conflict
    handlePrevStep: contextHandlePrevStep, // Renamed to avoid conflict
   } = useAuth();


  // Form hooks remain here as they are specific to the dialogs within this layout
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      country: "",
      phone: "",
      profileType: "",
      dob: undefined,
      gender: "",
      documentType: "",
      documentNumber: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  // Modified submit handlers to call context functions
   const handleLoginSubmit = (data: LoginValues) => {
     contextHandleLoginSubmit(data, loginForm.reset);
   };

    const handleSignupSubmit = (data: SignupValues) => {
      contextHandleSignupSubmit(data, signupForm.reset);
    };

     const handleNextStep = async () => {
        contextHandleNextStep(signupForm.trigger, signupForm.formState.errors, toast);
    };

     const handlePrevStep = () => {
       contextHandlePrevStep();
   };


  const handleMobileSheetOpenChange = (open: boolean) => {
    setIsMobileSheetOpen(open);
  };

  const goToSettings = () => {
      handleOpenChange(false); // Close profile dialog
      router.push('/settings');
  };

   const currentYear = getYear(new Date());


  const renderLoginSignupDialog = () => (
     <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <ScrollArea className="max-h-[calc(100vh-10rem)] sm:max-h-[calc(90vh-5rem)]">
           <div className="p-6"> {/* Padding inside ScrollArea */}
              <DialogHeader className="mb-4 text-center">
                <ShadDialogTitle className="text-2xl">{currentView === 'login' ? 'Ingresar' : 'Crear Cuenta'}</ShadDialogTitle>
                <DialogDescription>
                  {currentView === 'login'
                    ? 'Ingresa tu correo y contraseña para continuar.'
                    : `Paso ${signupStep} de 2: ${signupStep === 1 ? 'Información básica.' : 'Detalles adicionales.'}`}
                </DialogDescription>
              </DialogHeader>
                {currentView === 'login' ? (
                   <Form {...loginForm}>
                     <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                         <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Correo</FormLabel>
                                 <FormControl>
                                   <Input
                                     placeholder="tu@correo.com"
                                     {...field}
                                   />
                                 </FormControl>
                                 <FormMessage />
                               </FormItem>
                            )}
                          />
                         <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Contraseña</FormLabel>
                                 <FormControl>
                                   <Input
                                     type="password"
                                     placeholder="Tu contraseña"
                                     {...field}
                                    />
                                 </FormControl>
                                 {loginError && <p className="text-sm font-medium text-destructive">{loginError}</p>}
                                 <FormMessage />
                               </FormItem>
                            )}
                          />
                         <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between pt-4 border-t mt-4">
                             <Button type="button" variant="link" onClick={() => { setCurrentView('signup'); setSignupStep(1); loginForm.reset(); }} className="p-0 h-auto text-sm order-2 sm:order-1 self-center sm:self-auto">
                                ¿No tienes cuenta? Crear una
                             </Button>
                            <Button type="submit" className="order-1 sm:order-2 w-full sm:w-auto" disabled={loginForm.formState.isSubmitting}>
                                 {loginForm.formState.isSubmitting ? "Ingresando..." : "Ingresar"}
                            </Button>
                         </DialogFooter>
                   </form>
                   </Form>
                ) : (
                   <Form {...signupForm}>
                     <form
                        onSubmit={signupStep === 2 ? signupForm.handleSubmit(handleSignupSubmit) : (e) => e.preventDefault()}
                        className="space-y-4"
                      >
                         {/* Step 1 Fields */}
                         {signupStep === 1 && (
                           <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField control={signupForm.control} name="firstName" render={({ field }) => (
                                 <FormItem> <FormLabel>Nombre</FormLabel> <FormControl><Input placeholder="Tu nombre" {...field} /></FormControl> <FormMessage /> </FormItem>
                               )}/>
                               <FormField control={signupForm.control} name="lastName" render={({ field }) => (
                                 <FormItem> <FormLabel>Apellido</FormLabel> <FormControl><Input placeholder="Tu apellido" {...field} /></FormControl> <FormMessage /> </FormItem>
                               )}/>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField control={signupForm.control} name="country" render={({ field }) => (
                                 <FormItem>
                                  <FormLabel>País</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                     <FormControl>
                                          <SelectTrigger><SelectValue placeholder="Selecciona tu país" /></SelectTrigger>
                                     </FormControl>
                                      <SelectContent>{countries.map((country) => (<SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>))}</SelectContent>
                                    </Select>
                                  <FormMessage />
                                 </FormItem>
                               )}/>
                               <FormField control={signupForm.control} name="phone" render={({ field }) => (
                                 <FormItem> <FormLabel>Teléfono</FormLabel> <FormControl><Input type="tel" placeholder="+1234567890" {...field} /></FormControl> <FormMessage /> </FormItem>
                               )}/>
                             </div>
                             <FormField control={signupForm.control} name="profileType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de perfil</FormLabel>
                                     <Select onValueChange={field.onChange} value={field.value}>
                                         <FormControl>
                                             <SelectTrigger><SelectValue placeholder="Selecciona tu tipo de perfil" /></SelectTrigger>
                                         </FormControl>
                                         <SelectContent>{profileTypes.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}</SelectContent>
                                     </Select>
                                    <FormMessage />
                                </FormItem>
                             )}/>
                           </div>
                         )}

                         {/* Step 2 Fields */}
                         {signupStep === 2 && (
                           <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField control={signupForm.control} name="dob" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Fecha de Nacimiento</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                          <CalendarDays className="mr-2 h-4 w-4"/>
                                          {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={currentYear} locale={es}/>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                               )}/>
                               <FormField control={signupForm.control} name="gender" render={({ field }) => (
                                 <FormItem>
                                  <FormLabel>Género</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                     <FormControl>
                                          <SelectTrigger><SelectValue placeholder="Selecciona tu género" /></SelectTrigger>
                                     </FormControl>
                                      <SelectContent>{genders.map((gender) => (<SelectItem key={gender.value} value={gender.value}>{gender.label}</SelectItem>))}</SelectContent>
                                    </Select>
                                  <FormMessage />
                                 </FormItem>
                               )}/>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField control={signupForm.control} name="documentType" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de documento</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                     <FormControl>
                                          <SelectTrigger><SelectValue placeholder="Selecciona tipo" /></SelectTrigger>
                                     </FormControl>
                                      <SelectContent>{documentTypes.map((docType) => (<SelectItem key={docType.value} value={docType.value}>{docType.label}</SelectItem>))}</SelectContent>
                                    </Select>
                                  <FormMessage />
                                 </FormItem>
                               )}/>
                               <FormField control={signupForm.control} name="documentNumber" render={({ field }) => (
                                 <FormItem> <FormLabel>Número de documento</FormLabel> <FormControl><Input placeholder="Número de documento" {...field} /></FormControl> <FormMessage /> </FormItem>
                               )}/>
                             </div>
                             <FormField control={signupForm.control} name="email" render={({ field }) => (
                               <FormItem> <FormLabel>Correo</FormLabel> <FormControl><Input type="email" placeholder="tu@correo.com" {...field} /></FormControl> <FormMessage /> </FormItem>
                             )}/>
                             <FormField control={signupForm.control} name="password" render={({ field }) => (
                               <FormItem> <FormLabel>Contraseña</FormLabel> <FormControl><Input type="password" placeholder="Crea una contraseña" {...field} /></FormControl> <FormMessage /> </FormItem>
                             )}/>
                           </div>
                         )}

                          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between pt-4 border-t mt-4">
                             <Button type="button" variant="link" onClick={() => { setCurrentView('login'); setSignupStep(1); signupForm.reset(); }} className="p-0 h-auto text-sm order-2 sm:order-1 self-center sm:self-auto">
                                ¿Ya tienes cuenta? Ingresar
                             </Button>
                             <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto justify-end">
                                 {signupStep === 2 && (
                                     <Button type="button" variant="outline" onClick={handlePrevStep} className="w-full sm:w-auto">
                                         Anterior
                                     </Button>
                                 )}
                                 {signupStep === 1 ? (
                                     <Button type="button" onClick={handleNextStep} className="w-full sm:w-auto">
                                         Siguiente
                                     </Button>
                                 ) : (
                                     <Button type="submit" className="w-full sm:w-auto" disabled={signupForm.formState.isSubmitting}>
                                         {signupForm.formState.isSubmitting ? "Creando..." : "Crear Cuenta"}
                                     </Button>
                                 )}
                             </div>
                          </DialogFooter>
                    </form>
                    </Form>
                )}
             </div> {/* Close padding div */}
       </ScrollArea>
     </DialogContent>
  );

  const renderProfileDialog = () => (
     <DialogContent className="sm:max-w-md">
       <DialogHeader>
         <ShadDialogTitle>{user?.name ?? 'Perfil'}</ShadDialogTitle>
         <DialogDescription>Perfil de Usuario</DialogDescription>
       </DialogHeader>
       <div className="py-4">
         <p className="text-sm text-muted-foreground">
           {user ? `Bienvenido/a, ${user.name}. Desde aquí puedes acceder a tu configuración o cerrar sesión.` : 'Inicia sesión para ver tu perfil.'}
         </p>
         {user && <p className="text-sm mt-2">Email: {user.email}</p> }
       </div>
       <DialogFooter className="gap-2 sm:gap-0 justify-between">
         {user ? (
            <>
              <Button variant="outline" onClick={goToSettings}>Configuración</Button>
              <Button variant="destructive" onClick={handleLogout}>Cerrar Sesión</Button>
            </>
          ) : (
             // If somehow profile dialog is shown while not logged in, show login button
              <Button onClick={() => {
                 handleOpenChange(false); // Close current dialog
                 setTimeout(() => openLoginDialog(), 100); // Open login after a short delay
               }}>
                Iniciar Sesión
             </Button>
         )}

       </DialogFooter>
    </DialogContent>
  );

  return (
      <>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
             <Sidebar className="hidden md:flex flex-col flex-shrink-0 border-r bg-sidebar text-sidebar-foreground" side="left" variant="sidebar" collapsible="icon">
               <SidebarHeader className="p-4 border-b flex items-center justify-start group-data-[collapsible=icon]:justify-center flex-shrink-0 h-14">
                   <div className="flex items-center justify-center h-7 w-7 bg-primary rounded-full text-primary-foreground text-xs font-bold flex-shrink-0">
                     SO
                   </div>
                 <div className="overflow-hidden transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 ml-2">
                      <h3 className="font-semibold text-lg whitespace-nowrap">sportoffice</h3>
                  </div>
               </SidebarHeader>
               <SidebarContent className="flex-grow p-2 overflow-y-auto">
                 <SidebarMenu>
                   {navegacion.map((item) => (
                     <SidebarMenuItem key={item.title}>
                       <SidebarMenuButton
                         href={item.href}
                         isActive={pathname === item.href}
                         className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                          tooltip={{ children: item.title, side: 'right', align: 'center' }}
                       >
                         <item.icon className="h-4 w-4" />
                          <span className="overflow-hidden whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                             {item.title}
                         </span>
                       </SidebarMenuButton>
                     </SidebarMenuItem>
                   ))}
                 </SidebarMenu>
               </SidebarContent>
               <SidebarFooter className="p-2 border-t flex flex-col gap-2 flex-shrink-0">
                  <Dialog open={showProfileDialog || showLoginDialog} onOpenChange={handleOpenChange}>
                   <DialogTrigger asChild>
                     {isLoggedIn && user ? (
                       <Button variant="ghost" onClick={openProfileDialog} className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent/10 p-1 rounded-md overflow-hidden w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border group-data-[collapsible=icon]:rounded-full">
                         <Avatar className="h-8 w-8 flex-shrink-0 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7">
                           <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                           <AvatarFallback>{user.initials}</AvatarFallback>
                         </Avatar>
                         <div className="flex flex-col text-sm text-left transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:sr-only">
                           <span className="font-semibold truncate">{user.name}</span>
                         </div>
                       </Button>
                     ) : (
                       <Button variant="ghost" onClick={openLoginDialog} className="w-full justify-start transition-opacity duration-200 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:justify-center hover:bg-sidebar-accent/10">
                         <LogIn className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                         <span className="overflow-hidden whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:sr-only">
                           Ingresar / Crear Cuenta
                         </span>
                         <span className="sr-only group-data-[collapsible!=icon]:hidden">Ingresar</span>
                       </Button>
                     )}
                   </DialogTrigger>
                    {showProfileDialog ? renderProfileDialog() : (showLoginDialog ? renderLoginSignupDialog() : null)}
                 </Dialog>
               </SidebarFooter>
             </Sidebar>

            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Mobile Header */}
               <header className="sticky top-0 z-10 flex h-12 sm:h-14 items-center justify-between border-b bg-background px-3 sm:px-4 md:hidden flex-shrink-0">
                  <Sheet open={isMobileSheetOpen} onOpenChange={handleMobileSheetOpenChange}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="-ml-2 sm:ml-0">
                          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </SheetTrigger>
                       <SheetContent side="left" className="w-[var(--sidebar-width)] bg-sidebar p-0 text-sidebar-foreground flex flex-col" style={{ '--sidebar-width': '16rem' } as React.CSSProperties}>
                         {/* SheetHeader now correctly uses DialogTitle for accessibility */}
                          <SheetHeader className="p-4 border-b flex items-center flex-shrink-0">
                            <ShadDialogTitle className="sr-only">Menú principal</ShadDialogTitle> {/* Moved from SheetTitle to ShadDialogTitle */}
                              <div className="flex items-center gap-2 text-lg font-semibold">
                               <div className="flex items-center justify-center h-6 w-6 bg-primary rounded-full text-primary-foreground text-xs font-bold mr-1.5 flex-shrink-0">SO</div>
                               <span className="whitespace-nowrap">sportoffice</span>
                             </div>
                          </SheetHeader>
                         <SidebarContent className="flex-grow p-2 overflow-y-auto">
                             <SidebarMenu>
                             {navegacion.map((item) => (
                                 <SidebarMenuItem key={item.title}>
                                 <SidebarMenuButton
                                     href={item.href}
                                     isActive={pathname === item.href}
                                     className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                                     onClick={() => handleMobileSheetOpenChange(false)}
                                 >
                                     <item.icon className="h-4 w-4" />
                                     <span>{item.title}</span>
                                 </SidebarMenuButton>
                                 </SidebarMenuItem>
                             ))}
                             </SidebarMenu>
                         </SidebarContent>
                          <SidebarFooter className="p-2 border-t flex flex-col gap-2 flex-shrink-0">
                               <Dialog open={showProfileDialog || showLoginDialog} onOpenChange={handleOpenChange}>
                                <DialogTrigger asChild>
                                  {isLoggedIn && user ? (
                                    <Button variant="ghost" onClick={() => { openProfileDialog(); setIsMobileSheetOpen(false); }} className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent/10 p-1 rounded-md w-full text-left">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                                        <AvatarFallback>{user.initials}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col text-sm">
                                        <span className="font-semibold">{user.name}</span>
                                      </div>
                                    </Button>
                                  ) : (
                                    <Button variant="outline" onClick={() => { openLoginDialog(); setIsMobileSheetOpen(false); }} className="w-full justify-start hover:bg-sidebar-accent/10">
                                      <LogIn className="mr-2 h-4 w-4" />
                                      Ingresar / Crear Cuenta
                                    </Button>
                                  )}
                                </DialogTrigger>
                                {showProfileDialog ? renderProfileDialog() : (showLoginDialog ? renderLoginSignupDialog() : null)}
                              </Dialog>
                          </SidebarFooter>
                      </SheetContent>
                  </Sheet>

                 <div className="flex items-center flex-grow justify-center">
                     <div className="flex items-center justify-center h-6 w-6 bg-primary rounded-full text-primary-foreground text-xs font-bold mr-1.5 flex-shrink-0">
                        SO
                     </div>
                      <h3 className="font-semibold text-md sm:text-lg">sportoffice</h3>
                  </div>
                   <div className="flex-shrink-0 w-8 sm:w-10">
                       <Dialog open={showProfileDialog || showLoginDialog} onOpenChange={handleOpenChange}>
                         <DialogTrigger asChild>
                           {isLoggedIn && user ? (
                             <Button variant="ghost" onClick={openProfileDialog} size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                               <Avatar className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer">
                                 <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                                 <AvatarFallback>{user.initials}</AvatarFallback>
                               </Avatar>
                               <span className="sr-only">Abrir perfil</span>
                             </Button>
                           ) : (
                             <Button variant="ghost" onClick={openLoginDialog} size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                               <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                               <span className="sr-only">Ingresar / Crear Cuenta</span>
                             </Button>
                           )}
                         </DialogTrigger>
                         {showProfileDialog ? renderProfileDialog() : (showLoginDialog ? renderLoginSignupDialog() : null)}
                         </Dialog>
                   </div>
               </header>

              {/* Main Content Area */}
              <SidebarInset>
                  {children}
              </SidebarInset>
            </div>
            <Toaster />
          </div>
      </>
  );
}

