"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as z from "zod"; // Import zod
import type { FieldErrors, UseFormReset, UseFormTrigger } from 'react-hook-form';

// Define user type (can be expanded later)
interface User {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string;
  email: string;
  phone?: string;
  country?: string;
  dob?: Date | string; // Store as string/Date, adjust as needed
}

// Dummy user data for demonstration
const dummyUser: User = {
  id: 'usr123',
  name: "Usuario Ejemplo",
  initials: "UE",
  avatarUrl: "https://picsum.photos/50/50?random=user",
  email: "usuario@ejemplo.com",
  phone: "+1234567890",
  country: "CO",
  dob: new Date(1990, 5, 15).toISOString(), // Example date as ISO string
};

// Login and Signup types (assuming they exist in AppLayout or similar)
// Re-define or import them if needed
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

// Combined schema for final submission
const signupSchema = signupStep1Schema.merge(signupStep2Schema);
type SignupValues = z.infer<typeof signupSchema>;


interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean; // Add loading state if fetching user data async
  showLoginDialog: boolean;
  showProfileDialog: boolean;
  currentView: 'login' | 'signup';
  signupStep: number;
  loginError: string | null;
  login: (credentials: LoginValues) => Promise<void>; // Placeholder for actual login logic
  signup: (details: SignupValues) => Promise<void>; // Placeholder for actual signup logic
  logout: () => void;
  handleOpenChange: (open: boolean) => void;
  openLoginDialog: () => void;
  openProfileDialog: () => void;
  setCurrentView: (view: 'login' | 'signup') => void;
  setSignupStep: (step: number) => void;
  handleLoginSubmit: (data: LoginValues, resetForm: UseFormReset<LoginValues>) => void;
  handleSignupSubmit: (data: SignupValues, resetForm: UseFormReset<SignupValues>) => void;
  handleNextStep: (trigger: UseFormTrigger<SignupValues>, errors: FieldErrors<SignupValues>, toast: ReturnType<typeof useToast>['toast']) => Promise<void>;
  handlePrevStep: () => void;
  handleLogout: () => void; // Added missing handleLogout signature
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState(1);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulate checking auth status on mount
  useEffect(() => {
    // In a real app, check local storage/cookies for token, validate it, fetch user data
    const checkAuth = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // For demo: assume not logged in initially
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginValues) => {
    // --- SIMULATED LOGIN LOGIC ---
    setLoginError(null);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    if (credentials.email === dummyUser.email && credentials.password === "password") { // Check against dummy user data
      setUser(dummyUser);
      setIsLoggedIn(true);
      setShowLoginDialog(false);
      toast({ title: "Ingreso exitoso", description: `Bienvenido/a, ${dummyUser.name}!` });
    } else {
      const errorMessage = "Correo o contraseña incorrectos.";
      setLoginError(errorMessage);
      toast({ title: "Error de Ingreso", description: errorMessage, variant: "destructive" });
    }
    setIsLoading(false);
    // --- END SIMULATED LOGIN LOGIC ---
    // TODO: Replace with actual backend call
  }, [toast]);

   const signup = useCallback(async (details: SignupValues) => {
    // --- SIMULATED SIGNUP LOGIC ---
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // Create a new dummy user based on signup data (adjust as needed)
    const newUser: User = {
        id: `usr${Math.random().toString(36).substring(7)}`, // Generate a random ID
        name: `${details.firstName} ${details.lastName}`,
        initials: `${details.firstName[0]}${details.lastName[0]}`,
        avatarUrl: `https://picsum.photos/50/50?random=${Math.random()}`, // Random avatar
        email: details.email,
        phone: details.phone || undefined,
        country: details.country || undefined,
        dob: details.dob?.toISOString() || undefined,
    };

    setUser(newUser);
    setIsLoggedIn(true);
    setShowLoginDialog(false); // Close the dialog
    setCurrentView('login'); // Reset view
    setSignupStep(1); // Reset step
    toast({ title: "Cuenta Creada", description: `¡Bienvenido/a, ${details.firstName}! Tu cuenta ha sido creada.` });
    setIsLoading(false);
    // --- END SIMULATED SIGNUP LOGIC ---
     // TODO: Replace with actual backend call
  }, [toast]);


  const logout = useCallback(() => {
    // TODO: Implement actual logout (clear token, call backend endpoint if needed)
    setUser(null);
    setIsLoggedIn(false);
    setShowProfileDialog(false); // Close profile dialog on logout
    toast({ title: "Sesión cerrada" });
  }, [toast]);

  // Add handleLogout to match the context type signature
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);


  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setShowLoginDialog(false);
      setShowProfileDialog(false);
      setCurrentView('login'); // Reset view on close
      setSignupStep(1); // Reset signup step on close
      setLoginError(null); // Clear login errors on close
    }
    // Opening logic handled by specific open functions below
  }, []);

  const openLoginDialog = useCallback(() => {
    handleOpenChange(false); // Ensure other dialogs are closed first
    setCurrentView('login');
    setShowLoginDialog(true);
  }, [handleOpenChange]);

  const openProfileDialog = useCallback(() => {
    handleOpenChange(false); // Ensure other dialogs are closed first
    setShowProfileDialog(true);
  }, [handleOpenChange]);

  // Wrap form submissions to interact with context state
   const handleLoginSubmit = useCallback((data: LoginValues, resetForm: UseFormReset<LoginValues>) => {
        login(data).then(() => {
            // Only reset form if login was successful (no error)
            if (!loginError) {
                resetForm();
            }
        }).catch(() => {
           // Error handling is done within the login function itself via toast
        });
   }, [login, loginError]); // Add loginError dependency

   const handleSignupSubmit = useCallback((data: SignupValues, resetForm: UseFormReset<SignupValues>) => {
       signup(data).then(() => {
           resetForm();
       }).catch(() => {
           // Handle signup errors if the signup function throws
           toast({ title: "Error al Crear Cuenta", description: "No se pudo crear la cuenta. Inténtalo de nuevo.", variant: "destructive" });
       });
   }, [signup, toast]);

   const handleNextStep = useCallback(async (
    trigger: UseFormTrigger<SignupValues>,
    errors: FieldErrors<SignupValues>,
    toastFn: ReturnType<typeof useToast>['toast'] // Pass toast function explicitly
    ) => {
      const step1Fields: (keyof z.infer<typeof signupStep1Schema>)[] = ['firstName', 'lastName', 'country', 'profileType', 'phone'];
      const result = await trigger(step1Fields);
      if (result) {
         setSignupStep(2);
      } else {
         // Show toast for validation errors
         Object.values(errors).forEach(error => {
            if(error?.message && step1Fields.includes(error.ref?.name as any)) { // Check if error belongs to step 1
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
    handleOpenChange,
    openLoginDialog,
    openProfileDialog,
    setCurrentView,
    setSignupStep,
    handleLoginSubmit,
    handleSignupSubmit,
    handleNextStep,
    handlePrevStep,
    handleLogout, // Provide handleLogout in the context
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
