
"use client";

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter }
from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from 'next/image';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader as ShadSheetHeader,
  SheetTitle as ShadSheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import { Home, Settings, CreditCard, User as UserIcon, CalendarDays, Heart, UploadCloud, Search as SearchIcon, UserCircle, X as XIcon, Eye, EyeOff, ChevronLeft, ChevronRight, Menu, Dumbbell, LogIn, ArrowRight, Building, Asterisk } from "lucide-react";
import logoImage from '@/image/logoo.png';


import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose as ShadDialogDialogClose,
  DialogContent as ShadDialogContent,
  DialogDescription as ShadDialogDescription,
  DialogFooter as ShadDialogFooter,
  DialogHeader as ShadDialogHeader,
  DialogTitle as ShadDialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
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
import { RecaptchaVerifier, getAuth } from 'firebase/auth';
import { app as firebaseApp } from '@/lib/firebase';


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


const phoneRegex = new RegExp(/^\+[1-9]\d{1,14}$/);
const phoneValidation = z.string()
  .regex(phoneRegex, 'Número inválido. Debe estar en formato E.164 (ej: +573001234567).')
  .optional()
  .or(z.literal(""));


const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
  password: z.string().min(1, "La contraseña es requerida."),
});
type LoginValues = z.infer<typeof loginSchema>;

const signupStep1Schema = z.object({
  firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres."),
  lastName: z.string().min(2, "Apellido debe tener al menos 2 caracteres."),
  country: z.string().min(1, "Debes seleccionar un país.").default("CO"),
  phone: phoneValidation,
  profileType: z.string().min(1, "Debes seleccionar un tipo de perfil."),
});

const signupStep2Schema = z.object({
  dob: z.date({ required_error: "La fecha de nacimiento es requerida." }).optional().nullable(),
  gender: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Confirmar contraseña debe tener al menos 6 caracteres."),
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
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
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const {
    user,
    isLoggedIn,
    isLoading: authIsLoading,
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
    sendVerificationCode,
    verifyCode,
    handleForgotPasswordSubmit: contextHandleForgotPasswordSubmit,
   } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const [verificationCode, setVerificationCode] = useState("");


  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      country: "CO",
      phone: "",
      profileType: "",
      dob: null,
      gender: "",
      documentType: "",
      documentNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
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
       signupForm.clearErrors(['dob', 'gender', 'documentType', 'documentNumber', 'email', 'password', 'confirmPassword']);
   };

   const handleForgotPasswordSubmit = (data: ForgotPasswordValues) => {
    contextHandleForgotPasswordSubmit(data, forgotPasswordForm.reset);
  };

  const handlePhoneSendVerification = useCallback(async () => {
    const phoneNumber = signupForm.getValues("phone");
    if (!phoneNumber || !phoneValidation.safeParse(phoneNumber).success) {
      signupForm.setError("phone", { type: "manual", message: "Número de teléfono inválido para verificación." });
      return;
    }
    if (!recaptchaVerifierRef.current) {
      toast({ title: "Error de reCAPTCHA", description: "reCAPTCHA no está listo. Intenta de nuevo.", variant: "destructive" });
      return;
    }
    await sendVerificationCode(phoneNumber, recaptchaVerifierRef.current);
  }, [signupForm, sendVerificationCode, toast]);

  const handlePhoneVerifyCode = useCallback(async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({ title: "Error", description: "Ingresa un código de 6 dígitos.", variant: "destructive" });
      return;
    }
    await verifyCode(verificationCode);
    setVerificationCode("");
  }, [verificationCode, verifyCode, toast]);


  useEffect(() => {
    let verifier: RecaptchaVerifier | null = null;
    const authInstance = getAuth(firebaseApp);

    if (recaptchaContainerRef.current && !recaptchaVerifierRef.current && !authIsLoading && authInstance && (currentView === 'signup' && signupStep === 2)) {
      try {
        verifier = new RecaptchaVerifier(authInstance, recaptchaContainerRef.current, {
          'size': 'invisible',
          'callback': (response: any) => { console.log("reCAPTCHA solved:", response); },
          'expired-callback': () => {
            console.log("reCAPTCHA expired");
            toast({ title: "reCAPTCHA Expirado", description: "Por favor, intenta verificar de nuevo.", variant: "destructive" });
            resetPhoneVerification();
            recaptchaVerifierRef.current?.render().catch(err => console.error("reCAPTCHA re-render error:", err));
          }
        });
        verifier.render().then(widgetId => {
          console.log("reCAPTCHA rendered, widgetId:", widgetId);
          recaptchaVerifierRef.current = verifier;
        }).catch(err => {
          console.error("reCAPTCHA render error:", err);
          toast({ title: "Error de reCAPTCHA", description: "No se pudo inicializar la verificación reCAPTCHA.", variant: "destructive" });
        });
      } catch (error) {
        console.error("Error creating RecaptchaVerifier:", error);
        toast({ title: "Error de reCAPTCHA", description: "Error al crear el verificador reCAPTCHA.", variant: "destructive" });
      }
    }
    return () => { verifier?.clear(); recaptchaVerifierRef.current = null; };
  }, [authIsLoading, toast, resetPhoneVerification, currentView, signupStep]);


  const handleMobileSheetOpenChange = (open: boolean) => {
    setIsMobileSheetOpen(open);
    if (!open) {
      handleOpenChange(false);
    }
  };

  const goToSettings = () => {
      handleOpenChange(false);
      if (isMobileSheetOpen) setIsMobileSheetOpen(false);
      router.push('/settings');
  };

   const currentYear = getYear(new Date());

  const authDialogContent = () => {
    if (showProfileDialog && isLoggedIn && user) {
      return (
        <ShadDialogContent className="sm:max-w-md p-0 overflow-hidden">
           <ScrollArea className="max-h-[85vh]">
            <div className="p-6">
              <ShadDialogHeader className="text-center mb-4">
                <div className="flex flex-col items-center mb-3">
                   <Avatar className="h-20 w-20 mb-2 border-2 border-primary">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.name} data-ai-hint="user avatar large" />
                    <AvatarFallback className="text-2xl">{user.initials ?? 'U'}</AvatarFallback>
                   </Avatar>
                  <ShadDialogTitle className="text-xl">{user.name}</ShadDialogTitle>
                  <ShadDialogDescription className="text-sm">{user.email}</ShadDialogDescription>
                </div>
              </ShadDialogHeader>
              <div className="py-2 space-y-1 text-sm">
                <p><span className="font-medium text-muted-foreground">País:</span> {countries.find(c => c.code === user.country)?.name || user.country || 'No especificado'}</p>
                <p><span className="font-medium text-muted-foreground">Teléfono:</span> {user.phone || 'No especificado'} {user.phone && (user.isPhoneVerified ? <span className="text-green-600 text-xs ml-1">(Verificado)</span> : <span className="text-orange-600 text-xs ml-1">(No verificado)</span>)}</p>
                <p><span className="font-medium text-muted-foreground">Fecha de Nacimiento:</span> {user.dob ? format(new Date(user.dob), "PPP", {locale: es}) : 'No especificada'}</p>
              </div>
              <ShadDialogFooter className="mt-6 pt-4 border-t flex-col sm:flex-row sm:justify-between gap-2">
                <Button variant="outline" onClick={goToSettings} className="w-full sm:w-auto">Configuración</Button>
                 <ShadDialogDialogClose asChild>
                    <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">Cerrar Sesión</Button>
                 </ShadDialogDialogClose>
              </ShadDialogFooter>
            </div>
          </ScrollArea>
        </ShadDialogContent>
      );
    }

    if (showLoginDialog) {
      return (
        <ShadDialogContent className="p-0 overflow-hidden w-[calc(100%-2rem)] max-w-xs sm:max-w-sm">
           <ScrollArea className="max-h-[85vh]">
             <div className="p-6">
                {currentView === 'login' && (
                  <>
                    <ShadDialogHeader className="mb-4 text-center">
                      <ShadDialogTitle className="text-2xl">Ingresar</ShadDialogTitle>
                      <ShadDialogDescription>
                        Ingresa tu correo y contraseña para continuar.
                      </ShadDialogDescription>
                    </ShadDialogHeader>
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
                                <div className="relative">
                                    <Input type={showPassword ? "text" : "password"} placeholder="Ingresar la contraseña" {...field} />
                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        <span className="sr-only">{showPassword ? "Ocultar" : "Mostrar"} contraseña</span>
                                    </Button>
                                </div>
                              </FormControl>
                              {loginError && <p className="text-sm font-medium text-destructive pt-1">{loginError}</p>}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <Button type="button" variant="link" onClick={() => { setCurrentView('forgotPassword'); loginForm.reset(); resetPhoneVerification(); }} className="p-0 h-auto text-sm text-primary">
                            ¿Olvidaste tu contraseña?
                          </Button>
                        <ShadDialogFooter className="flex flex-row justify-between items-center pt-4 border-t mt-6">
                          <Button type="button" variant="link" onClick={() => { setCurrentView('signup'); setSignupStep(1); loginForm.reset(); signupForm.reset(); resetPhoneVerification(); }} className="p-0 h-auto text-sm">
                            ¿No tienes cuenta? Crear una
                          </Button>
                          <Button type="submit" disabled={loginForm.formState.isSubmitting || authIsLoading}>
                            {loginForm.formState.isSubmitting || authIsLoading ? "Ingresando..." : "Ingresar"}
                          </Button>
                        </ShadDialogFooter>
                      </form>
                    </Form>
                  </>
                )}
                {currentView === 'signup' && (
                  <>
                    <ShadDialogHeader className="mb-4 text-center">
                      <ShadDialogTitle className="text-2xl">Crear Cuenta</ShadDialogTitle>
                       <ShadDialogDescription>
                         Completa el formulario para crear tu cuenta. Paso {signupStep} de 2.
                       </ShadDialogDescription>
                    </ShadDialogHeader>
                    <div ref={recaptchaContainerRef} id="recaptcha-container-signup"></div>
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
                                    <Select onValueChange={field.onChange} value={field.value} defaultValue="CO">
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
                                            {field.value ? format(new Date(field.value), "PPP", { locale: es }) : <span>Elige una fecha</span>}
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
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input type={showPassword ? "text" : "password"} placeholder="Crea una contraseña (mín. 6 caract.)" {...field} />
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>

                                <FormField control={signupForm.control} name="confirmPassword" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Contraseña</FormLabel>
                                        <FormControl>
                                             <div className="relative">
                                                <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirma tu contraseña" {...field} />
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 {signupForm.getValues("phone") && !isVerificationSent && !(user?.isPhoneVerified && signupForm.getValues("phone") === user?.phone) && (
                                   <Button type="button" variant="outline" className="w-full mt-2" onClick={handlePhoneSendVerification} disabled={authIsLoading || isVerifyingCode}>
                                     Enviar código SMS para verificar teléfono
                                   </Button>
                                 )}
                                 {isVerificationSent && (
                                   <div className="mt-2 space-y-2 p-3 border rounded-md bg-muted/50">
                                     <Label htmlFor="signup-verification-code">Ingresa el código SMS</Label>
                                     <div className="flex items-center gap-2">
                                       <Input id="signup-verification-code" type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="123456" maxLength={6} className="flex-1"/>
                                       <Button type="button" onClick={handlePhoneVerifyCode} disabled={isVerifyingCode || verificationCode.length !== 6 || authIsLoading}>
                                         {isVerifyingCode ? "Verificando..." : "Confirmar"}
                                       </Button>
                                     </div>
                                     {phoneVerificationError && <p className="text-sm font-medium text-destructive mt-1">{phoneVerificationError}</p>}
                                   </div>
                                 )}
                             </div>
                           )}
                            {loginError && <p className="text-sm font-medium text-destructive pt-1">{loginError}</p>}

                            <ShadDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between pt-4 border-t mt-6">
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
                                       <Button type="submit" className="w-full sm:w-auto" disabled={signupForm.formState.isSubmitting || authIsLoading}>
                                           {signupForm.formState.isSubmitting || authIsLoading ? "Creando..." : "Crear Cuenta"}
                                       </Button>
                                   )}
                               </div>
                            </ShadDialogFooter>
                      </form>
                      </Form>
                  </>
                )}
                {currentView === 'forgotPassword' && (
                  <>
                    <ShadDialogHeader className="mb-4 text-center">
                      <ShadDialogTitle className="text-2xl">Recuperar Contraseña</ShadDialogTitle>
                      <ShadDialogDescription>
                        Ingresa tu correo electrónico para enviarte un enlace de recuperación.
                      </ShadDialogDescription>
                    </ShadDialogHeader>
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
                         <ShadDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between pt-4 border-t mt-6">
                           <Button type="button" variant="link" onClick={() => { setCurrentView('login'); forgotPasswordForm.reset(); }} className="p-0 h-auto text-sm order-2 sm:order-1 self-center sm:self-auto">
                             Volver a Ingresar
                           </Button>
                           <Button type="submit" className="order-1 sm:order-2 w-full sm:w-auto" disabled={forgotPasswordForm.formState.isSubmitting || authIsLoading}>
                             {forgotPasswordForm.formState.isSubmitting || authIsLoading ? "Enviando..." : "Enviar Enlace"}
                           </Button>
                         </ShadDialogFooter>
                       </form>
                     </Form>
                  </>
                )}
               </div>
         </ScrollArea>
       </ShadDialogContent>
      );
    }
    return null;
  };


  return (
      <>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden lg:flex flex-col flex-shrink-0 border-r bg-sidebar text-sidebar-foreground" side="left" variant="sidebar" collapsible="icon">
              <SidebarHeader className="p-2 border-b flex items-center gap-2 justify-start group-data-[collapsible=icon]:justify-center flex-shrink-0 h-14">
                  <Image src={logoImage} alt="Sportoffice Logo" className="h-8 w-auto group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-auto transition-all" priority />
                  <h3 className="text-lg font-semibold text-primary group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:sr-only transition-opacity duration-200 leading-none">
                    Sportoffice
                 </h3>
              </SidebarHeader>
              <SidebarContent className="flex-grow p-2 overflow-y-auto">
                <SidebarMenu>
                  {navegacion.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        href={item.href}
                        isActive={pathname === item.href}
                        tooltip={{ children: item.title, side: 'right', align: 'center' }}
                        className={cn(
                           pathname === item.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/10",
                           "h-10"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                         <span className="overflow-hidden whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:sr-only">
                            {item.title}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="p-2 border-t flex flex-col gap-2 flex-shrink-0">
                  {isLoggedIn && user ? (
                    <DialogTrigger asChild>
                      <Button variant="ghost" onClick={openProfileDialog} className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent/10 p-1 rounded-md overflow-hidden w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:rounded-md">
                         <Avatar className="h-8 w-8 flex-shrink-0 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7">
                           <AvatarImage src={user.avatarUrl || undefined} alt={user.name} data-ai-hint="user avatar placeholder" />
                           <AvatarFallback>{user.initials}</AvatarFallback>
                         </Avatar>
                         <div className="flex flex-col text-sm text-left transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:sr-only">
                           <span className="font-semibold truncate">{user.name}</span>
                         </div>
                       </Button>
                    </DialogTrigger>
                  ) : (
                    <DialogTrigger asChild>
                       <Button
                         onClick={openLoginDialog}
                         variant="accent"
                         className={cn(
                           "w-full justify-start text-sm h-10 px-3 py-2 bg-accent text-accent-foreground hover:bg-accent/90",
                           "group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:justify-center"
                         )}
                       >
                         <ArrowRight className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
                         <span className="overflow-hidden whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:sr-only">
                           Ingresar / Crear Cuenta
                         </span>
                         <span className="sr-only group-data-[collapsible!=icon]:hidden">
                           Ingresar
                         </span>
                       </Button>
                    </DialogTrigger>
                  )}
              </SidebarFooter>
            </Sidebar>

            {/* Mobile Header & Sheet */}
            <div className="flex flex-col flex-1 overflow-hidden">
               <header className="sticky top-0 z-10 flex h-14 items-center justify-start border-b bg-background px-3 sm:px-4 lg:hidden flex-shrink-0">
                  <Sheet open={isMobileSheetOpen} onOpenChange={handleMobileSheetOpenChange}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="-ml-2 sm:ml-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-6 sm:w-6"><line x1="3" x2="21" y1="12" y2="12"></line><line x1="3" x2="21" y1="6" y2="6"></line><line x1="3" x2="21" y1="18" y2="18"></line></svg>
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </SheetTrigger>
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                         <Image src={logoImage} alt="Sportoffice Logo" className="h-7 sm:h-8 w-auto" priority />
                         <h3 className="font-semibold text-primary text-base sm:text-lg leading-none">Sportoffice</h3>
                      </div>

                      <SheetContent side="left" className="w-60 p-0 bg-sidebar text-sidebar-foreground flex flex-col">
                          <ShadSheetHeader className="p-4 border-b flex flex-row items-center justify-between h-14 flex-shrink-0">
                               <div className="flex items-center gap-2">
                                 <Image src={logoImage} alt="Sportoffice Logo" className="h-8 w-auto" priority />
                                 <ShadSheetTitle className="text-lg font-semibold text-primary">Sportoffice</ShadSheetTitle>
                               </div>
                               <SheetClose asChild>
                                  <Button variant="ghost" size="icon" className="text-sidebar-foreground">
                                    <XIcon className="h-5 w-5" />
                                    <span className="sr-only">Cerrar menú</span>
                                  </Button>
                                </SheetClose>
                          </ShadSheetHeader>
                          <ScrollArea className="flex-grow">
                              <SidebarContent className="p-2">
                                   <SidebarMenu>
                                      {navegacion.map((item) => (
                                      <SidebarMenuItem key={item.title}>
                                          <SidebarMenuButton
                                              href={item.href}
                                              isActive={pathname === item.href}
                                              onClick={() => setIsMobileSheetOpen(false)}
                                              className={cn(
                                                "text-sm h-10 px-3",
                                                 pathname === item.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/10"
                                              )}
                                          >
                                              <item.icon className="h-4 w-4" />
                                              {item.title}
                                          </SidebarMenuButton>
                                      </SidebarMenuItem>
                                      ))}
                                   </SidebarMenu>
                              </SidebarContent>
                          </ScrollArea>
                           <SidebarFooter className="p-2 border-t flex-shrink-0">
                              {isLoggedIn && user ? (
                                <DialogTrigger asChild>
                                   <Button variant="ghost" onClick={() => { openProfileDialog(); setIsMobileSheetOpen(false); }} className="flex items-center gap-2 p-1 rounded-md w-full justify-start">
                                        <Avatar className="h-8 w-8"><AvatarImage src={user.avatarUrl || undefined} alt={user.name} data-ai-hint="user avatar small" /><AvatarFallback>{user.initials}</AvatarFallback></Avatar>
                                        <span className="font-medium truncate">{user.name}</span>
                                   </Button>
                                </DialogTrigger>
                               ) : (
                                <DialogTrigger asChild>
                                   <Button
                                      onClick={() => { openLoginDialog(); setIsMobileSheetOpen(false); }}
                                      variant="accent"
                                      className="w-full justify-start h-10 px-3"
                                   >
                                       <ArrowRight className="mr-2 h-4 w-4" /> Ingresar / Crear Cuenta
                                   </Button>
                                </DialogTrigger>
                               )}
                           </SidebarFooter>
                      </SheetContent>
                  </Sheet>
               </header>

              <SidebarInset className="flex-1 overflow-auto">
                  {children}
              </SidebarInset>
            </div>
          </div>

          {/* SINGLE DIALOG FOR AUTH - MOVED HERE */}
          <Dialog open={showProfileDialog || showLoginDialog} onOpenChange={handleOpenChange}>
            {authDialogContent()}
          </Dialog>

          <Toaster />
      </>
  );
}

