
'use client';

import type React from 'react';
import { usePathname } from 'next/navigation';
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
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { Home, Users, Settings, CreditCard, UserPlus, Briefcase, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"; // Import Sheet components


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

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar className="w-60 hidden md:flex" side="left" variant="sidebar" collapsible="icon">
          <SidebarHeader className="p-4 border-b flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://picsum.photos/50/50" alt="SkillHub Connect Logo" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
             {/* Title visible only when sidebar is expanded */}
            <div className="ml-3 overflow-hidden transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                 <h3 className="font-bold text-lg whitespace-nowrap">SkillHub Connect</h3>
             </div>
          </SidebarHeader>
          <SidebarContent className="flex-grow p-2">
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
                     {/* Text visible only when sidebar is expanded */}
                     <span className="overflow-hidden whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                        {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t text-xs text-muted-foreground transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
             <div className="overflow-hidden whitespace-nowrap">
                © {new Date().getFullYear()} SkillHub Connect
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-y-auto">
          {/* Mobile Header with Sidebar Trigger */}
           <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
             {/* Sidebar Trigger for Mobile */}
             <SidebarTrigger className="md:hidden">
                <Menu className="h-6 w-6" />
             </SidebarTrigger>
              <h3 className="font-semibold text-lg">SkillHub Connect</h3>
                {/* Placeholder for potential right-side icons like user profile */}
              <div>
                  {/* <Avatar className="h-8 w-8">
                     <AvatarImage src="https://picsum.photos/50/50" alt="User Avatar" />
                     <AvatarFallback>U</AvatarFallback>
                  </Avatar> */}
              </div>
          </header>

          <main>
            {children}
          </main>
        </SidebarInset>

         {/* Mobile Sidebar (Sheet) */}
         {/* This Sheet component is controlled by SidebarProvider */}
         <Sheet>
            <SheetContent side="left" className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground md:hidden" style={{ '--sidebar-width': '18rem' } as React.CSSProperties}>
                 <SheetHeader className="p-4 border-b flex items-center">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src="https://picsum.photos/50/50" alt="SkillHub Connect Logo" />
                       <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                         <SheetTitle className="text-lg font-bold">SkillHub Connect</SheetTitle>
                         <SheetDescription className="sr-only">
                            Menu principal para navegar la aplicación SkillHub Connect.
                         </SheetDescription>
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
                            // onClick={() => setOpenMobile(false)} // Optional: Close sidebar on navigation
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </SidebarContent>
                 <SidebarFooter className="p-4 border-t text-xs text-muted-foreground">
                     © {new Date().getFullYear()} SkillHub Connect
                 </SidebarFooter>
            </SheetContent>
        </Sheet>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
