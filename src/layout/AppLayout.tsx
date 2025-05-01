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
  useSidebar, // Import useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import { Home, Users, Settings, CreditCard, UserPlus, Briefcase, Menu, LogIn, User as UserIcon } from "lucide-react"; // Added UserIcon
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"; // Added SheetTrigger & SheetDescription
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Ensure DialogTrigger is imported
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


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
      // TODO: Implement actual signup logic using email and password
      console.log("Attempting to sign up...");
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

  const renderLoginSignupDialog = () => (
     <DialogContent className="sm:max-w-[425px]">
       <DialogHeader>
         <DialogTitle>{currentView === 'login' ? 'Ingresar' : 'Crear Cuenta'}</DialogTitle>
         <DialogDescription>
           {currentView === 'login'
              ? 'Ingresa tus datos para continuar.'
              : 'Crea una cuenta nueva para empezar.'}
         </DialogDescription>
       </DialogHeader>
        <form onSubmit={currentView === 'login' ? handleLoginSubmit : handleSignupSubmit} className="grid gap-4 py-4">
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
             <Button type="button" variant="link" onClick={() => setCurrentView(currentView === 'login' ? 'signup' : 'login')} className="p-0 h-auto text-sm">
                {currentView === 'login' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Ingresar'}
             </Button>
            <Button type="submit">
                {currentView === 'login' ? 'Ingresar' : 'Crear Cuenta'}
            </Button>
         </DialogFooter>
       </form>
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
                     <DialogTrigger onClick={() => setShowProfileDialog(true)}>
                       <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md overflow-hidden">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                            <AvatarFallback>{user.initials}</AvatarFallback>
                          </Avatar>
                           <div className="flex flex-col text-sm transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                              <span className="font-semibold truncate">{user.name}</span>
                           </div>
                        </div>
                     </DialogTrigger>
                  ) : (
                    // Signup/Login trigger
                    <DialogTrigger onClick={() => setShowLoginDialog(true)}>
                       <Button variant="ghost" className="w-full transition-opacity duration-200 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border group-data-[collapsible=icon]:rounded-full">
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
                           {/* Use SheetTitle for accessibility */}
                             <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 012 2v1m-2-3a2 2 0 00-2 2v1m0 0V9m0 8a2 2 0 11-2 2h-1m2-2a2 2 0 002-2m0 0V9m-6 8a2 2 0 01-2-2v-1m2 3a2 2 0 002-2V9m0 0a2 2 0 012-2h1m-2 2a2 2 0 00-2 2" />
                                 </svg>
                                <span className="whitespace-nowrap">sportoffice</span>
                             </SheetTitle>
                              {/* Optionally add SheetDescription if needed */}
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
                                  <DialogTrigger onClick={() => { setShowProfileDialog(true); handleMobileSheetOpenChange(false); }}>
                                    <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md w-full text-left">
                                      <Avatar className="h-8 w-8">
                                          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                                          <AvatarFallback>{user.initials}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col text-sm">
                                          <span className="font-semibold">{user.name}</span>
                                      </div>
                                    </div>
                                  </DialogTrigger>
                               ) : (
                                 <DialogTrigger onClick={() => { setShowLoginDialog(true); handleMobileSheetOpenChange(false); }}>
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
                        <DialogTrigger onClick={() => setShowProfileDialog(true)}>
                               <Avatar className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer">
                                   <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                                   <AvatarFallback>{user.initials}</AvatarFallback>
                               </Avatar>
                        </DialogTrigger>
                     ) : (
                       <DialogTrigger onClick={() => setShowLoginDialog(true)}>
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
