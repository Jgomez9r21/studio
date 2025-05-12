
"use client";

import type React from 'react';
import { useState } from 'react'; // Import useState
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
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Dumbbell, DollarSign, X, Briefcase } from 'lucide-react'; // Keep Dumbbell for display
import { useAuth } from '@/context/AuthContext'; // Import useAuth

// Define Category types with explicit icon typing - Only "Instalación Deportiva"
interface Category {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Service Categories - Only "Instalación Deportiva"
const facilityCategory: Category = { name: 'Instalación Deportiva', icon: Dumbbell };

// Define the form schema using Zod
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per image
const MAX_IMAGES = 8;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileSchema = z.instanceof(File)
  .refine(file => file.size <= MAX_FILE_SIZE, `El tamaño máximo por imagen es 5MB.`)
  .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), "Solo se aceptan formatos .jpg, .jpeg, .png y .webp.");

const serviceFormSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres.").max(100, "El título no puede tener más de 100 caracteres."),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres.").max(500, "La descripción no puede tener más de 500 caracteres."),
  category: z.literal(facilityCategory.name).default(facilityCategory.name), // Hardcode category
  rate: z.coerce.number({ invalid_type_error: "La tarifa debe ser un número.", required_error: "La tarifa es requerida." }).positive("La tarifa debe ser un número positivo.").min(1, "La tarifa debe ser al menos 1."),
  availability: z.string().min(5, "Describe tu disponibilidad (ej: Lunes a Viernes 9am-5pm).").max(200, "La disponibilidad no puede exceder los 200 caracteres."),
  location: z.string().min(2, "Ingresa la ubicación o área de servicio.").max(100, "La ubicación no puede tener más de 100 caracteres."),
  images: z.array(fileSchema)
    .max(MAX_IMAGES, `Puedes subir un máximo de ${MAX_IMAGES} imágenes.`)
    .optional()
    .nullable(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

// Default values for the form
const defaultValues: Partial<ServiceFormValues> = {
  title: "",
  description: "",
  category: facilityCategory.name, // Default to the only category
  // rate: undefined, // Use undefined for number inputs to allow placeholder
  availability: "",
  location: "",
  images: [], // Initialize as empty array
};


function ServicePublicationForm() {
   const { toast } = useToast(); // Initialize toast hook
   const [previewImages, setPreviewImages] = useState<string[]>([]); // State for image previews
   const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues,
    mode: "onChange", // Validate on change for better UX
  });

   const currentImages = form.watch("images") || []; // Watch current files

   // Placeholder for actual submission logic
   async function onSubmit(data: ServiceFormValues) {
     console.log("Datos del espacio deportivo enviados (simulado):", {
         ...data,
         category: facilityCategory.name, // Ensure category is always set
         images: data.images ? data.images.map(img => ({ name: img.name, size: img.size, type: img.type })) : null,
     });

     // Simulate API call delay
     await new Promise(resolve => setTimeout(resolve, 1000));
     toast({
         title: "Espacio Deportivo Publicado (Simulado)",
         description: "Tu espacio deportivo ha sido publicado correctamente.",
       });
     form.reset(); // Reset form after successful submission
     setPreviewImages([]); // Reset preview images
   }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        const existingFiles = form.getValues("images") || [];
        const totalFiles = existingFiles.length + files.length;

        if (totalFiles > MAX_IMAGES) {
            toast({
                title: "Límite de imágenes excedido",
                description: `Solo puedes subir hasta ${MAX_IMAGES} imágenes. Se han ignorado las últimas seleccionadas.`,
                variant: "destructive",
            });
            // Take only enough files to reach the limit
            files.splice(MAX_IMAGES - existingFiles.length);
        }

        const newFiles = [...existingFiles, ...files];
        form.setValue("images", newFiles, { shouldValidate: true }); // Update form state and trigger validation

        // Update previews
        const newPreviews: string[] = [];
        const readFile = (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        };

        Promise.all(newFiles.map(readFile)).then(previews => {
            setPreviewImages(previews);
        }).catch(error => {
             console.error("Error generando vistas previas de imágenes:", error);
             toast({ title: "Error", description: "No se pudieron generar las vistas previas de las imágenes.", variant: "destructive" });
        });
    };

     const removeImage = (indexToRemove: number) => {
        const updatedFiles = (form.getValues("images") || []).filter((_, index) => index !== indexToRemove);
        form.setValue("images", updatedFiles, { shouldValidate: true }); // Update form state

        const updatedPreviews = previewImages.filter((_, index) => index !== indexToRemove);
        setPreviewImages(updatedPreviews); // Update previews
    };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Espacio Deportivo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Cancha de Fútbol La Central" {...field} />
              </FormControl>
              <FormDescription>
                Un nombre claro y conciso que describa tu espacio deportivo.
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
                  placeholder="Describe tu espacio, qué incluye (ej: vestuarios, iluminación), dimensiones, etc."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
               <FormDescription>
                 Explica qué ofreces, las características del espacio y cualquier detalle relevante.
               </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Display (Read-only) */}
        <FormItem>
            <FormLabel>Categoría</FormLabel>
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted text-muted-foreground">
                {facilityCategory.icon && <facilityCategory.icon className="h-5 w-5" />}
                <span>{facilityCategory.name}</span>
            </div>
            <FormDescription>
                Este formulario es exclusivamente para publicar espacios deportivos.
            </FormDescription>
        </FormItem>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
             {/* Rate */}
             <FormField
                 control={form.control}
                 name="rate"
                 render={({ field }) => (
                 <FormItem>
                     <FormLabel>Tarifa (por hora)</FormLabel>
                     <div className="relative">
                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <FormControl>
                             <Input type="number" placeholder="50" {...field} className="pl-8" onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
                         </FormControl>
                     </div>
                     <FormDescription>
                        Ingresa tu tarifa base por hora para el alquiler del espacio.
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
                  <FormLabel>Ubicación del Espacio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Calle Falsa 123, Ciudad Capital" {...field} />
                  </FormControl>
                  <FormDescription>
                    Especifica la dirección completa de tu espacio deportivo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

         {/* Image Upload */}
         <FormField
             control={form.control}
             name="images"
             render={({ field: { onChange, value, ...rest } }) => ( 
                 <FormItem>
                 <FormLabel>Imágenes del Espacio (Opcional, hasta {MAX_IMAGES})</FormLabel>
                 <FormControl>
                     <Input
                     type="file"
                     accept={ACCEPTED_IMAGE_TYPES.join(",")}
                     multiple // Allow multiple file selection
                     onChange={handleFileChange} // Use custom handler
                     {...rest} // Spread remaining field props (name, ref, etc.)
                     onClick={(event) => {
                        const element = event.target as HTMLInputElement
                        element.value = ''
                     }}
                     />
                 </FormControl>
                 <FormDescription>
                     Sube hasta {MAX_IMAGES} imágenes representativas de tu espacio (JPG, PNG, WEBP, máx 5MB c/u).
                 </FormDescription>
                 {previewImages.length > 0 && (
                     <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                     {previewImages.map((src, index) => (
                         <div key={index} className="relative group">
                         <img
                             src={src}
                             alt={`Vista previa ${index + 1}`}
                             className="w-full h-24 object-cover rounded-md shadow-sm" data-ai-hint="sports facility image preview"
                         />
                         <Button
                            type="button" // Prevent form submission
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-5 w-5 opacity-80 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Eliminar imagen {index + 1}</span>
                          </Button>
                         </div>
                     ))}
                     </div>
                 )}
                 <FormMessage />
                 </FormItem>
             )}
         />


        {/* Availability */}
        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disponibilidad y Horarios</FormLabel>
              <FormControl>
                 <Textarea
                  placeholder="Ej: Lunes a Viernes 9am-10pm, Sábados y Domingos 8am-11pm. Cerrado festivos."
                  className="resize-y min-h-[60px]"
                  {...field}
                />
              </FormControl>
               <FormDescription>
                 Indica los días y horarios generales en que tu espacio deportivo está disponible para alquiler.
               </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid || (currentImages.length > MAX_IMAGES)}>
             {form.formState.isSubmitting ? "Publicando..." : "Publicar Espacio Deportivo"}
         </Button>

      </form>
    </Form>
  );
}


const PostJobContent = () => {
  const { isLoggedIn, isLoading, openLoginDialog } = useAuth();

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto flex justify-center items-center h-64">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center border rounded-lg bg-card">
        <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-6" />
        <h2 className="text-xl font-medium mb-2 text-foreground">Acceso Restringido</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Debes iniciar sesión o crear una cuenta para poder publicar un espacio deportivo.
        </p>
        <Button onClick={openLoginDialog}>Iniciar Sesión / Crear Cuenta</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold mb-2">Publica tu Espacio Deportivo</h1>
      <p className="text-muted-foreground mb-6 md:mb-8">
        Completa el formulario para ofrecer tu espacio deportivo en la plataforma.
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
