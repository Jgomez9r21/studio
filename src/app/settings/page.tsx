"use client";

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
import { Label } from "@/components/ui/label"; // Keep Label for non-form elements if needed
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
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Zod schema for single file validation
const fileSchema = z.instanceof(File)
  .refine(file => file.size <= 5 * 1024 * 1024, `El tamaño máximo de la imagen es 5MB.`)
  .refine(
    file => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
    "Solo se aceptan formatos .jpg, .jpeg, .png y .webp."
  )
  .optional()
  .nullable();

// Phone validation regex
const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);
const phoneValidation = z.string().regex(phoneRegex, 'Número de teléfono inválido.').optional().or(z.literal(""));

// Define the form schema using Zod
const profileFormSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(50, "El nombre no puede tener más de 50 caracteres."),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres.").max(50, "El apellido no puede tener más de 50 caracteres."),
  phone: phoneValidation,
  country: z.string().min(1, "Selecciona un país."),
  dob: z.date({ required_error: "La fecha de nacimiento es requerida." }).optional().nullable(), // Allow null
  email: z.string().email("Correo electrónico inválido."),
  avatarFile: fileSchema, // Use the defined file schema
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Start with empty default values for the form
const defaultValues: Partial<ProfileFormValues> = {
  firstName: "",
  lastName: "",
  phone: "",
  country: "",
  dob: null, // Initialize date as null
  email: "",
  avatarFile: null,
};

// Dummy country list
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

const DUMMY_VERIFICATION_CODE = "123456"; // For simulation

function ProfileForm() {
   const { toast } = useToast();
   const { user, updateUser, isLoading: authLoading } = useAuth();
   const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   // Phone Verification State
   const [originalPhoneNumber, setOriginalPhoneNumber] = useState<string | undefined>(undefined);
   const [isPhoneVerified, setIsPhoneVerified] = useState(true); // Assume verified initially if user exists with phone
   const [isVerificationSent, setIsVerificationSent] = useState(false);
   const [verificationCode, setVerificationCode] = useState("");
   const [verificationError, setVerificationError] = useState<string | null>(null);
   const [isVerifyingCode, setIsVerifyingCode] = useState(false);

   const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange", // Validate on change
  });

  const currentPhoneNumber = form.watch("phone");
  const isPhoneValid = phoneValidation.safeParse(currentPhoneNumber).success;
  const isPhoneDifferent = currentPhoneNumber !== originalPhoneNumber;
  const canSendVerification = isPhoneValid && isPhoneDifferent && !isPhoneVerified;

  // Populate form and phone verification state
  useEffect(() => {
    if (user) {
      const initialPhone = user.phone || '';
      form.reset({
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        phone: initialPhone,
        country: user.country || '',
        dob: user.dob ? new Date(user.dob) : null, // Ensure dob is Date or null
        email: user.email || '',
        avatarFile: null, // Always reset file input on user change
      });
      setAvatarPreview(user.avatarUrl || null);
      setOriginalPhoneNumber(initialPhone);
      // If the user has a phone number loaded, assume it's verified for this demo
      // In a real app, this status would come from the backend/user data
      setIsPhoneVerified(!!initialPhone);
      setIsVerificationSent(false); // Reset verification flow on user change
      setVerificationCode("");
      setVerificationError(null);
    } else {
      form.reset(defaultValues);
      setAvatarPreview(null);
      setOriginalPhoneNumber(undefined);
      setIsPhoneVerified(false);
      setIsVerificationSent(false);
      setVerificationCode("");
       setVerificationError(null);
    }
  }, [user, form.reset]);

  // Reset verification state if phone number changes back to original or becomes invalid
  useEffect(() => {
    if (!isPhoneDifferent) {
      setIsPhoneVerified(true); // If it matches original, it's considered verified (or doesn't need verification)
      setIsVerificationSent(false);
      setVerificationCode("");
      setVerificationError(null);
    } else if (isPhoneDifferent) {
        setIsPhoneVerified(false); // If it's different, it's not verified yet
        // Don't automatically reset isVerificationSent here, allow user to retry verification if needed
    }
     if (!isPhoneValid && isVerificationSent) {
        // If phone becomes invalid after sending code, reset verification
         setIsVerificationSent(false);
         setVerificationCode("");
         setVerificationError("Número de teléfono inválido. No se puede verificar.");
     }

  }, [currentPhoneNumber, originalPhoneNumber, isPhoneDifferent, isPhoneValid, isVerificationSent]);


  // Simulate sending verification code
  const handleSendVerificationCode = useCallback(async () => {
     if (!canSendVerification) return;
     setIsVerificationSent(true);
     setVerificationError(null); // Clear previous errors
     setVerificationCode(""); // Clear old code input
     toast({
       title: "Código Enviado (Simulado)",
       description: `Se envió un código de verificación a ${currentPhoneNumber}.`,
     });
     // In real app: await sendVerificationCodeApi(currentPhoneNumber);
     await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  }, [currentPhoneNumber, toast, canSendVerification]);

  // Simulate verifying the code
  const handleVerifyCode = useCallback(async () => {
    if (!verificationCode) {
        setVerificationError("Ingresa el código de verificación.");
        return;
    }
    setIsVerifyingCode(true);
    setVerificationError(null);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

    if (verificationCode === DUMMY_VERIFICATION_CODE) {
      setIsPhoneVerified(true);
      setIsVerificationSent(false); // Hide code input
      setOriginalPhoneNumber(currentPhoneNumber); // Update original number upon successful verification
      toast({
        title: "Teléfono Verificado",
        description: "Tu número de teléfono ha sido verificado.",
      });
    } else {
      setVerificationError("Código de verificación incorrecto.");
      toast({
        title: "Error de Verificación",
        description: "El código ingresado es incorrecto.",
        variant: "destructive",
      });
    }
    setIsVerifyingCode(false);
  }, [verificationCode, toast, currentPhoneNumber]);


  async function onSubmit(data: ProfileFormValues) {
     // Check if phone is different and not verified
     if (isPhoneDifferent && !isPhoneVerified) {
         toast({
             title: "Verificación Requerida",
             description: "Debes verificar tu nuevo número de teléfono antes de actualizar el perfil.",
             variant: "destructive",
         });
         return; // Prevent submission
     }

    // Pass the entire data object, including avatarFile, to updateUser
    const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone, // Send the (potentially new and verified) phone number
        country: data.country,
        dob: data.dob, // Pass Date object or null
        avatarFile: data.avatarFile, // Pass the File object or null
    };

     try {
       await updateUser(updateData);
       // Reset the form with potentially updated values (or keep existing if no feedback)
       // Clearing the avatarFile is crucial after successful submission
        form.reset({
         ...form.getValues(), // Keep current form values
         avatarFile: null, // Clear the file input value in the form state
       });
       if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Clear the actual file input element
       }
        // Reset verification state *after* successful profile update
        // Update original number state to reflect the newly saved number
       setOriginalPhoneNumber(data.phone || '');
       setIsPhoneVerified(!!data.phone); // Consider it verified if saved
       setIsVerificationSent(false);
       setVerificationCode("");
       setVerificationError(null);
       // The avatar preview should update automatically via the useEffect hook reacting to the user state change
     } catch (error) {
       console.error("Failed to update profile:", error);
       // Toast handled within updateUser context function
     }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       // Validate file using the schema before setting
       const validationResult = fileSchema.safeParse(file);
       if (validationResult.success) {
         form.setValue("avatarFile", file, { shouldValidate: true });
         const reader = new FileReader();
         reader.onloadend = () => {
           setAvatarPreview(reader.result as string); // Update preview
         };
         reader.readAsDataURL(file);
       } else {
           // Show validation errors from Zod
            (validationResult.error.errors || []).forEach(err => {
                 toast({
                    title: "Error de Archivo",
                    description: err.message,
                    variant: "destructive",
                });
            });
            // Reset file input and preview if validation fails
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            form.setValue("avatarFile", null, { shouldValidate: true });
            setAvatarPreview(user?.avatarUrl || null); // Revert preview
       }
    } else {
         form.setValue("avatarFile", null, { shouldValidate: true });
         setAvatarPreview(user?.avatarUrl || null); // Revert preview if no file selected
    }
     // Ensure the actual input element value is cleared if no file is selected or if validation fails
     // This allows re-selecting the same file after an error or cancellation.
     if (!file || !fileSchema.safeParse(file).success) {
         if (fileInputRef.current) {
            fileInputRef.current.value = '';
         }
     }
  };


  const currentYear = getYear(new Date());

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">

         {/* Avatar Section */}
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
              render={({ field: { ref, name, onBlur } }) => ( // Destructure to only use what's needed for control, exclude 'value' and 'onChange'
                <FormItem className="sr-only">
                  <FormLabel htmlFor="avatar-upload">Cambiar foto de perfil</FormLabel>
                  <FormControl>
                    <Input
                       id="avatar-upload"
                       type="file"
                       accept="image/jpeg,image/png,image/webp,image/jpg"
                       ref={fileInputRef} // Use the dedicated ref for direct manipulation
                       name={name} // Keep name for form state
                       onBlur={onBlur} // Keep onBlur for form state
                       onChange={handleFileChange} // Use custom handler
                       className="hidden"
                       // Do NOT control the value prop for file inputs
                       // value={undefined}
                    />
                  </FormControl>
                  <FormMessage /> {/* Show validation errors */}
                </FormItem>
              )}
            />
             <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Cambiar Foto
             </Button>
          </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
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

          {/* Last Name */}
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

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="md:col-span-2"> {/* Span across columns */}
                <FormLabel>Teléfono</FormLabel>
                 <div className="flex items-center gap-2 flex-wrap">
                  <FormControl className="flex-1 min-w-[150px]">
                    <Input type="tel" placeholder="+1234567890" {...field} />
                  </FormControl>
                  {isPhoneDifferent && !isPhoneVerified && !isVerificationSent && (
                      <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendVerificationCode}
                          disabled={!canSendVerification || authLoading}
                       >
                          Verificar Número
                       </Button>
                   )}
                    {isPhoneVerified && <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Verificado</span>}
                     {!isPhoneVerified && !isPhoneDifferent && currentPhoneNumber && <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Verificado</span>}
                     {isPhoneDifferent && !isPhoneVerified && isVerificationSent && !isPhoneVerified && (
                         <span className="text-sm text-orange-600 flex items-center gap-1"><ShieldAlert className="h-4 w-4"/> Verificación pendiente</span>
                     )}
                 </div>
                <FormMessage /> {/* Shows Zod validation errors */}

                 {/* Verification Code Input Section */}
                 {isVerificationSent && !isPhoneVerified && (
                     <div className="mt-2 space-y-2 p-3 border rounded-md bg-muted/50">
                         <Label htmlFor="verification-code" className="text-sm">Ingresa el código de verificación</Label>
                         <div className="flex items-center gap-2">
                            <Input
                               id="verification-code"
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
                                {isVerifyingCode ? "Verificando..." : "Confirmar"}
                             </Button>
                         </div>
                          {verificationError && <p className="text-sm font-medium text-destructive">{verificationError}</p>}
                           <Button
                             type="button"
                             variant="link"
                             size="sm"
                             onClick={handleSendVerificationCode}
                             disabled={!canSendVerification || authLoading}
                             className="p-0 h-auto text-xs"
                           >
                             Reenviar código
                           </Button>
                     </div>
                 )}
              </FormItem>
            )}
          />


            {/* Country */}
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


           {/* Date of Birth */}
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
                          format(field.value, "PPP", { locale: es })
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
                      selected={field.value ?? undefined} // Pass undefined if null
                      onSelect={field.onChange}
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

           {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@correo.com" {...field} readOnly
                   className="bg-muted cursor-not-allowed" />
                </FormControl>
                 <FormDescription>
                    Este es el correo electrónico asociado a tu cuenta (no se puede cambiar).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <Button
             type="submit"
             disabled={!form.formState.isDirty || form.formState.isSubmitting || authLoading || (isPhoneDifferent && !isPhoneVerified)}
         >
             {form.formState.isSubmitting || authLoading ? "Actualizando..." : "Actualizar Perfil"}
         </Button>

      </form>
    </Form>
  );
}


const SettingsContent = () => {
 const { isLoggedIn, openLoginDialog } = useAuth();

 return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">Configuración de Perfil</h1>
       {isLoggedIn ? (
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

    