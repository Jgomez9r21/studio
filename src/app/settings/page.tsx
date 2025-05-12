
"use client";

// Removed: import { auth as firebaseAuth } from '@/lib/firebase'; // firebaseAuth is now handled in AuthContext
import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/layout/AppLayout';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Camera, CheckCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, getYear } from "date-fns";
import { es } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, UpdateProfileData } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RecaptchaVerifier, getAuth } from 'firebase/auth'; // Import RecaptchaVerifier from firebase/auth
import { app as firebaseApp } from '@/lib/firebase'; // Import the initialized Firebase app

// Zod schema for single file validation
const fileSchema = z.instanceof(File)
  .refine(file => file.size <= 5 * 1024 * 1024, `El tamaño máximo de la imagen es 5MB.`)
  .refine(
    file => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
    "Solo se aceptan formatos .jpg, .jpeg, .png y .webp."
  )
  .optional()
  .nullable();

// Phone validation regex (E.164 format starting with +) - Aligned with AuthContext
const phoneRegex = new RegExp(/^\+[1-9]\d{1,14}$/);
const phoneValidation = z.string()
  .regex(phoneRegex, 'Número inválido. Debe estar en formato E.164 (ej: +573001234567).')
  .optional()
  .or(z.literal("")); // Allow empty string

// Define the form schema using Zod
const profileFormSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(50, "El nombre no puede tener más de 50 caracteres."),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres.").max(50, "El apellido no puede tener más de 50 caracteres."),
  phone: phoneValidation,
  country: z.string().min(1, "Selecciona un país."),
  dob: z.date({ required_error: "La fecha de nacimiento es requerida." }).optional().nullable(), // Allow null
  email: z.string().email("Correo electrónico inválido."),
  avatarFile: fileSchema,
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Start with empty default values for the form
const defaultValues: Partial<ProfileFormValues> = {
  firstName: "",
  lastName: "",
  phone: "",
  country: "",
  dob: null,
  email: "",
  avatarFile: null,
};

// Dummy country list (keep consistent with signup form)
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


function ProfileForm() {
   const { toast } = useToast();
   const {
      user,
      updateUser,
      isLoading: authLoading, // Use isLoading from AuthContext
      sendVerificationCode,
      verifyCode,
      phoneVerificationError,
      isVerificationSent,
      isVerifyingCode,
      resetPhoneVerification,
    } = useAuth();
   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const recaptchaContainerRef = useRef<HTMLDivElement>(null); // Ref for reCAPTCHA container
   const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null); // Ref to store reCAPTCHA instance

   const [verificationCode, setVerificationCode] = useState("");
   const [originalPhoneNumber, setOriginalPhoneNumber] = useState<string | undefined>(undefined);

   const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange", // Validate on change
  });

  const currentPhoneNumber = form.watch("phone");
  const isPhoneValid = phoneValidation.safeParse(currentPhoneNumber).success;
  const isPhoneDifferent = currentPhoneNumber !== originalPhoneNumber;
  const isPhoneVerified = user?.isPhoneVerified ?? false; 
  const canSendVerification = isPhoneValid && currentPhoneNumber && currentPhoneNumber.length > 0 && isPhoneDifferent && !isPhoneVerified;


   // Initialize reCAPTCHA Verifier
   useEffect(() => {
       let verifier: RecaptchaVerifier | null = null;
       const authInstance = getAuth(firebaseApp); // Get auth instance from firebaseApp

       if (recaptchaContainerRef.current && !recaptchaVerifierRef.current && !authLoading && authInstance) {
           try {
             verifier = new RecaptchaVerifier(authInstance, recaptchaContainerRef.current, {
                 'size': 'invisible',
                 'callback': (response: any) => {
                     console.log("reCAPTCHA solved:", response);
                 },
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

       return () => {
           verifier?.clear(); 
           recaptchaVerifierRef.current = null; 
       };
   }, [authLoading, toast, resetPhoneVerification]); 

  // Populate form with user data or defaults, manage phone state
  useEffect(() => {
    if (user) {
      const initialPhone = user.phone || '';
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: initialPhone,
        country: user.country || '',
        dob: user.dob ? new Date(user.dob) : null, 
        email: user.email || '',
        avatarFile: null, 
      });
      setAvatarPreview(user.avatarUrl || null);
      setOriginalPhoneNumber(initialPhone);

      if (initialPhone === currentPhoneNumber || (isPhoneVerified && initialPhone === currentPhoneNumber)) {
         resetPhoneVerification();
         setVerificationCode("");
      }
    } else {
      form.reset(defaultValues);
      setAvatarPreview(null);
      setOriginalPhoneNumber(undefined);
      resetPhoneVerification();
      setVerificationCode("");
    }
  }, [user, form, resetPhoneVerification, currentPhoneNumber, isPhoneVerified]); // form is now a dependency


  const handleSendVerification = useCallback(async () => {
     if (!canSendVerification || !currentPhoneNumber || !recaptchaVerifierRef.current) {
        if (!isPhoneValid) {
             toast({ title: "Error", description: "Número de teléfono inválido.", variant: "destructive" });
        } else if (!currentPhoneNumber) {
            toast({ title: "Error", description: "Ingresa un número de teléfono.", variant: "destructive" });
        } else if (!recaptchaVerifierRef.current) {
             toast({ title: "Error de reCAPTCHA", description: "reCAPTCHA no está listo. Por favor, espera un momento e intenta de nuevo.", variant: "destructive" });
        }
         return;
     };
     console.log("Sending verification for:", currentPhoneNumber);
     await sendVerificationCode(currentPhoneNumber, recaptchaVerifierRef.current);
  }, [canSendVerification, currentPhoneNumber, sendVerificationCode, isPhoneValid, toast]);


  const handleVerifyCode = useCallback(async () => {
    if (!verificationCode || verificationCode.length !== 6) {
        toast({ title: "Error", description: "Ingresa un código de 6 dígitos.", variant: "destructive" });
        return;
    }
    await verifyCode(verificationCode);
    setVerificationCode(""); 
  }, [verificationCode, verifyCode, toast]);


  async function onSubmit(data: ProfileFormValues) {
     const authInstance = getAuth(firebaseApp);
     const latestUser = authInstance.currentUser; 
     
     // Check if phone is verified *on the Firebase auth object itself* if it has changed
     let isPhoneAuthVerified = isPhoneVerified; // Start with context's state
     if (data.phone && data.phone !== originalPhoneNumber && latestUser && latestUser.phoneNumber === data.phone) {
        // If phone number matches what's on Firebase Auth User, consider it verified by Firebase
        isPhoneAuthVerified = true;
     } else if (data.phone && data.phone !== originalPhoneNumber) {
        isPhoneAuthVerified = false; // If changed and not matching Firebase, it's not verified
     }


     if (data.phone && data.phone !== originalPhoneNumber && !isPhoneAuthVerified) {
         toast({
             title: "Verificación Requerida",
             description: "Debes verificar tu nuevo número de teléfono antes de guardar.",
             variant: "destructive",
         });
         return; 
     }

    const updateData: UpdateProfileData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone, 
        country: data.country,
        dob: data.dob,
        avatarFile: data.avatarFile, 
    };

     try {
       await updateUser(updateData);
       form.reset({ 
         ...form.getValues(), 
         avatarFile: null,
       });
        if (fileInputRef.current) {
           fileInputRef.current.value = ''; 
        }
       setOriginalPhoneNumber(data.phone || '');
        // Avatar preview updates via useEffect reacting to user state change in AuthContext
     } catch (error) {
       console.error("Failed to update profile:", error);
        toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
     }
  }

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    form.setValue("avatarFile", null, { shouldValidate: true });
    setAvatarPreview(user?.avatarUrl || null); 

    if (file) {
       const validationResult = fileSchema.safeParse(file);
       if (validationResult.success && validationResult.data) { 
         form.setValue("avatarFile", validationResult.data, { shouldValidate: true }); 
         const reader = new FileReader();
         reader.onloadend = () => {
           setAvatarPreview(reader.result as string); 
         };
         reader.readAsDataURL(validationResult.data);
       } else {
            (validationResult.error?.errors || [{ message: "Error de archivo desconocido." }]).forEach(err => {
                 toast({
                    title: "Error de Archivo",
                    description: err.message,
                    variant: "destructive",
                });
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
       }
    }
     if (!file || !fileSchema.safeParse(file).success) {
         if (fileInputRef.current) {
            fileInputRef.current.value = '';
         }
     }
  };

  const currentYear = getYear(new Date());

  const isSubmitDisabled = !form.formState.isDirty || 
                           form.formState.isSubmitting || 
                           authLoading || 
                           (isPhoneDifferent && !!currentPhoneNumber && !isPhoneVerified); 


  return (
    <Form {...form}>
       <div ref={recaptchaContainerRef} id="recaptcha-container-settings"></div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">

          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-primary relative group">
              <AvatarImage src={avatarPreview || undefined} alt={user?.name ?? 'Usuario'} data-ai-hint="user profile picture placeholder" />
              <AvatarFallback>{user?.initials ?? 'U'}</AvatarFallback>
                <div
                 className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                 onClick={() => fileInputRef.current?.click()}
                >
                 <Camera className="h-8 w-8 text-white" />
                 <span className="sr-only">Cambiar foto de perfil</span>
               </div>
            </Avatar>
            <FormField
              control={form.control}
              name="avatarFile"
              render={({ field: { ref, name, onBlur, onChange, value, ...fieldProps } }) => ( 
                <FormItem className="sr-only">
                  <FormLabel htmlFor="avatar-upload">Cambiar foto de perfil</FormLabel>
                  <FormControl>
                    <Input
                       id="avatar-upload"
                       type="file"
                       accept="image/jpeg,image/png,image/webp,image/jpg"
                       ref={fileInputRef} 
                       name={name} 
                       onBlur={onBlur} 
                       onChange={handleFileChange} 
                       className="hidden"
                       {...fieldProps} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Cambiar Foto
             </Button>
          </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Tu apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

         <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem className="md:col-span-2">
                 <FormLabel>Teléfono</FormLabel>
                  <div className="flex items-center gap-2 flex-wrap">
                     <FormControl className="flex-1 min-w-[150px]">
                        <Input type="tel" placeholder="+573001234567" {...field} />
                     </FormControl>
                     {canSendVerification && !isVerificationSent && (
                         <Button
                             type="button"
                             variant="outline"
                             onClick={handleSendVerification}
                             disabled={authLoading || isVerifyingCode} 
                         >
                             Verificar Número
                         </Button>
                     )}
                      {isPhoneVerified && currentPhoneNumber && currentPhoneNumber === user?.phone && (
                           <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Verificado</span>
                      )}
                      {isPhoneDifferent && !isPhoneVerified && !isVerificationSent && currentPhoneNumber && (
                           <span className="text-sm text-orange-600 flex items-center gap-1"><ShieldAlert className="h-4 w-4"/> Verificación requerida</span>
                      )}
                       {isVerificationSent && !isPhoneVerified && (
                           <span className="text-sm text-blue-600 flex items-center gap-1"><ShieldAlert className="h-4 w-4"/> Código enviado. Por favor, verifica.</span>
                       )}
                  </div>
                 <FormMessage /> 
                  {phoneVerificationError && <p className="text-sm font-medium text-destructive mt-1">{phoneVerificationError}</p>} 

                  {isVerificationSent && !isPhoneVerified && (
                      <div className="mt-2 space-y-2 p-3 border rounded-md bg-muted/50">
                          <Label htmlFor="verification-code-settings" className="text-sm">Ingresa el código de verificación</Label>
                          <div className="flex items-center gap-2">
                             <Input
                                id="verification-code-settings"
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="123456"
                                maxLength={6}
                                className="flex-1"
                             />
                             <Button
                                type="button"
                                onClick={handleVerifyCode}
                                disabled={isVerifyingCode || verificationCode.length !== 6 || authLoading}
                              >
                                 {isVerifyingCode ? "Verificando..." : "Confirmar Código"}
                              </Button>
                          </div>
                           {phoneVerificationError && <p className="text-sm font-medium text-destructive mt-1">{phoneVerificationError}</p>}
                      </div>
                  )}
                 </FormItem>
             )}
             />


            <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>País</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                     <FormControl>
                        <SelectTrigger>
                           <SelectValue placeholder="Selecciona tu país" />
                        </SelectTrigger>
                     </FormControl>
                    <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                              {country.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />


           <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Nacimiento</FormLabel>
                 <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                       <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", { locale: es }) 
                        ) : (
                          <span>Elige una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined} 
                      onSelect={(date) => field.onChange(date)} 
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={currentYear}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@correo.com" {...field} readOnly
                   className="bg-muted cursor-not-allowed border-none" />
                </FormControl>
                 <FormDescription>
                    Este es el correo electrónico asociado a tu cuenta (no se puede cambiar).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


         <Button type="submit" disabled={isSubmitDisabled}>
             {authLoading || form.formState.isSubmitting ? "Actualizando..." : "Actualizar Perfil"}
         </Button>

      </form>
    </Form>
  );
}


const SettingsContent = () => {
 const { user, isLoggedIn, openLoginDialog, isLoading } = useAuth(); 

 if (isLoading) {
     return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto flex justify-center items-center h-64">
           <p>Cargando configuración...</p> 
        </div>
     );
 }


 return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">Configuración de Perfil</h1>
       {isLoggedIn && user ? ( 
         <ProfileForm />
       ) : (
         <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-card p-6 text-center">
           <p className="mb-4 text-muted-foreground">Debes iniciar sesión para ver y editar tu perfil.</p>
           <Button onClick={openLoginDialog}>Iniciar Sesión / Crear Cuenta</Button>
         </div>
       )}
    </div>
  );
};


const Settings = () => {
  return (
    <AppLayout>
       <SettingsContent />
    </AppLayout>
  );
};

export default Settings;

    
