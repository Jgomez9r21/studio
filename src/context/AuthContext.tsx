
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { z } from "zod"; // Import z explicitly
import type { FieldErrors, UseFormReset, UseFormTrigger } from 'react-hook-form';
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
  type Auth
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase'; // Import initialized auth


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
  isPhoneVerified?: boolean; // Add flag for phone verification status
}

// Dummy user data (Keep for initial login simulation, phone verification will override)
const DUMMY_EMAIL = "user@ejemplo.com";
const DUMMY_PASSWORD = "user12345";
const dummyUser: User = {
  id: 'usr123',
  name: "Usuario Ejemplo",
  initials: "UE",
  avatarUrl: "https://picsum.photos/50/50?random=user", // Placeholder/default
  email: DUMMY_EMAIL,
  phone: "+1234567890", // Example phone number
  country: "CO",
  dob: new Date(1990, 5, 15).toISOString(),
  isPhoneVerified: true, // Assume verified initially for dummy user
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
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Número de teléfono inválido. Incluye el código de país (ej: +57...).").optional().or(z.literal("")), // Updated validation with example
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
type UpdateProfileData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  dob?: Date | null;
  avatarFile?: File | null;
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
  phoneVerificationError: string | null;
  isVerificationSent: boolean; // Track if code has been sent
  isVerifyingCode: boolean; // Track if code verification is in progress
  login: (credentials: LoginValues) => Promise<void>;
  signup: (details: SignupValues) => Promise<void>;
  logout: () => void;
  updateUser: (data: UpdateProfileData) => Promise<void>;
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
  sendVerificationCode: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<void>; // Firebase integration
  verifyCode: (code: string) => Promise<void>; // Firebase integration
  setIsVerificationSent: (sent: boolean) => void; // To reset UI state
  resetPhoneVerification: () => void; // To clear errors etc.
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

  // Phone Verification State
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneVerificationError, setPhoneVerificationError] = useState<string | null>(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);


  // Simulate checking auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      // For demo: Assume logged in initially for testing settings page
      setUser(dummyUser);
      setIsLoggedIn(true);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginValues) => {
    setLoginError(null);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    if (credentials.email === DUMMY_EMAIL && credentials.password === DUMMY_PASSWORD) {
      const loggedInUser = { ...dummyUser };
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
        dob: details.dob?.toISOString() || null,
        isPhoneVerified: false, // New accounts need phone verification
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

  // Updated updateUser function
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

      let newAvatarUrl = user.avatarUrl;

      if (data.avatarFile) {
          console.log("Simulating avatar upload for:", data.avatarFile.name);
          try {
              newAvatarUrl = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(data.avatarFile!);
              });
              console.log("Simulation: Using generated data URI for avatar preview.");
          } catch (error) {
                console.error("Error creating data URI for preview:", error);
                 toast({
                    title: "Error de Imagen",
                    description: "No se pudo generar la vista previa de la imagen.",
                    variant: "destructive",
                 });
                 newAvatarUrl = user.avatarUrl;
          }
      }


      const updatedFirstName = data.firstName || user.name.split(' ')[0];
      const updatedLastName = data.lastName || user.name.split(' ').slice(1).join(' ');
      const updatedName = `${updatedFirstName} ${updatedLastName}`;
      const updatedInitials = `${updatedFirstName[0]}${updatedLastName[0]}`;

      // Determine if phone number is being updated and needs verification
      const newPhone = data.phone !== undefined ? data.phone : user.phone;
      const isPhoneUpdated = newPhone !== user.phone;
      const needsVerification = isPhoneUpdated && !!newPhone; // Needs verification if phone changed and is not empty

      const updatedUser: User = {
          ...user,
          name: updatedName,
          initials: updatedInitials,
          phone: newPhone, // Update phone number
          country: data.country !== undefined ? data.country : user.country,
          dob: data.dob !== undefined ? (data.dob instanceof Date ? data.dob.toISOString() : data.dob) : user.dob,
          avatarUrl: newAvatarUrl,
          isPhoneVerified: needsVerification ? false : user.isPhoneVerified, // Reset verification status if phone changes
      };

      setUser(updatedUser); // Update the user state
      if (!needsVerification) { // Only toast success if phone doesn't need verification
        toast({
            title: "Perfil Actualizado",
            description: "Tus datos han sido guardados correctamente.",
        });
      } else {
         toast({
              title: "Verificación Requerida",
              description: "Tu número de teléfono ha cambiado. Por favor verifica tu nuevo número.",
              variant: "default", // Use default or warning variant
         });
         // Reset verification flow state for the new number
         resetPhoneVerification();
      }


      setIsLoading(false);
  }, [user, toast]);

  // --- Firebase Phone Auth Functions ---
   const sendVerificationCode = useCallback(async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
       setPhoneVerificationError(null);
       setIsLoading(true); // Indicate loading state
       try {
           const result = await signInWithPhoneNumber(firebaseAuth, phoneNumber, recaptchaVerifier);
           setConfirmationResult(result);
           setIsVerificationSent(true);
           toast({
               title: "Código Enviado",
               description: `Se envió un código de verificación a ${phoneNumber}.`,
           });
       } catch (error: any) {
           console.error("Error sending verification code:", error);
           // Handle specific Firebase errors
           let errorMessage = "No se pudo enviar el código de verificación. Inténtalo de nuevo.";
           if (error.code === 'auth/invalid-phone-number') {
               errorMessage = "El número de teléfono proporcionado no es válido.";
           } else if (error.code === 'auth/too-many-requests') {
               errorMessage = "Demasiadas solicitudes. Inténtalo más tarde.";
           } else if (error.code === 'auth/missing-phone-number') {
                errorMessage = "Ingresa un número de teléfono.";
           }
           setPhoneVerificationError(errorMessage);
           toast({ title: "Error", description: errorMessage, variant: "destructive" });
           setIsVerificationSent(false); // Reset verification state on error
       } finally {
           setIsLoading(false); // Clear loading state
       }
   }, [toast]);

   const verifyCode = useCallback(async (code: string) => {
       if (!confirmationResult) {
           setPhoneVerificationError("No se ha enviado un código de verificación.");
           return;
       }
       setPhoneVerificationError(null);
       setIsVerifyingCode(true);
       setIsLoading(true);
       try {
           await confirmationResult.confirm(code);
           // Phone number verified successfully!
           if (user) {
               const updatedUser = { ...user, isPhoneVerified: true };
               setUser(updatedUser); // Update user state locally
               // TODO: Update user profile in your backend to mark phone as verified
           }
           setConfirmationResult(null); // Clear confirmation result
           setIsVerificationSent(false); // Hide code input
           toast({ title: "Teléfono Verificado", description: "Tu número de teléfono ha sido verificado correctamente." });

       } catch (error: any) {
           console.error("Error verifying code:", error);
           let errorMessage = "El código ingresado es incorrecto o ha expirado.";
           if (error.code === 'auth/invalid-verification-code') {
               errorMessage = "El código de verificación no es válido.";
           } else if (error.code === 'auth/code-expired') {
               errorMessage = "El código de verificación ha expirado. Solicita uno nuevo.";
           }
           setPhoneVerificationError(errorMessage);
           toast({ title: "Error de Verificación", description: errorMessage, variant: "destructive" });
       } finally {
           setIsVerifyingCode(false);
           setIsLoading(false);
       }
   }, [confirmationResult, toast, user]);

  const resetPhoneVerification = useCallback(() => {
      setConfirmationResult(null);
      setPhoneVerificationError(null);
      setIsVerificationSent(false);
      setIsVerifyingCode(false);
  }, []);


  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setShowLoginDialog(false);
      setShowProfileDialog(false);
      setCurrentView('login');
      setSignupStep(1);
      setLoginError(null);
      resetPhoneVerification(); // Reset phone verification on dialog close
    }
  }, [resetPhoneVerification]);


  const openLoginDialog = useCallback(() => {
     if (isLoggedIn) {
         setShowProfileDialog(true);
     } else {
        setShowLoginDialog(true);
        setShowProfileDialog(false);
        setCurrentView('login');
        setSignupStep(1);
        setLoginError(null);
        resetPhoneVerification();
     }
  }, [isLoggedIn, resetPhoneVerification]);


  const openProfileDialog = useCallback(() => {
    if (isLoggedIn) {
        setShowProfileDialog(true);
        setShowLoginDialog(false);
        resetPhoneVerification(); // Also reset when opening profile directly
    } else {
        openLoginDialog();
    }
  }, [isLoggedIn, openLoginDialog, resetPhoneVerification]);

   const handleLoginSubmit = useCallback(async (data: LoginValues, resetForm: UseFormReset<LoginValues>) => {
        await login(data);
        // Logic inside login now handles success/failure reset
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
    phoneVerificationError, // Expose phone verification error
    isVerificationSent,
    isVerifyingCode,
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
    sendVerificationCode, // Expose Firebase function
    verifyCode,           // Expose Firebase function
    setIsVerificationSent,
    resetPhoneVerification,
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
