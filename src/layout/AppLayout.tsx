'use client';

import type React from 'react';
import { useState } from 'react'; // Import useState
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter
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
import { Home, Users, Settings, CreditCard, UserPlus, Briefcase, Menu, LogIn, User as UserIcon, Calendar as CalendarIcon } from "lucide-react"; // Added UserIcon and CalendarIcon
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Added Popover components
import { Calendar } from "@/components/ui/calendar"; // Added Calendar component
import { cn } from "@/lib/utils"; // Added cn import
import { format, getYear } from "date-fns"; // Added date-fns imports


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
  // Add more countries as needed
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


export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter(); // Initialize router


  // Simulate login state - replace with actual auth logic
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Start as logged out
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false); // State for mobile sheet
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login'); // 'login' or 'signup'
  const [dob, setDob] = useState<Date | undefined>(); // State for Date of Birth


  // Placeholder for login logic
  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // TODO: Implement actual login logic using email and password
      console.log("Attempting to log in...");
      setIsLoggedIn(true); // Simulate successful login
      setShowLoginDialog(false); // Close the dialog
  };

   // Placeholder for signup logic
   const handleSignupSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // TODO: Implement actual signup logic using form data
      console.log("Attempting to sign up...");
      // Access form data like: event.currentTarget.elements['firstName'].value
       const formData = new FormData(event.currentTarget);
       const data = Object.fromEntries(formData.entries());
       console.log("Signup data:", data); // Log signup data
      setIsLoggedIn(true); // Simulate successful signup/login
      setShowLoginDialog(false); // Close the dialog
   };

  const handleLogout = () => {
     // TODO: Implement actual logout logic
     console.log("Logging out...");
     setIsLoggedIn(false);
     setShowProfileDialog(false); // Close profile dialog on logout
  };


  const user = isLoggedIn ? dummyUser : null;

  const handleMobileSheetOpenChange = (open: boolean) => {
    setIsMobileSheetOpen(open);
  };

  // Function to navigate to settings page
  const goToSettings = () => {
      setShowProfileDialog(false); // Close the dialog first
      router.push('/settings'); // Navigate to settings
  };

   const currentYear = getYear(new Date()); // Get the current year


  const renderLoginSignupDialog = () => (
     <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
       <DialogHeader>
         <DialogTitle>{currentView === 'login' ? 'Ingresar' : 'Crear Cuenta'}</DialogTitle>
         <DialogDescription>
           {currentView === 'login'
              ? 'Ingresa tus datos para continuar.'
              : 'Crea una cuenta nueva para empezar.'}
         </DialogDescription>
       </DialogHeader>
        {currentView === 'login' ? (
             <form onSubmit={handleLoginSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email-login" className="text-right">
                        Correo
                    </Label>
                    <Input id="email-login" type="email" placeholder="tu@correo.com" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password-login" className="text-right">
                        Contraseña
                    </Label>
                    <Input id="password-login" type="password" className="col-span-3" required />
                </div>
                 <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between mt-4">
                     <Button type="button" variant="link" onClick={() => setCurrentView('signup')} className="p-0 h-auto text-sm">
                        ¿No tienes cuenta? Crear una
                     </Button>
                    <Button type="submit">
                        Ingresar
                    </Button>
                 </DialogFooter>
           </form>
        ) : (
             <form onSubmit={handleSignupSubmit} className="space-y-4 py-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <Label htmlFor="firstName">Nombre</Label>
                         <Input id="firstName" name="firstName" placeholder="Tu nombre" required />
                     </div>
                     <div>
                         <Label htmlFor="lastName">Apellido</Label>
                         <Input id="lastName" name="lastName" placeholder="Tu apellido" required />
                     </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <Label htmlFor="country">País</Label>
                         <Select name="country" required>
                             <SelectTrigger id="country">
                                 <SelectValue placeholder="Selecciona tu país" />
                             </SelectTrigger>
                             <SelectContent>
                                 {countries.map((country) => (
                                 <SelectItem key={country.code} value={country.code}>
                                     {country.name}
                                 </SelectItem>
                                 ))}
                             </SelectContent>
                         </Select>
                     </div>
                     <div>
                         <Label htmlFor="phone">Teléfono</Label>
                         <Input id="phone" name="phone" type="tel" placeholder="+1234567890" />
                     </div>
                 </div>
                 <div>
                    <Label htmlFor="profileType">Tipo de perfil</Label>
                     <Select name="profileType" required>
                         <SelectTrigger id="profileType">
                             <SelectValue placeholder="Selecciona tu tipo de perfil" />
                         </SelectTrigger>
                         <SelectContent>
                             <SelectItem value="usuario">Usuario</SelectItem>
                             <SelectItem value="profesional">Profesional</SelectItem>
                         </SelectContent>
                     </Select>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <Label htmlFor="dob">Fecha de Nacimiento</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !dob && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                {dob ? format(dob, "PPP") : <span>Seleccionar fecha</span>}
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dob}
                              onSelect={setDob}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                               captionLayout="dropdown-buttons" // Enable dropdowns
                               fromYear={1900} // Set the start year
                               toYear={currentYear} // Set the end year to the current year
                            />
                          </PopoverContent>
                        </Popover>
                         {/* Hidden input to pass the date value */}
                         <input type="hidden" name="dob" value={dob ? dob.toISOString().split('T')[0] : ''} />
                     </div>
                      <div>
                         <Label htmlFor="gender">Género</Label>
                         <Select name="gender">
                             <SelectTrigger id="gender">
                                 <SelectValue placeholder="Selecciona tu género" />
                             </SelectTrigger>
                             <SelectContent>
                                 {genders.map((gender) => (
                                     <SelectItem key={gender.value} value={gender.value}>
                                         {gender.label}
                                     </SelectItem>
                                 ))}
                             </SelectContent>
                         </Select>
                     </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <Label htmlFor="documentType">Tipo de documento</Label>
                         <Select name="documentType">
                             <SelectTrigger id="documentType">
                                 <SelectValue placeholder="Selecciona tipo" />
                             </SelectTrigger>
                             <SelectContent>
                                 {documentTypes.map((docType) => (
                                     <SelectItem key={docType.value} value={docType.value}>
                                         {docType.label}
                                     </SelectItem>
                                 ))}
                             </SelectContent>
                         </Select>
                     </div>
                     <div>
                         <Label htmlFor="documentNumber">Número de documento</Label>
                         <Input id="documentNumber" name="documentNumber" placeholder="Número de documento" />
                     </div>
                 </div>

                 <div>
                     <Label htmlFor="email-signup">Correo</Label>
                     <Input id="email-signup" name="email" type="email" placeholder="tu@correo.com" required />
                 </div>
                 <div>
                     <Label htmlFor="password-signup">Contraseña</Label>
                     <Input id="password-signup" name="password" type="password" required />
                 </div>

                  <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between mt-4">
                     <Button type="button" variant="link" onClick={() => setCurrentView('login')} className="p-0 h-auto text-sm">
                        ¿Ya tienes cuenta? Ingresar
                     </Button>
                    <Button type="submit">
                        Crear Cuenta
                    </Button>
                 </DialogFooter>
            </form>
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
         {/* Example: Display email or other non-sensitive info */}
          <p className="text-sm mt-2">Email: usuario@ejemplo.com</p>
       </div>
       <DialogFooter className="gap-2 sm:gap-0 justify-between">
          <Button variant="outline" onClick={goToSettings}>Configuración</Button>
         <Button variant="destructive" onClick={handleLogout}>Cerrar Sesión</Button>
       </DialogFooter>
    </DialogContent>
  );

  return (
      <SidebarProvider> {/* Wrap the entire layout with SidebarProvider */}
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden md:flex flex-col flex-shrink-0" side="left" variant="sidebar" collapsible="icon">
              <SidebarHeader className="p-4 border-b flex items-center justify-center flex-shrink-0 h-14"> {/* Centered and fixed height */}
                 {/* Updated Logo Placeholder */}
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
              <SidebarFooter className="p-2 border-t flex flex-col gap-2 flex-shrink-0"> {/* Reduced padding */}
                 {/* User Avatar / Login/Signup Button */}
                 <Dialog open={showProfileDialog || showLoginDialog} onOpenChange={(open) => {
                     if (!open) {
                         setShowProfileDialog(false);
                         setShowLoginDialog(false);
                         setCurrentView('login'); // Reset view on close
                     }
                 }}>
                  {user ? (
                     // Logged-in user trigger
                     <DialogTrigger asChild>
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
                    // Signup/Login trigger
                    <DialogTrigger asChild>
                       <Button variant="ghost" className="w-full justify-start transition-opacity duration-200 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border group-data-[collapsible=icon]:rounded-full">
                         <LogIn className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                          <span className="overflow-hidden whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:sr-only">
                              Ingresar / Crear Cuenta
                          </span>
                         <span className="sr-only group-data-[collapsible!=icon]:hidden">Ingresar</span>
                       </Button>
                    </DialogTrigger>
                  )}

                  {/* Conditional Content based on which state is true */}
                  {user && showProfileDialog ? renderProfileDialog() : showLoginDialog ? renderLoginSignupDialog() : null}
                </Dialog>

              </SidebarFooter>
            </Sidebar>

            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Mobile Header */}
               <header className="sticky top-0 z-10 flex h-12 sm:h-14 items-center justify-between border-b bg-background px-3 sm:px-4 md:hidden flex-shrink-0">
                 {/* Mobile Sidebar Trigger */}
                 <Sheet open={isMobileSheetOpen} onOpenChange={handleMobileSheetOpenChange}>
                     <SheetTrigger asChild>
                       <Button variant="ghost" size="icon" className="-ml-2 sm:ml-0">
                         <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                         <span className="sr-only">Abrir menú</span>
                       </Button>
                     </SheetTrigger>
                     {/* Mobile Sidebar Content */}
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
                                    onClick={() => handleMobileSheetOpenChange(false)} // Close sidebar on navigation
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            </SidebarMenu>
                        </SidebarContent>
                         <SidebarFooter className="p-2 border-t flex flex-col gap-2 flex-shrink-0"> {/* Reduced padding */}
                              <Dialog open={showProfileDialog || showLoginDialog} onOpenChange={(open) => {
                                 if (!open) {
                                     setShowProfileDialog(false);
                                     setShowLoginDialog(false);
                                      setCurrentView('login'); // Reset view on close
                                 }
                             }}>
                               {user ? (
                                  <DialogTrigger asChild>
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
                                 <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start"> {/* Ensure text aligns left */}
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Ingresar / Crear Cuenta
                                    </Button>
                                 </DialogTrigger>
                               )}
                                {/* Conditional Content for Mobile Dialog */}
                                 {user && showProfileDialog ? renderProfileDialog() : showLoginDialog ? renderLoginSignupDialog() : null }
                             </Dialog>
                         </SidebarFooter>
                     </SheetContent>
                 </Sheet>

                 {/* Centered Logo/Title */}
                 <div className="flex items-center flex-grow justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 012 2v1m-2-3a2 2 0 00-2 2v1m0 0V9m0 8a2 2 0 11-2 2h-1m2-2a2 2 0 002-2m0 0V9m-6 8a2 2 0 01-2-2v-1m2 3a2 2 0 002-2V9m0 0a2 2 0 012-2h1m-2 2a2 2 0 00-2 2" />
                     </svg>
                     <h3 className="font-semibold text-md sm:text-lg">sportoffice</h3>
                 </div>
                 {/* Right side Avatar/Placeholder */}
                  <div className="flex-shrink-0 w-8 sm:w-10"> {/* Reserve space for the icon */}
                     <Dialog open={showProfileDialog || showLoginDialog} onOpenChange={(open) => {
                         if (!open) {
                             setShowProfileDialog(false);
                             setShowLoginDialog(false);
                             setCurrentView('login'); // Reset view on close
                         }
                     }}>
                     {user ? (
                        <DialogTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                                   <Avatar className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer">
                                       <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                                       <AvatarFallback>{user.initials}</AvatarFallback>
                                   </Avatar>
                                    <span className="sr-only">Abrir perfil</span>
                               </Button>
                        </DialogTrigger>
                     ) : (
                       <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                               <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                               <span className="sr-only">Ingresar / Crear Cuenta</span>
                            </Button>
                       </DialogTrigger>
                     )}
                     {/* Conditional Content (Mobile Header Icon) */}
                        {user && showProfileDialog ? renderProfileDialog() : showLoginDialog ? renderLoginSignupDialog() : null }
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
