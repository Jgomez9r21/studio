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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { BarChart, Camera, Code, Construction, Database, DollarSign, Dumbbell, Edit, HomeIcon as LucideHomeIcon, ImageIcon, Lightbulb, Music, Palette, School2, User, X, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

// Define Category types with explicit icon typing - Reuse from page.tsx for consistency
interface Category {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Service Categories - Reuse from page.tsx for consistency
const categorias: Category[] = [
  { name: 'Instalación Deportiva', icon: Dumbbell },
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
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per image
const MAX_IMAGES = 8;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileSchema = z.instanceof(File)
  .refine(file => file.size <= MAX_FILE_SIZE, `El tamaño máximo por imagen es 5MB.`)
  .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), "Solo se aceptan formatos .jpg, .jpeg, .png y .webp.");

const serviceFormSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres.").max(100, "El título no puede tener más de 100 caracteres."),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres.").max(500, "La descripción no puede tener más de 500 caracteres."),
  category: z.string({ required_error: "Debes seleccionar una categoría." }).min(1, "Debes seleccionar una categoría."),
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
  category: "",
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
     console.log("Datos del servicio enviados (simulado):", {
         ...data,
         images: data.images ? data.images.map(img => ({ name: img.name, size: img.size, type: img.type })) : null, // Log image details array
     });
     // --- BACKEND INTEGRATION NEEDED ---
     // const formData = new FormData();
     // Object.entries(data).forEach(([key, value]) => {
     //   if (key === 'images' && Array.isArray(value)) {
     //      value.forEach((file, index) => {
     //        formData.append(`image_${index}`, file); // Send files with unique keys
     //      });
     //   } else if (value != null && !(value instanceof File)) { // Append other non-null, non-File values
     //     formData.append(key, String(value));
     //   }
     // });
     // try {
     //   const response = await fetch('/api/services', { method: 'POST', body: formData });
     //   if (!response.ok) throw new Error('Failed to publish service');
     //   toast({ title: "Servicio Publicado", description: "Tu servicio ha sido publicado correctamente." });
     //   form.reset();
     //   setPreviewImages([]);
     // } catch (error) {
     //   console.error("Failed to publish service:", error);
     //   toast({ title: "Error", description: "No se pudo publicar el servicio. Inténtalo de nuevo.", variant: "destructive" });
     // }

     // Simulate API call delay
     await new Promise(resolve => setTimeout(resolve, 1000));
     toast({
         title: "Servicio Publicado (Simulado)",
         description: "Tu servicio ha sido publicado correctamente.",
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
                     <div className="relative">
                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <FormControl>
                             <Input type="number" placeholder="50" {...field} className="pl-8" onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
                         </FormControl>
                     </div>
                     <FormDescription>
                        Ingresa tu tarifa base por hora.
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
             render={({ field: { onChange, value, ...rest } }) => ( // Destructure onChange
                 <FormItem>
                 <FormLabel>Imágenes del Servicio (Opcional, hasta {MAX_IMAGES})</FormLabel>
                 <FormControl>
                     <Input
                     type="file"
                     accept={ACCEPTED_IMAGE_TYPES.join(",")}
                     multiple // Allow multiple file selection
                     onChange={handleFileChange} // Use custom handler
                     {...rest} // Spread remaining field props (name, ref, etc.)
                     // Reset input value to allow re-uploading the same file(s) if needed
                     onClick={(event) => {
                        const element = event.target as HTMLInputElement
                        element.value = ''
                     }}
                     />
                 </FormControl>
                 <FormDescription>
                     Sube hasta {MAX_IMAGES} imágenes representativas (JPG, PNG, WEBP, máx 5MB c/u).
                 </FormDescription>
                 {previewImages.length > 0 && (
                     <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                     {previewImages.map((src, index) => (
                         <div key={index} className="relative group">
                         <img
                             src={src}
                             alt={`Vista previa ${index + 1}`}
                             className="w-full h-24 object-cover rounded-md shadow-sm" data-ai-hint="service image preview"
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

        <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid || (currentImages.length > MAX_IMAGES)}>
             {form.formState.isSubmitting ? "Publicando..." : "Publicar Servicio"}
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
          Debes iniciar sesión o crear una cuenta para poder publicar un servicio.
        </p>
        <Button onClick={openLoginDialog}>Iniciar Sesión / Crear Cuenta</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto"> {/* Adjusted max-width and padding */}
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
