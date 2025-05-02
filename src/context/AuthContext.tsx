"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as z from "zod"; // Import z explicitly
import type { FieldErrors, UseFormReset, UseFormTrigger } from 'react-hook-form';


// Define user type
interface User {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string; // This will store the persistent URL after upload (or placeholder)
  email: string;
  phone?: string;
  country?: string;
  dob?: Date | string | null; // Allow null
}

// Dummy user data
const DUMMY_EMAIL = "user@ejemplo.com";
const DUMMY_PASSWORD = "user12345"; // Changed to match login check
const dummyUser: User = {
  id: 'usr123',
  name: "Usuario Ejemplo",
  initials: "UE",
  avatarUrl: "https://picsum.photos/50/50?random=user", // Placeholder/default
  email: DUMMY_EMAIL,
  phone: "+1234567890",
  country: "CO",
  dob: new Date(1990, 5, 15).toISOString(),
};

// Zod Schemas for Login and Signup
const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
  password: z.string().min(1, "La contraseña es requerida."),
});
type LoginValues = z.infer<typeof loginSchema>;

const signupStep1Schema = z.object({
  firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres."),
  lastName: z.string().min(2, "Apellido debe tener al least 2 caracteres."),
  country: z.string().min(1, "Debes seleccionar un país."),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Número de teléfono inválido.").optional().or(z.literal("")), // Updated validation
  profileType: z.string().min(1, "Debes seleccionar un tipo de perfil."),
});

const signupStep2Schema = z.object({
  dob: z.date({ required_error: "La fecha de nacimiento es requerida." }).optional(),
  gender: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres."),
});

const signupSchema = signupStep1Schema.merge(signupStep2Schema);
type SignupValues = z.infer<typeof signupSchema>;

// Define the profile update data type (align with form values)
// Add avatarFile to accept the actual file
type UpdateProfileData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  dob?: Date | null;
  avatarFile?: File | null; // Accept the actual File object or null
  // Removed avatarUrl, we'll handle URL generation after upload simulation
};

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  showLoginDialog: boolean;
  showProfileDialog: boolean;
  currentView: 'login' | 'signup';
  signupStep: number;
  loginError: string | null;
  login: (credentials: LoginValues) => Promise<void>;
  signup: (details: SignupValues) => Promise<void>;
  logout: () => void;
  updateUser: (data: UpdateProfileData) => Promise<void>; // Update signature
  handleOpenChange: (open: boolean) => void;
  openLoginDialog: () => void;
  openProfileDialog: () => void;
  setCurrentView: (view: 'login' | 'signup') => void;
  setSignupStep: (step: number) => void;
  handleLoginSubmit: (data: LoginValues, resetForm: UseFormReset<LoginValues>) => void;
  handleSignupSubmit: (data: SignupValues, resetForm: UseFormReset<SignupValues>) => void;
  handleNextStep: (trigger: UseFormTrigger<SignupValues>, errors: FieldErrors<SignupValues>, toast: ReturnType<typeof useToast>['toast']) => Promise<void>;
  handlePrevStep: () => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState(1);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulate checking auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      // For demo: Assume logged in initially for testing settings page
      // Uncomment below to test logged out state
      // setUser(null);
      // setIsLoggedIn(false);

      // Comment out below to test logged out state
      // setUser(dummyUser);
      // setIsLoggedIn(true);

      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginValues) => {
    setLoginError(null);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    if (credentials.email === DUMMY_EMAIL && credentials.password === DUMMY_PASSWORD) { // Correct check
      const loggedInUser = { ...dummyUser }; // Use a copy
      setUser(loggedInUser);
      setIsLoggedIn(true);
      setShowLoginDialog(false);
      toast({ title: "Ingreso exitoso", description: `¡Bienvenido/a de vuelta, ${loggedInUser.name}!` });
    } else {
      const errorMessage = "Correo o contraseña incorrectos.";
      setLoginError(errorMessage);
      toast({ title: "Error de Ingreso", description: errorMessage, variant: "destructive" });
    }
    setIsLoading(false);
  }, [toast]);


   const signup = useCallback(async (details: SignupValues) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newUser: User = {
        id: `usr${Math.random().toString(36).substring(7)}`,
        name: `${details.firstName} ${details.lastName}`,
        initials: `${details.firstName[0]}${details.lastName[0]}`,
        avatarUrl: `https://picsum.photos/50/50?random=${Math.random()}`,
        email: details.email,
        phone: details.phone || undefined,
        country: details.country || undefined,
        dob: details.dob?.toISOString() || null, // Store as ISO string or null
    };

    setUser(newUser);
    setIsLoggedIn(true);
    setShowLoginDialog(false);
    setCurrentView('login');
    setSignupStep(1);
    toast({ title: "Cuenta Creada", description: `¡Bienvenido/a, ${details.firstName}! Tu cuenta ha sido creada.` });
    setIsLoading(false);
  }, [toast]);


  const logout = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    setShowProfileDialog(false);
    toast({ title: "Sesión cerrada" });
  }, [toast]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Updated updateUser function to handle file and simulate upload
  const updateUser = useCallback(async (data: UpdateProfileData) => {
      if (!user) {
            toast({
                title: "Error",
                description: "No se pudo actualizar el perfil. Usuario no encontrado.",
                variant: "destructive",
            });
            return;
       }

      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      let newAvatarUrl = user.avatarUrl; // Start with the current URL

      // Simulate file upload if a file is provided
      if (data.avatarFile) {
          console.log("Simulating avatar upload for:", data.avatarFile.name);
          // --- BACKEND INTEGRATION NEEDED ---
          // In a real app, you would upload data.avatarFile here to a storage service (e.g., Firebase Storage)
          // const uploadedUrl = await uploadFile(data.avatarFile);
          // For simulation, we'll generate a temporary URL (like a data URI or a new Picsum URL)
          // To keep the visual feedback immediate, we read the file as a data URL for the preview.
          // In a real scenario, you'd likely get a permanent URL back from the upload service.
          try {
              newAvatarUrl = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(data.avatarFile!); // Non-null assertion as we checked before
              });
              console.log("Simulation: Using generated data URI for avatar preview.");
          } catch (error) {
                console.error("Error creating data URI for preview:", error);
                 toast({
                    title: "Error de Imagen",
                    description: "No se pudo generar la vista previa de la imagen.",
                    variant: "destructive",
                 });
                 // Keep the old avatar URL if preview generation fails
                 newAvatarUrl = user.avatarUrl;
          }
          // newAvatarUrl = uploadedUrl; // In real app, use the URL returned from upload service
      }


      const updatedFirstName = data.firstName || user.name.split(' ')[0];
      const updatedLastName = data.lastName || user.name.split(' ').slice(1).join(' ');
      const updatedName = `${updatedFirstName} ${updatedLastName}`;
      const updatedInitials = `${updatedFirstName[0]}${updatedLastName[0]}`;


      const updatedUser: User = {
          ...user,
          name: updatedName,
          initials: updatedInitials,
          phone: data.phone !== undefined ? data.phone : user.phone,
          country: data.country !== undefined ? data.country : user.country,
          dob: data.dob !== undefined ? (data.dob instanceof Date ? data.dob.toISOString() : data.dob) : user.dob, // Store as ISO string or keep existing string/null
          avatarUrl: newAvatarUrl, // Update with the new URL (simulated or real)
      };

      setUser(updatedUser); // Update the user state
      toast({
          title: "Perfil Actualizado",
          description: "Tus datos han sido guardados correctamente.",
      });

      setIsLoading(false);
  }, [user, toast]);


  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setShowLoginDialog(false);
      setShowProfileDialog(false);
      setCurrentView('login');
      setSignupStep(1);
      setLoginError(null);
    }
    // // If opening, but already logged in, default to profile dialog instead of login
    // if (open && isLoggedIn) {
    //     // This logic is moved to openLoginDialog/openProfileDialog callers
    // } else if (open && !isLoggedIn) {
    //     setShowLoginDialog(true);
    // }

  }, []); // Removed isLoggedIn dependency as it's handled differently


  const openLoginDialog = useCallback(() => {
     if (isLoggedIn) {
         setShowProfileDialog(true); // Open profile if logged in
     } else {
        setShowLoginDialog(true); // Open login if not logged in
        setShowProfileDialog(false); // Ensure profile dialog is closed
        setCurrentView('login'); // Reset view
        setSignupStep(1); // Reset step
        setLoginError(null); // Reset error
     }
  }, [isLoggedIn]); // Add dependency


  const openProfileDialog = useCallback(() => {
    if (isLoggedIn) {
        setShowProfileDialog(true);
        setShowLoginDialog(false); // Ensure login dialog is closed
    } else {
        openLoginDialog(); // Redirect to login if not logged in
    }
  }, [isLoggedIn, openLoginDialog]); // Add dependencies

   const handleLoginSubmit = useCallback(async (data: LoginValues, resetForm: UseFormReset<LoginValues>) => {
        await login(data);
        // Reset only on successful login (handled inside `login` now)
   }, [login]);

   const handleSignupSubmit = useCallback((data: SignupValues, resetForm: UseFormReset<SignupValues>) => {
       signup(data).then(() => {
           resetForm();
       }).catch(() => {
           toast({ title: "Error al Crear Cuenta", description: "No se pudo crear la cuenta. Inténtalo de nuevo.", variant: "destructive" });
       });
   }, [signup, toast]);

   const handleNextStep = useCallback(async (
    trigger: UseFormTrigger<SignupValues>,
    errors: FieldErrors<SignupValues>,
    toastFn: ReturnType<typeof useToast>['toast']
    ) => {
      const step1Fields: (keyof z.infer<typeof signupStep1Schema>)[] = ['firstName', 'lastName', 'country', 'profileType', 'phone'];
      const result = await trigger(step1Fields);
      if (result) {
         setSignupStep(2);
      } else {
         Object.values(errors).forEach(error => {
            if(error?.message && step1Fields.includes(error.ref?.name as any)) {
                 toastFn({ title: "Error de Validación", description: error.message, variant: "destructive" });
            }
         });
      }
    }, []);

   const handlePrevStep = useCallback(() => {
       setSignupStep(1);
   }, []);


  const value = {
    user,
    isLoggedIn,
    isLoading,
    showLoginDialog,
    showProfileDialog,
    currentView,
    signupStep,
    loginError,
    login,
    signup,
    logout,
    updateUser,
    handleOpenChange,
    openLoginDialog,
    openProfileDialog,
    setCurrentView,
    setSignupStep,
    handleLoginSubmit,
    handleSignupSubmit,
    handleNextStep,
    handlePrevStep,
    handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
