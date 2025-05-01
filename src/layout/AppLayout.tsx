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
  DialogTrigger,
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

  // Placeholder for signup/login logic
  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // TODO: Implement actual login logic
      console.log("Attempting to log in...");
      setIsLoggedIn(true); // Simulate successful login
      setShowLoginDialog(false); // Close the dialog
  };

   const handleSignupSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // TODO: Implement actual signup logic
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

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex flex-col flex-shrink-0" side="left" variant="sidebar" collapsible="icon">
          <SidebarHeader className="p-4 border-b flex items-center flex-shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v5m8-12v5m-4-8v11m-5-6h10a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2" />
             </svg>
            <div className="overflow-hidden transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                 <h3 className="font-bold text-lg whitespace-nowrap">sportoffice</h3>
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
          <SidebarFooter className="p-4 border-t flex flex-col gap-2 flex-shrink-0">
             {/* User Avatar / Login/Signup Button */}
             <Dialog open={showProfileDialog || showLoginDialog} onOpenChange={(open) => {
                 if (!open) {
                     setShowProfileDialog(false);
                     setShowLoginDialog(false);
                 }
             }}>
              {user ? (
                 // Logged-in user trigger
                 <DialogTrigger asChild onClick={() => setShowProfileDialog(true)}>
                   <div className="flex items-center gap-2 overflow-hidden transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 cursor-pointer hover:bg-muted/50 p-1 rounded-md">
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
                // Signup/Login trigger
                <DialogTrigger asChild onClick={() => setShowLoginDialog(true)}>
                  <Button variant="outline" className="w-full transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
                    <LogIn className="mr-2 h-4 w-4" />
                    <span className="overflow-hidden whitespace-nowrap">Crear Cuenta / Ingresar</span>
                  </Button>
                </DialogTrigger>
              )}

              {/* Conditional Content */}
              {user && showProfileDialog ? (
                // Profile Content (Simplified)
                <DialogContent className="sm:max-w-md">
                   <DialogHeader>
                     <DialogTitle>{user.name}</DialogTitle>
                     <DialogDescription>Perfil de Usuario</DialogDescription>
                   </DialogHeader>
                    {/* Removed detailed profile info */}
                   <DialogFooter className="gap-2 sm:gap-0">
                      <Button variant="outline" onClick={goToSettings}>Configuración</Button>
                     <Button variant="destructive" onClick={handleLogout}>Cerrar Sesión</Button>
                   </DialogFooter>
                </DialogContent>
              ) : showLoginDialog ? (
                // Signup/Login Content
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Ingresar / Crear Cuenta</DialogTitle>
                    <DialogDescription>
                      Ingresa tus datos para continuar.
                    </DialogDescription>
                  </DialogHeader>
                   {/* Combined Login/Signup Form */}
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
                     <DialogFooter className="flex-col sm:flex-row sm:justify-between mt-4">
                         <Button type="submit">Ingresar</Button>
                         {/* Optional: Add a dedicated signup button or link if needed */}
                         {/* <Button type="button" variant="secondary" onClick={() => alert('Ir a Crear Cuenta')}>Crear Cuenta</Button> */}
                     </DialogFooter>
                   </form>
                </DialogContent>
              ) : null}
            </Dialog>

            {/* Copyright Text */}
            <div className="text-xs text-muted-foreground text-center overflow-hidden whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 mt-auto pt-2">
              © {new Date().getFullYear()} sportoffice
            </div>
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
                        <SheetTitle className="flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v5m8-12v5m-4-8v11m-5-6h10a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2" />
                             </svg>
                            <span className="font-bold text-lg whitespace-nowrap">sportoffice</span>
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
                     <SidebarFooter className="p-4 border-t flex flex-col gap-2 flex-shrink-0">
                          <Dialog open={showProfileDialog || showLoginDialog} onOpenChange={(open) => {
                             if (!open) {
                                 setShowProfileDialog(false);
                                 setShowLoginDialog(false);
                             }
                         }}>
                           {user ? (
                              <DialogTrigger asChild onClick={() => setShowProfileDialog(true)}>
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md">
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
                             <DialogTrigger asChild onClick={() => setShowLoginDialog(true)}>
                                <Button variant="outline" className="w-full">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Crear Cuenta / Ingresar
                                </Button>
                             </DialogTrigger>
                           )}
                            {/* Conditional Content for Mobile Dialog */}
                             {user && showProfileDialog ? (
                                // Profile Content (Mobile - Simplified)
                                <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>{user.name}</DialogTitle>
                                    <DialogDescription>Perfil de Usuario</DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2 sm:gap-0">
                                     <Button variant="outline" onClick={goToSettings}>Configuración</Button>
                                    <Button variant="destructive" onClick={handleLogout}>Cerrar Sesión</Button>
                                </DialogFooter>
                                </DialogContent>
                            ) : showLoginDialog ? (
                                // Signup/Login Content (Mobile)
                                <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Ingresar / Crear Cuenta</DialogTitle>
                                    <DialogDescription>
                                      Ingresa tus datos para continuar.
                                    </DialogDescription>
                                </DialogHeader>
                                  <form onSubmit={handleLoginSubmit} className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email-signup-mobile" className="text-right">
                                        Correo
                                    </Label>
                                    <Input id="email-signup-mobile" type="email" placeholder="tu@correo.com" className="col-span-3" required/>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="password-signup-mobile" className="text-right">
                                        Contraseña
                                    </Label>
                                    <Input id="password-signup-mobile" type="password" className="col-span-3" required/>
                                    </div>
                                      <DialogFooter className="flex-col sm:flex-row sm:justify-between mt-4">
                                         <Button type="submit">Ingresar</Button>
                                         {/* <Button type="button" variant="secondary" onClick={() => alert('Ir a Crear Cuenta')}>Crear Cuenta</Button> */}
                                     </DialogFooter>
                                   </form>
                                </DialogContent>
                            ) : null }
                         </Dialog>

                         {/* Copyright Text for Mobile */}
                        <div className="text-xs text-muted-foreground text-center mt-auto pt-2">
                             © {new Date().getFullYear()} sportoffice
                        </div>
                     </SidebarFooter>
                 </SheetContent>
             </Sheet>

             {/* Centered Logo/Title */}
             <div className="flex items-center flex-grow justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v5m8-12v5m-4-8v11m-5-6h10a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2" />
                 </svg>
                 <h3 className="font-semibold text-md sm:text-lg">sportoffice</h3>
             </div>
             {/* Right side Avatar/Placeholder */}
              <div className="flex-shrink-0">
                 <Dialog open={showProfileDialog || showLoginDialog} onOpenChange={(open) => {
                     if (!open) {
                         setShowProfileDialog(false);
                         setShowLoginDialog(false);
                     }
                 }}>
                 {user ? (
                    <DialogTrigger asChild onClick={() => setShowProfileDialog(true)}>
                           <Avatar className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer">
                               <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                               <AvatarFallback>{user.initials}</AvatarFallback>
                           </Avatar>
                    </DialogTrigger>
                 ) : (
                   <DialogTrigger asChild onClick={() => setShowLoginDialog(true)}>
                        <Button variant="ghost" size="icon">
                           <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                           <span className="sr-only">Crear Cuenta / Ingresar</span>
                        </Button>
                   </DialogTrigger>
                 )}
                 {/* Conditional Content (Mobile Header Icon) */}
                    {user && showProfileDialog ? (
                        // Profile Content (Mobile Header Icon - Simplified)
                       <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>{user.name}</DialogTitle>
                                <DialogDescription>Perfil de Usuario</DialogDescription>
                            </DialogHeader>
                             <DialogFooter className="gap-2 sm:gap-0">
                                 <Button variant="outline" onClick={goToSettings}>Configuración</Button>
                                <Button variant="destructive" onClick={handleLogout}>Cerrar Sesión</Button>
                            </DialogFooter>
                        </DialogContent>
                    ) : showLoginDialog ? (
                       // Signup/Login Content (Mobile Header Icon)
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                            <DialogTitle>Ingresar / Crear Cuenta</DialogTitle>
                            <DialogDescription>
                                Ingresa tus datos para continuar.
                            </DialogDescription>
                            </DialogHeader>
                              <form onSubmit={handleLoginSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email-signup-header" className="text-right">
                                Correo
                                </Label>
                                <Input id="email-signup-header" type="email" placeholder="tu@correo.com" className="col-span-3" required/>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password-signup-header" className="text-right">
                                Contraseña
                                </Label>
                                <Input id="password-signup-header" type="password" className="col-span-3" required/>
                                </div>
                                <DialogFooter className="flex-col sm:flex-row sm:justify-between mt-4">
                                 <Button type="submit">Ingresar</Button>
                                 {/* <Button type="button" variant="secondary" onClick={() => alert('Ir a Crear Cuenta')}>Crear Cuenta</Button> */}
                             </DialogFooter>
                           </form>
                        </DialogContent>
                    ) : null }
                    </Dialog>
              </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}