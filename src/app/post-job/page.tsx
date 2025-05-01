
"use client";

import type React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { BarChart, Camera, Code, Construction, Database, DollarSign, Dumbbell, Edit, HomeIcon as LucideHomeIcon, ImageIcon, Lightbulb, Music, Palette, School2, User } from 'lucide-react';

// Define Category types with explicit icon typing - Reuse from page.tsx for consistency
interface Category {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Service Categories - Reuse from page.tsx for consistency
const categorias: Category[] = [
  { name: 'Deporte', icon: Dumbbell },
  { name: 'Tecnología', icon: Code },
  { name: 'Entrenador Personal', icon: User },
  { name: 'Contratista', icon: Construction },
  { name: 'Mantenimiento Hogar', icon: LucideHomeIcon },
  { name: 'Profesores', icon: School2 },
  { name: 'Diseñadores', icon: Palette },
  { name: 'Marketing Digital', icon: BarChart },
  { name: 'Video & Animación', icon: Camera },
  { name: 'Redacción & Traducción', icon: Edit },
  { name: 'Música & Audio', icon: Music },
  { name: 'Finanzas', icon: DollarSign },
  // { name: 'Servicios de IA', icon: Bot }, // Assuming Bot is not in lucide-react, remove or replace
  { name: 'Crecimiento Personal', icon: Lightbulb },
  { name: 'Datos', icon: Database },
  { name: 'Fotografía', icon: ImageIcon },
];

// Define the form schema using Zod
const serviceFormSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres.").max(100, "El título no puede tener más de 100 caracteres."),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres.").max(500, "La descripción no puede tener más de 500 caracteres."),
  category: z.string({ required_error: "Debes seleccionar una categoría." }).min(1, "Debes seleccionar una categoría."),
  rate: z.coerce.number({ invalid_type_error: "La tarifa debe ser un número.", required_error: "La tarifa es requerida." }).positive("La tarifa debe ser un número positivo.").min(1, "La tarifa debe ser al menos 1."),
  availability: z.string().min(5, "Describe tu disponibilidad (ej: Lunes a Viernes 9am-5pm).").max(200, "La disponibilidad no puede exceder los 200 caracteres."),
  location: z.string().min(2, "Ingresa la ubicación o área de servicio.").max(100, "La ubicación no puede tener más de 100 caracteres."),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

// Default values for the form
const defaultValues: Partial<ServiceFormValues> = {
  title: "",
  description: "",
  category: "",
  // rate: undefined, // Use undefined for number inputs to allow placeholder
  availability: "",
  location: "",
};


function ServicePublicationForm() {
   const { toast } = useToast(); // Initialize toast hook
   const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues,
    mode: "onChange", // Validate on change for better UX
  });

  // Placeholder for actual submission logic
  async function onSubmit(data: ServiceFormValues) {
     // --- BACKEND INTEGRATION NEEDED ---
     // 1. Send the 'data' object to your backend API endpoint.
     // 2. Handle potential errors from the API call (e.g., network issues, validation errors).
     // 3. On success, show the toast and reset the form.
     // 4. On failure, show an error toast or message.
     // Example (conceptual):
     // try {
     //   const response = await fetch('/api/services', {
     //     method: 'POST',
     //     headers: { 'Content-Type': 'application/json' },
     //     body: JSON.stringify(data),
     //   });
     //   if (!response.ok) throw new Error('Failed to publish service');
     //   toast({ title: "Servicio Publicado", description: "Tu servicio ha sido publicado correctamente." });
     //   form.reset();
     // } catch (error) {
     //   console.error("Failed to publish service:", error);
     //   toast({ title: "Error", description: "No se pudo publicar el servicio. Inténtalo de nuevo.", variant: "destructive" });
     // }
    console.log("Datos del servicio enviados (simulado):", data);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
        title: "Servicio Publicado (Simulado)",
        description: "Tu servicio ha sido publicado correctamente.",
      });
    form.reset(); // Reset form after successful submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Servicio</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Entrenamiento Personalizado de Fitness" {...field} />
              </FormControl>
              <FormDescription>
                Un título claro y conciso que describa tu servicio.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Detallada</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe tu servicio en detalle, qué incluye, tu experiencia, etc."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
               <FormDescription>
                 Explica qué ofreces, tu metodología y experiencia relevante.
               </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {categorias.map((category) => (
                            <SelectItem key={category.name} value={category.name}>
                                <div className="flex items-center gap-2">
                                {category.icon && <category.icon className="h-4 w-4 text-muted-foreground" />}
                                {category.name}
                                </div>
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />

             {/* Rate */}
            <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tarifa (por hora)</FormLabel>
                    <FormControl>
                      <div className="relative">
                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input type="number" placeholder="50" {...field} className="pl-8" />
                      </div>
                    </FormControl>
                    <FormDescription>
                       Ingresa tu tarifa base por hora.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        {/* Availability */}
        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disponibilidad</FormLabel>
              <FormControl>
                 <Textarea
                  placeholder="Ej: Lunes a Viernes 9am-5pm, Sábados 10am-1pm"
                  className="resize-y min-h-[60px]"
                  {...field}
                />
              </FormControl>
               <FormDescription>
                 Indica los días y horarios generales en que ofreces el servicio.
               </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

         {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación / Área de Servicio</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ciudad, Remoto, A domicilio en Zona Norte" {...field} />
              </FormControl>
               <FormDescription>
                 Especifica dónde ofreces el servicio (ciudad, remoto, área específica).
               </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
            {form.formState.isSubmitting ? "Publicando..." : "Publicar Servicio"}
        </Button>
      </form>
    </Form>
  );
}


const PostJobContent = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto"> {/* Adjusted max-width */}
      <h1 className="text-2xl md:text-3xl font-semibold mb-2">Publica tu Servicio</h1>
      <p className="text-muted-foreground mb-6 md:mb-8">
        Completa el formulario para ofrecer tus habilidades y servicios en la plataforma.
      </p>
       <ServicePublicationForm />
    </div>
  );
};


const PostJob = () => {
  return (
     <AppLayout>
      <PostJobContent />
     </AppLayout>
  );
};

export default PostJob;


    