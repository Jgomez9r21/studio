'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod"; // Import zodResolver
import { useForm } from "react-hook-form"; // Import useForm
import * as z from "zod"; // Import zod
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import { Home, Users, Settings, CreditCard, UserPlus, Briefcase, Menu, LogIn, User as UserIcon, Calendar as CalendarIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, getYear } from "date-fns";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Import Form components
import { useToast } from "@/hooks/use-toast"; // Import useToast


// Navigation Items (centralized)
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

// Dummy user data for demonstration
const dummyUser = {
  name: "Usuario Ejemplo",
  initials: "UE",
  avatarUrl: "https://picsum.photos/50/50?random=user"
};

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

const signupSchema = z.object({
  firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres."),
  lastName: z.string().min(2, "Apellido debe tener al menos 2 caracteres."),
  country: z.string().min(1, "Debes seleccionar un país."),
  phone: z.string().optional(),
  profileType: z.string().min(1, "Debes seleccionar un tipo de perfil."),
  dob: z.date().optional(),
  gender: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres."),
});
type SignupValues = z.infer<typeof signupSchema>;


export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');
  const [dob, setDob] = useState<Date | undefined>();

  // Form hooks
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
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowLoginDialog(false);
      setShowProfileDialog(false);
      setCurrentView('login'); // Reset view on close
      loginForm.reset(); // Reset login form on close
      signupForm.reset(); // Reset signup form on close
      setDob(undefined); // Reset DOB picker
    }
  };

  const handleLoginSubmit = (data: LoginValues) => {
      console.log("Attempting to log in with data:", data);
      // TODO: Implement actual login logic using email and password
      setIsLoggedIn(true); // Simulate successful login
      setShowLoginDialog(false); // Close the dialog
      setCurrentView('login'); // Reset view
      loginForm.reset();
      toast({ title: "Ingreso exitoso", description: `Bienvenido/a!` });
  };

   const handleSignupSubmit = (data: SignupValues) => {
      console.log("Attempting to sign up with data:", { ...data, dob: dob ? dob.toISOString().split('T')[0] : null });
      // TODO: Implement actual signup logic using form data
      setIsLoggedIn(true); // Simulate successful signup/login
      setShowLoginDialog(false); // Close the dialog
      setCurrentView('login'); // Reset view
      signupForm.reset();
      setDob(undefined);
      toast({ title: "Cuenta Creada", description: "¡Bienvenido/a! Tu cuenta ha sido creada." });
   };

  const handleLogout = () => {
     console.log("Logging out...");
     // TODO: Implement actual logout logic
     setIsLoggedIn(false);
     setShowProfileDialog(false);
     toast({ title: "Sesión cerrada" });
  };


  const user = isLoggedIn ? dummyUser : null;

  const handleMobileSheetOpenChange = (open: boolean) => {
    setIsMobileSheetOpen(open);
  };

  const goToSettings = () => {
      setShowProfileDialog(false);
      router.push('/settings');
  };

   const currentYear = getYear(new Date());


  const renderLoginSignupDialog = () => (
     <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto p-6">
       <DialogHeader>
         <DialogTitle>{currentView === 'login' ? 'Ingresar' : 'Crear Cuenta'}</DialogTitle>
         <DialogDescription>
           {currentView === 'login'
              ? 'Ingresa tus datos para continuar.'
              : 'Completa el formulario para crear tu cuenta.'}
         </DialogDescription>
       </DialogHeader>
        {currentView === 'login' ? (
           <Form {...loginForm}>
             <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="grid gap-4 py-4">
                 <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[auto_1fr] items-center gap-4">
                        <FormLabel className="text-right">Correo</FormLabel>
                        <FormControl>
                           <Input placeholder="tu@correo.com" {...field} className="col-span-3" />
                        </FormControl>
                        <FormMessage className="col-start-2 col-span-3" /> {/* Adjusted message position */}
                      </FormItem>
                    )}
                  />
                 <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[auto_1fr] items-center gap-4">
                        <FormLabel className="text-right">Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="col-span-3" />
                        </FormControl>
                        <FormMessage className="col-start-2 col-span-3" /> {/* Adjusted message position */}
                      </FormItem>
                    )}
                  />
                 <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between mt-4 pt-4 border-t">
                     <Button type="button" variant="link" onClick={() => setCurrentView('signup')} className="p-0 h-auto text-sm order-2 sm:order-1">
                        ¿No tienes cuenta? Crear una
                     </Button>
                    <Button type="submit" className="order-1 sm:order-2" disabled={loginForm.formState.isSubmitting}>
                         {loginForm.formState.isSubmitting ? "Ingresando..." : "Ingresar"}
                    </Button>
                 </DialogFooter>
           </form>
           </Form>
        ) : (
           <Form {...signupForm}>
             <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4 py-4">
                 {/* Name Fields */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={signupForm.control} name="firstName" render={({ field }) => (
                         <FormItem> <FormLabel>Nombre</FormLabel> <FormControl> <Input placeholder="Tu nombre" {...field} /> </FormControl> <FormMessage /> </FormItem>
                      )}/>
                      <FormField control={signupForm.control} name="lastName" render={({ field }) => (
                         <FormItem> <FormLabel>Apellido</FormLabel> <FormControl> <Input placeholder="Tu apellido" {...field} /> </FormControl> <FormMessage /> </FormItem>
                      )}/>
                 </div>
                 {/* Country and Phone */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={signupForm.control} name="country" render={({ field }) => (
                         <FormItem> <FormLabel>País</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecciona tu país" /> </SelectTrigger> </FormControl> <SelectContent> {countries.map((country) => (<SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>))} </SelectContent> </Select> <FormMessage /> </FormItem>
                      )}/>
                      <FormField control={signupForm.control} name="phone" render={({ field }) => (
                         <FormItem> <FormLabel>Teléfono</FormLabel> <FormControl> <Input type="tel" placeholder="+1234567890" {...field} /> </FormControl> <FormMessage /> </FormItem>
                      )}/>
                 </div>
                 {/* Profile Type */}
                 <FormField control={signupForm.control} name="profileType" render={({ field }) => (
                    <FormItem> <FormLabel>Tipo de perfil</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecciona tu tipo de perfil" /> </SelectTrigger> </FormControl> <SelectContent> {profileTypes.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))} </SelectContent> </Select> <FormMessage /> </FormItem>
                 )}/>
                 {/* DOB and Gender */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={signupForm.control} name="dob" render={({ field }) => (
                       <FormItem className="flex flex-col"> <FormLabel>Fecha de Nacimiento</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}> <CalendarIcon className="mr-2 h-4 w-4"/> {field.value ? format(field.value, "PPP") : <span>Seleccionar fecha</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={currentYear} /> </PopoverContent> </Popover> <FormMessage /> </FormItem>
                     )}/>
                     <FormField control={signupForm.control} name="gender" render={({ field }) => (
                        <FormItem> <FormLabel>Género</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecciona tu género" /> </SelectTrigger> </FormControl> <SelectContent> {genders.map((gender) => (<SelectItem key={gender.value} value={gender.value}>{gender.label}</SelectItem>))} </SelectContent> </Select> <FormMessage /> </FormItem>
                     )}/>
                 </div>
                 {/* Document Type and Number */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={signupForm.control} name="documentType" render={({ field }) => (
                         <FormItem> <FormLabel>Tipo de documento</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecciona tipo" /> </SelectTrigger> </FormControl> <SelectContent> {documentTypes.map((docType) => (<SelectItem key={docType.value} value={docType.value}>{docType.label}</SelectItem>))} </SelectContent> </Select> <FormMessage /> </FormItem>
                     )}/>
                     <FormField control={signupForm.control} name="documentNumber" render={({ field }) => (
                         <FormItem> <FormLabel>Número de documento</FormLabel> <FormControl> <Input placeholder="Número de documento" {...field} /> </FormControl> <FormMessage /> </FormItem>
                     )}/>
                 </div>
                 {/* Email */}
                 <FormField control={signupForm.control} name="email" render={({ field }) => (
                    <FormItem> <FormLabel>Correo</FormLabel> <FormControl> <Input type="email" placeholder="tu@correo.com" {...field} /> </FormControl> <FormMessage /> </FormItem>
                 )}/>
                 {/* Password */}
                 <FormField control={signupForm.control} name="password" render={({ field }) => (
                    <FormItem> <FormLabel>Contraseña</FormLabel> <FormControl> <Input type="password" {...field} /> </FormControl> <FormMessage /> </FormItem>
                 )}/>

                  <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between mt-4 pt-4 border-t">
                     <Button type="button" variant="link" onClick={() => setCurrentView('login')} className="p-0 h-auto text-sm order-2 sm:order-1">
                        ¿Ya tienes cuenta? Ingresar
                     </Button>
                    <Button type="submit" className="order-1 sm:order-2" disabled={signupForm.formState.isSubmitting}>
                         {signupForm.formState.isSubmitting ? "Creando..." : "Crear Cuenta"}
                    </Button>
                 </DialogFooter>
            </form>
            </Form>
        )}
     </DialogContent>
  );

  const renderProfileDialog = () => (
     <DialogContent className="sm:max-w-md">
       <DialogHeader>
         <DialogTitle>{user?.name}</DialogTitle>
         <DialogDescription>Perfil de Usuario</DialogDescription>
       </DialogHeader>
       <div className="py-4">
         <p className="text-sm text-muted-foreground">
           Bienvenido/a, {user?.name}. Desde aquí puedes acceder a tu configuración o cerrar sesión.
         </p>
          <p className="text-sm mt-2">Email: usuario@ejemplo.com</p> {/* Example: Display user email */}
       </div>
       <DialogFooter className="gap-2 sm:gap-0 justify-between">
          <Button variant="outline" onClick={goToSettings}>Configuración</Button>
         <Button variant="destructive" onClick={handleLogout}>Cerrar Sesión</Button>
       </DialogFooter>
    </DialogContent>
  );

  return (
      <SidebarProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
             <Sidebar className="hidden md:flex flex-col flex-shrink-0" side="left" variant="sidebar" collapsible="icon">
               <SidebarHeader className="p-4 border-b flex items-center justify-center flex-shrink-0 h-14">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary flex-shrink-0 group-data-[collapsible=icon]:mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 012 2v1m-2-3a2 2 0 00-2 2v1m0 0V9m0 8a2 2 0 11-2 2h-1m2-2a2 2 0 002-2m0 0V9m-6 8a2 2 0 01-2-2v-1m2 3a2 2 0 002-2V9m0 0a2 2 0 012-2h1m-2 2a2 2 0 00-2 2" />
                  </svg>
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
                   {user ? (
                      <DialogTrigger asChild onClick={() => setShowProfileDialog(true)}>
                        <Button variant="ghost" className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md overflow-hidden w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border group-data-[collapsible=icon]:rounded-full">
                           <Avatar className="h-8 w-8 flex-shrink-0 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7">
                             <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                             <AvatarFallback>{user.initials}</AvatarFallback>
                           </Avatar>
                            <div className="flex flex-col text-sm transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:sr-only">
                               <span className="font-semibold truncate">{user.name}</span>
                            </div>
                         </Button>
                      </DialogTrigger>
                   ) : (
                     <DialogTrigger asChild onClick={() => setShowLoginDialog(true)}>
                       <Button variant="ghost" className="w-full justify-start transition-opacity duration-200 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border group-data-[collapsible=icon]:rounded-full">
                         <LogIn className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                          <span className="overflow-hidden whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:sr-only">
                               Ingresar / Crear Cuenta
                           </span>
                          <span className="sr-only group-data-[collapsible!=icon]:hidden">Ingresar</span>
                        </Button>
                     </DialogTrigger>
                   )}
                   {user && showProfileDialog ? renderProfileDialog() : (showLoginDialog ? renderLoginSignupDialog() : null)}
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
                           <SheetHeader className="p-4 border-b flex items-center flex-shrink-0">
                              <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 012 2v1m-2-3a2 2 0 00-2 2v1m0 0V9m0 8a2 2 0 11-2 2h-1m2-2a2 2 0 002-2m0 0V9m-6 8a2 2 0 01-2-2v-1m2 3a2 2 0 002-2V9m0 0a2 2 0 012-2h1m-2 2a2 2 0 00-2 2" />
                                 </svg>
                                 <span className="whitespace-nowrap">sportoffice</span>
                              </SheetTitle>
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
                                {user ? (
                                   <DialogTrigger asChild onClick={() => { setShowProfileDialog(true); setIsMobileSheetOpen(false); }}>
                                     <Button variant="ghost" className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md w-full text-left">
                                       <Avatar className="h-8 w-8">
                                           <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                                           <AvatarFallback>{user.initials}</AvatarFallback>
                                       </Avatar>
                                       <div className="flex flex-col text-sm">
                                           <span className="font-semibold">{user.name}</span>
                                       </div>
                                     </Button>
                                   </DialogTrigger>
                                ) : (
                                  <DialogTrigger asChild onClick={() => { setShowLoginDialog(true); setIsMobileSheetOpen(false); }}>
                                     <Button variant="outline" className="w-full justify-start">
                                         <LogIn className="mr-2 h-4 w-4" />
                                         Ingresar / Crear Cuenta
                                     </Button>
                                  </DialogTrigger>
                                )}
                                 {user && showProfileDialog ? renderProfileDialog() : (showLoginDialog ? renderLoginSignupDialog() : null)}
                              </Dialog>
                          </SidebarFooter>
                      </SheetContent>
                  </Sheet>

                 <div className="flex items-center flex-grow justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 012 2v1m-2-3a2 2 0 00-2 2v1m0 0V9m0 8a2 2 0 11-2 2h-1m2-2a2 2 0 002-2m0 0V9m-6 8a2 2 0 01-2-2v-1m2 3a2 2 0 002-2V9m0 0a2 2 0 012-2h1m-2 2a2 2 0 00-2 2" />
                      </svg>
                      <h3 className="font-semibold text-md sm:text-lg">sportoffice</h3>
                  </div>
                   <div className="flex-shrink-0 w-8 sm:w-10">
                      <Dialog open={showProfileDialog || showLoginDialog} onOpenChange={handleOpenChange}>
                      {user ? (
                         <DialogTrigger asChild onClick={() => setShowProfileDialog(true)}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer">
                                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                                        <AvatarFallback>{user.initials}</AvatarFallback>
                                    </Avatar>
                                     <span className="sr-only">Abrir perfil</span>
                                </Button>
                         </DialogTrigger>
                      ) : (
                        <DialogTrigger asChild onClick={() => setShowLoginDialog(true)}>
                             <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                                <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                <span className="sr-only">Ingresar / Crear Cuenta</span>
                             </Button>
                        </DialogTrigger>
                      )}
                          {user && showProfileDialog ? renderProfileDialog() : (showLoginDialog ? renderLoginSignupDialog() : null)}
                         </Dialog>
                   </div>
               </header>

              <main className="flex-1 overflow-y-auto bg-background">
                {children}
              </main>
            </div>
            <Toaster />
          </div>
      </SidebarProvider>
  );
}