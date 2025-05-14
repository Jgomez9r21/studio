// src/layout/AppLayout.tsx
'use client';

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as DialogPrimitive from "@radix-ui/react-dialog"; // Import Radix Dialog primitives
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import { Home, Settings, CreditCard, Briefcase, Menu, LogIn, User as UserIcon, CalendarDays, Heart, Info, Building, Users, TrendingUp, UploadCloud, Lock, Search as SearchIcon, UserCircle } from "lucide-react";

import { Button } from '@/components/ui/button';
import {
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle as ShadDialogTitle, 
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
import { useAuth, type ForgotPasswordValues } from '@/context/AuthContext';
import Image from 'next/image';


// Navigation Items (centralized)
const navegacion = [
  {
    title: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    title: "Espacios Deportivos",
    href: "/find-talents", 
    icon: Building, 
  },
  {
    title: "Publicar",
    href: "/post-job",
    icon: UploadCloud,
  },
  {
    title: "Mis Reservas",
    href: "/book-service",
    icon: CalendarDays,
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
    { value: "usuario", label: "Usuario (Busco servicios/espacios)" },
    { value: "profesional", label: "Profesional (Ofrezco servicios)" },
    { value: "propietario_espacio", label: "Propietario (Ofrezco espacios deportivos)"},
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
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Número inválido. Incluye código de país (ej: +57...).").optional().or(z.literal("")),
  profileType: z.string().min(1, "Debes seleccionar un tipo de perfil."),
});

const signupStep2Schema = z.object({
  dob: z.date({ required_error: "La fecha de nacimiento es requerida." }).optional().nullable(),
  gender: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres."),
});

const signupSchema = signupStep1Schema.merge(signupStep2Schema);
type SignupValues = z.infer<typeof signupSchema>;

const forgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
});


export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false); // State for mobile sheet
   const { isMobile, toggleSidebar: toggleDesktopSidebar, state: desktopSidebarState } = useSidebar();


  // Use auth context
  const {
    user,
    isLoggedIn,
    isLoading,
    showLoginDialog,
    showProfileDialog,
    currentView,
    handleOpenChange,
    handleLogout,
    openLoginDialog,
    openProfileDialog,
    setCurrentView,
    loginError,
    handleLoginSubmit: contextHandleLoginSubmit,
    signupStep,
    setSignupStep,
    handleSignupSubmit: contextHandleSignupSubmit,
    handleNextStep: contextHandleNextStep,
    handlePrevStep: contextHandlePrevStep,
    isVerificationSent,
    phoneVerificationError,
    isVerifyingCode,
    resetPhoneVerification,
    handleForgotPasswordSubmit: contextHandleForgotPasswordSubmit,
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
  
  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });


   const handleLoginSubmit = (data: LoginValues) => {
     contextHandleLoginSubmit(data, loginForm.reset);
   };

    const handleSignupSubmit = (data: SignupValues) => {
      contextHandleSignupSubmit(data, signupForm.reset);
    };

     const handleNextStep = async () => {
        await contextHandleNextStep(signupForm.trigger, signupForm.formState.errors, toast);
    };

     const handlePrevStep = () => {
       contextHandlePrevStep();
   };

   const handleForgotPasswordSubmit = (data: ForgotPasswordValues) => {
    contextHandleForgotPasswordSubmit(data, forgotPasswordForm.reset);
  };


  const handleMobileSheetOpenChange = (open: boolean) => {
    setIsMobileSheetOpen(open);
  };

  const goToSettings = () => {
      handleOpenChange(false); 
      router.push('/settings');
  };

   const currentYear = getYear(new Date());

  const authDialogContent = () => {
    if (showProfileDialog && isLoggedIn && user) {
      return (
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <ScrollArea className="max-h-[calc(100vh-4rem)] sm:max-h-[calc(80vh-5rem)]">
            <div className="p-6">
              <DialogHeader className="text-center mb-4">
                <div className="flex flex-col items-center mb-3">
                  <Avatar className="h-20 w-20 mb-2 border-2 border-primary">
                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder large" />
                    <AvatarFallback className="text-2xl">{user.initials}</AvatarFallback>
                  </Avatar>
                  <ShadDialogTitle className="text-xl">{user.name}</ShadDialogTitle>
                  <DialogDescription className="text-sm">{user.email}</DialogDescription>
                </div>
              </DialogHeader>
              <div className="py-2 space-y-1 text-sm">
                <p><span className="font-medium text-muted-foreground">País:</span> {user.country || 'No especificado'}</p>
                <p><span className="font-medium text-muted-foreground">Teléfono:</span> {user.phone || 'No especificado'} {user.phone && (user.isPhoneVerified ? <span className="text-green-600 text-xs ml-1">(Verificado)</span> : <span className="text-orange-600 text-xs ml-1">(No verificado)</span>)}</p>
                <p><span className="font-medium text-muted-foreground">Fecha de Nacimiento:</span> {user.dob ? format(new Date(user.dob), "PPP", {locale: es}) : 'No especificada'}</p>
              </div>
              <DialogFooter className="mt-6 pt-4 border-t flex-col sm:flex-row sm:justify-between gap-2">
                <Button variant="outline" onClick={goToSettings} className="w-full sm:w-auto">Configuración</Button>
                <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">Cerrar Sesión</Button>
              </DialogFooter>
            </div>
          </ScrollArea>
        </DialogContent>
      );
    }

    if (showLoginDialog) {
      return (
        <DialogContent className="p-0 overflow-hidden max-w-md w-[calc(100%-2rem)] sm:w-full">
           <ScrollArea className="max-h-[calc(100vh-4rem)] sm:max-h-[calc(90vh-5rem)] md:max-h-[calc(80vh-5rem)]">
             <div className="p-6">
                {currentView === 'login' && (
                  <>
                    <DialogHeader className="mb-4 text-center">
                      <ShadDialogTitle className="text-2xl">Ingresar</ShadDialogTitle>
                      <DialogDescription>
                        Ingresa tu correo y contraseña para continuar.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correo</FormLabel>
                              <FormControl>
                                <Input placeholder="tu@correo.com" {...field} />
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
                                <Input type="password" placeholder="Tu contraseña" {...field} />
                              </FormControl>
                              {loginError && <p className="text-sm font-medium text-destructive pt-1">{loginError}</p>}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <Button type="button" variant="link" onClick={() => { setCurrentView('forgotPassword'); loginForm.reset(); resetPhoneVerification(); }} className="p-0 h-auto text-sm text-primary">
                            ¿Olvidaste tu contraseña?
                          </Button>
                        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between pt-4 border-t mt-6">
                          <Button type="button" variant="link" onClick={() => { setCurrentView('signup'); setSignupStep(1); loginForm.reset(); resetPhoneVerification(); }} className="p-0 h-auto text-sm order-2 sm:order-1 self-center sm:self-auto">
                            ¿No tienes cuenta? Crear una
                          </Button>
                          <Button type="submit" className="order-1 sm:order-2 w-full sm:w-auto" disabled={loginForm.formState.isSubmitting || isLoading}>
                            {loginForm.formState.isSubmitting || isLoading ? "Ingresando..." : "Ingresar"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </>
                )}
                {currentView === 'signup' && (
                  <>
                    <DialogHeader className="mb-4 text-center">
                      <ShadDialogTitle className="text-2xl">Crear Cuenta</ShadDialogTitle>
                       <DialogDescription>
                         Paso {signupStep} de 2: {signupStep === 1 ? 'Información básica.' : 'Detalles adicionales y de cuenta.'}
                       </DialogDescription>
                    </DialogHeader>
                    <Form {...signupForm}>
                       <form
                          onSubmit={signupStep === 2 ? signupForm.handleSubmit(handleSignupSubmit) : (e) => e.preventDefault()}
                          className="space-y-4"
                        >
                           {signupStep === 1 && (
                             <div className="space-y-4">
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <FormField control={signupForm.control} name="firstName" render={({ field }) => (
                                   <FormItem> <FormLabel>Nombre</FormLabel> <FormControl><Input placeholder="Tu nombre" {...field} /></FormControl> <FormMessage /> </FormItem>
                                 )}/>
                                 <FormField control={signupForm.control} name="lastName" render={({ field }) => (
                                   <FormItem> <FormLabel>Apellido</FormLabel> <FormControl><Input placeholder="Tu apellido" {...field} /></FormControl> <FormMessage /> </FormItem>
                                 )}/>
                               </div>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                   <FormItem> <FormLabel>Teléfono (Opcional)</FormLabel> <FormControl><Input type="tel" placeholder="+573001234567" {...field} /></FormControl> <FormMessage /> </FormItem>
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

                           {signupStep === 2 && (
                             <div className="space-y-4">
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={currentYear} locale={es}/>
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                 )}/>
                                 <FormField control={signupForm.control} name="gender" render={({ field }) => (
                                   <FormItem>
                                    <FormLabel>Género (Opcional)</FormLabel>
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
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <FormField control={signupForm.control} name="documentType" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tipo de documento (Opcional)</FormLabel>
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
                                   <FormItem> <FormLabel>Número de documento (Opcional)</FormLabel> <FormControl><Input placeholder="Número de documento" {...field} /></FormControl> <FormMessage /> </FormItem>
                                 )}/>
                               </div>
                               <FormField control={signupForm.control} name="email" render={({ field }) => (
                                 <FormItem> <FormLabel>Correo</FormLabel> <FormControl><Input type="email" placeholder="tu@correo.com" {...field} /></FormControl> <FormMessage /> </FormItem>
                               )}/>
                               <FormField control={signupForm.control} name="password" render={({ field }) => (
                                 <FormItem> <FormLabel>Contraseña</FormLabel> <FormControl><Input type="password" placeholder="Crea una contraseña (mín. 6 caract.)" {...field} /></FormControl> <FormMessage /> </FormItem>
                               )}/>
                             </div>
                           )}

                            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between pt-4 border-t mt-6">
                               <Button type="button" variant="link" onClick={() => { setCurrentView('login'); setSignupStep(1); signupForm.reset(); resetPhoneVerification(); }} className="p-0 h-auto text-sm order-2 sm:order-1 self-center sm:self-auto">
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
                                       <Button type="submit" className="w-full sm:w-auto" disabled={signupForm.formState.isSubmitting || isLoading}>
                                           {signupForm.formState.isSubmitting || isLoading ? "Creando..." : "Crear Cuenta"}
                                       </Button>
                                   )}
                               </div>
                            </DialogFooter>
                      </form>
                      </Form>
                  </>
                )}
                {currentView === 'forgotPassword' && (
                  <>
                    <DialogHeader className="mb-4 text-center">
                      <ShadDialogTitle className="text-2xl">Recuperar Contraseña</ShadDialogTitle>
                      <DialogDescription>
                        Ingresa tu correo electrónico para enviarte un enlace de recuperación.
                      </DialogDescription>
                    </DialogHeader>
                     <Form {...forgotPasswordForm}>
                       <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPasswordSubmit)} className="space-y-4">
                         <FormField
                           control={forgotPasswordForm.control}
                           name="email"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Correo</FormLabel>
                               <FormControl>
                                 <Input placeholder="tu@correo.com" {...field} />
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                         <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between pt-4 border-t mt-6">
                           <Button type="button" variant="link" onClick={() => { setCurrentView('login'); forgotPasswordForm.reset(); }} className="p-0 h-auto text-sm order-2 sm:order-1 self-center sm:self-auto">
                             Volver a Ingresar
                           </Button>
                           <Button type="submit" className="order-1 sm:order-2 w-full sm:w-auto" disabled={forgotPasswordForm.formState.isSubmitting || isLoading}>
                             {forgotPasswordForm.formState.isSubmitting || isLoading ? "Enviando..." : "Enviar Enlace"}
                           </Button>
                         </DialogFooter>
                       </form>
                     </Form>
                  </>
                )}
               </div>
         </ScrollArea>
       </DialogContent>
      );
    }
    return null; 
  };


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
                {/* Desktop Auth/Profile Trigger */}
                <Dialog open={(showProfileDialog || showLoginDialog) && !isMobileSheetOpen} onOpenChange={handleOpenChange}>
                  {isLoggedIn && user ? (
                    <DialogPrimitive.Trigger asChild>
                      <Button variant="ghost" onClick={openProfileDialog} className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent/10 p-1 rounded-md overflow-hidden w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border group-data-[collapsible=icon]:rounded-full">
                        <Avatar className="h-8 w-8 flex-shrink-0 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7">
                          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                          <AvatarFallback>{user.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-sm text-left transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:sr-only">
                          <span className="font-semibold truncate">{user.name}</span>
                        </div>
                      </Button>
                    </DialogPrimitive.Trigger>
                  ) : (
                    <DialogPrimitive.Trigger asChild>
                      <Button variant="ghost" onClick={openLoginDialog} className="w-full justify-start transition-opacity duration-200 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:justify-center hover:bg-sidebar-accent/10">
                        <LogIn className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                        <span className="overflow-hidden whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:sr-only">
                          Ingresar / Crear Cuenta
                        </span>
                        <span className="sr-only group-data-[collapsible!=icon]:hidden">Ingresar</span>
                      </Button>
                    </DialogPrimitive.Trigger>
                  )}
                  {authDialogContent()}
                </Dialog>
              </SidebarFooter>
            </Sidebar>

            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Mobile Header */}
               <header className="sticky top-0 z-10 flex h-12 sm:h-14 items-center justify-between border-b bg-background px-3 sm:px-4 md:hidden flex-shrink-0">
                  {/* Placeholder for potential future mobile menu trigger if re-added, or it can be an empty div to maintain layout if other elements expect a left-aligned item */}
                  <div className="w-8 sm:w-10"></div> {/* Or an empty button placeholder if needed for spacing */}

                 <div className="flex items-center flex-grow justify-center">
                     <div className="flex items-center justify-center h-6 w-6 bg-primary rounded-full text-primary-foreground text-xs font-bold mr-1.5 flex-shrink-0">
                        SO
                     </div>
                      <h3 className="font-semibold text-md sm:text-lg">sportoffice</h3>
                  </div>
                   <div className="flex-shrink-0 w-8 sm:w-10">
                       <Dialog open={(showProfileDialog || showLoginDialog) && isMobile} onOpenChange={open => {
                         if (!open) {
                           handleOpenChange(false); // Close any auth dialog if mobile "profile" area is closed
                         }
                       }}>
                           {isLoggedIn && user ? (
                            <DialogPrimitive.Trigger asChild>
                             <Button variant="ghost" onClick={openProfileDialog} size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                               <Avatar className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer">
                                 <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar placeholder" />
                                 <AvatarFallback>{user.initials}</AvatarFallback>
                               </Avatar>
                               <span className="sr-only">Abrir perfil</span>
                             </Button>
                             </DialogPrimitive.Trigger>
                           ) : (
                            <DialogPrimitive.Trigger asChild>
                             <Button variant="ghost" onClick={openLoginDialog} size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                               <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                               <span className="sr-only">Ingresar / Crear Cuenta</span>
                             </Button>
                             </DialogPrimitive.Trigger>
                           )}
                          {authDialogContent()}
                         </Dialog>
                   </div>
               </header>

              {/* Main Content Area */}
              <SidebarInset className="flex-1 overflow-auto">
                  {children}
              </SidebarInset>
            </div>
            <Toaster />
          </div>
      </>
  );
}
