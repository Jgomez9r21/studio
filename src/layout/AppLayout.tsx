
'use client';

import React from 'react';
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
        <Sidebar className="w-60 hidden md:flex">
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
                  <SidebarMenuButton
                    href={item.href}
                    isActive={pathname === item.href}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
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
            {children}
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
                  <SidebarMenuButton
                    href={item.href}
                    isActive={pathname === item.href}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
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
        </Sidebar>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
