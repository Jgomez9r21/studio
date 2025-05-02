"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout
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
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, getYear } from "date-fns"; // Import getYear
import { es } from 'date-fns/locale'; // Import Spanish locale
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { useAuth } from '@/context/AuthContext'; // Import useAuth

// Define the form schema using Zod
const profileFormSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(50, "El nombre no puede tener más de 50 caracteres."),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres.").max(50, "El apellido no puede tener más de 50 caracteres."),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Número de teléfono inválido.").optional().or(z.literal("")), // Basic phone validation, allow empty
  country: z.string().min(1, "Selecciona un país."), // Require country selection
  dob: z.date({ required_error: "La fecha de nacimiento es requerida." }).optional(),
  email: z.string().email("Correo electrónico inválido."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Start with empty default values for the form
const defaultValues: Partial<ProfileFormValues> = {
  firstName: "",
  lastName: "",
  phone: "",
  country: "", // Or a default country code if desired
  dob: undefined,
  email: "",
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
  // Add more countries as needed
];

function ProfileForm() {
   const { toast } = useToast(); // Initialize toast hook
   const { user } = useAuth(); // Get user data from context
   const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues, // Use empty defaults
    mode: "onChange",
  });

  // Populate form with user data from context when component mounts or user changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.name.split(' ')[0] || '', // Extract first name
        lastName: user.name.split(' ').slice(1).join(' ') || '', // Extract last name
        phone: user.phone || '',
        country: user.country || '',
        dob: user.dob ? new Date(user.dob) : undefined,
        email: user.email || '',
      });
    } else {
      form.reset(defaultValues); // Reset to defaults if user logs out
    }
  }, [user, form]); // Dependency array includes user and form


  function onSubmit(data: ProfileFormValues) {
     // TODO: Implement actual data saving logic here (e.g., call API to update user profile)
    console.log("Datos del perfil enviados:", data);
    toast({
        title: "Perfil Actualizado (Simulado)",
        description: "Tus datos han sido guardados correctamente.",
      });
  }

  const currentYear = getYear(new Date()); // Get the current year

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
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
               <FormItem>
                 <FormLabel>Teléfono</FormLabel>
                 <FormControl>
                   <Input type="tel" placeholder="+1234567890" {...field} />
                 </FormControl>
                 <FormMessage />
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
                    <Select onValueChange={field.onChange} value={field.value}> {/* Use value prop for controlled Select */}
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
                          format(field.value, "PPP", { locale: es }) // Format date in Spanish
                        ) : (
                          <span>Elige una fecha</span> // Updated placeholder
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      captionLayout="dropdown-buttons" // Enable dropdowns
                      fromYear={1900} // Set the start year
                      toYear={currentYear} // Set the end year to the current year
                      locale={es} // Set locale to Spanish
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
                  <Input type="email" placeholder="tu@correo.com" {...field} readOnly // Make email read-only, as it's usually the identifier
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


        <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
             {form.formState.isSubmitting ? "Actualizando..." : "Actualizar Perfil"}
         </Button>

      </form>
    </Form>
  );
}


const SettingsContent = () => {
 const { isLoggedIn, openLoginDialog } = useAuth(); // Get login status and openLoginDialog function

 return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto"> {/* Adjusted padding */}
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">Configuración de Perfil</h1>
       {isLoggedIn ? (
         <ProfileForm />
       ) : (
         <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-card p-6 text-center">
           <p className="mb-4 text-muted-foreground">Debes iniciar sesión para ver y editar tu perfil.</p>
           <Button onClick={openLoginDialog}>Iniciar Sesión / Crear Cuenta</Button>
         </div>
       )}
       {/* Add other settings sections later, e.g., Notifications, Password Change */}
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
