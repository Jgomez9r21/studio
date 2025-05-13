// src/context/AuthContext.tsx
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { z } from "zod";
import type { FieldErrors, UseFormReset, UseFormTrigger } from 'react-hook-form';
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
  // type Auth // Not directly used from here, firebaseAuth is instance
  sendPasswordResetEmail, // Import for password reset
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase'; // Import initialized auth


interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  avatarUrl: string;
  email: string;
  phone?: string;
  country?: string;
  dob?: Date | string | null;
  isPhoneVerified?: boolean;
}

const DUMMY_EMAIL = "user@ejemplo.com";
const DUMMY_PASSWORD = "user12345";
const dummyUser: User = {
  id: 'usr123',
  name: "Usuario Ejemplo",
  firstName: "Usuario",
  lastName: "Ejemplo",
  initials: "UE",
  avatarUrl: "https://picsum.photos/50/50?random=user",
  email: DUMMY_EMAIL,
  phone: "+1234567890",
  country: "CO",
  dob: new Date(1990, 5, 15).toISOString(),
  isPhoneVerified: true,
};

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
  password: z.string().min(1, "La contraseña es requerida."),
});
type LoginValues = z.infer<typeof loginSchema>;

const signupStep1Schema = z.object({
  firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres."),
  lastName: z.string().min(2, "Apellido debe tener al menos 2 caracteres."),
  country: z.string().min(1, "Debes seleccionar un país."),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Número inválido. Incluye código de país (ej: +57...).").optional().or(z.literal("")),
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

// Schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;


export type UpdateProfileData = {
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
  currentView: 'login' | 'signup' | 'forgotPassword'; // Added 'forgotPassword'
  signupStep: number;
  loginError: string | null;
  phoneVerificationError: string | null;
  isVerificationSent: boolean;
  isVerifyingCode: boolean;
  login: (credentials: LoginValues) => Promise<void>;
  signup: (details: SignupValues) => Promise<void>;
  logout: () => void;
  updateUser: (data: UpdateProfileData) => Promise<void>;
  handleOpenChange: (open: boolean) => void;
  openLoginDialog: () => void;
  openProfileDialog: () => void;
  setCurrentView: (view: 'login' | 'signup' | 'forgotPassword') => void; // Updated
  setSignupStep: (step: number) => void;
  handleLoginSubmit: (data: LoginValues, resetForm: UseFormReset<LoginValues>) => void;
  handleSignupSubmit: (data: SignupValues, resetForm: UseFormReset<SignupValues>) => void;
  handleNextStep: (trigger: UseFormTrigger<SignupValues>, errors: FieldErrors<SignupValues>, toast: ReturnType<typeof useToast>['toast']) => Promise<void>;
  handlePrevStep: () => void;
  handleLogout: () => void;
  sendVerificationCode: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  setIsVerificationSent: (sent: boolean) => void;
  resetPhoneVerification: () => void;
  handleForgotPasswordSubmit: (data: ForgotPasswordValues, resetForm: UseFormReset<ForgotPasswordValues>) => Promise<void>; // Added
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'forgotPassword'>('login'); // Updated initial state type
  const [signupStep, setSignupStep] = useState(1);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneVerificationError, setPhoneVerificationError] = useState<string | null>(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const resetPhoneVerification = useCallback(() => {
      setConfirmationResult(null);
      setPhoneVerificationError(null);
      setIsVerificationSent(false);
      setIsVerifyingCode(false);
  }, []);

  const login = useCallback(async (credentials: LoginValues) => {
    setLoginError(null);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (credentials.email === DUMMY_EMAIL && credentials.password === DUMMY_PASSWORD) {
      const loggedInUser = { ...dummyUser };
      setUser(loggedInUser);
      setIsLoggedIn(true);
      setShowLoginDialog(false);
      toast({ title: "Ingreso exitoso", description: `¡Bienvenido/a de vuelta, ${loggedInUser.firstName}!` });
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
        firstName: details.firstName,
        lastName: details.lastName,
        initials: `${details.firstName[0]}${details.lastName[0]}`,
        avatarUrl: `https://picsum.photos/50/50?random=${Math.random()}`,
        email: details.email,
        phone: details.phone || undefined,
        country: details.country || undefined,
        dob: details.dob?.toISOString() || null,
        isPhoneVerified: false,
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
      await new Promise(resolve => setTimeout(resolve, 500));

      let newAvatarUrl = user.avatarUrl;
      if (data.avatarFile) {
          newAvatarUrl = URL.createObjectURL(data.avatarFile);
           // In a real app, you would upload the file to a persistent storage
           // and then revoke the object URL if it's still the current one.
           // For now, we just log that it might need revocation.
          if (user.avatarUrl.startsWith('blob:') && user.avatarUrl !== newAvatarUrl) {
            console.log("Consider revoking previous blob URL if no longer needed:", user.avatarUrl);
            // URL.revokeObjectURL(user.avatarUrl); // Uncomment if you manage this carefully
          }
      }

      const updatedFirstName = data.firstName || user.firstName;
      const updatedLastName = data.lastName || user.lastName;
      const updatedName = `${updatedFirstName} ${updatedLastName}`;
      const updatedInitials = `${updatedFirstName?.[0] ?? ''}${updatedLastName?.[0] ?? ''}`;
      const newPhone = data.phone !== undefined ? data.phone : user.phone;
      const isPhoneUpdated = newPhone !== user.phone;
      const needsVerification = isPhoneUpdated && !!newPhone && !(user.isPhoneVerified && newPhone === user.phone);

      const updatedUser: User = {
          ...user,
          name: updatedName,
          firstName: updatedFirstName,
          lastName: updatedLastName,
          initials: updatedInitials,
          phone: newPhone || '',
          country: data.country !== undefined ? data.country : user.country,
          dob: data.dob !== undefined ? (data.dob instanceof Date ? data.dob.toISOString() : data.dob) : user.dob,
          avatarUrl: newAvatarUrl,
          isPhoneVerified: needsVerification ? false : (user.isPhoneVerified ?? false),
      };
      setUser(updatedUser);

      if (!needsVerification) {
        toast({
            title: "Perfil Actualizado",
            description: "Tus datos han sido guardados correctamente.",
        });
      } else {
         toast({
              title: "Verificación Requerida",
              description: "Tu número de teléfono ha cambiado. Por favor verifica tu nuevo número.",
              variant: "default",
         });
         resetPhoneVerification();
      }
      setIsLoading(false);
  }, [user, toast, resetPhoneVerification]);

   const sendVerificationCode = useCallback(async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
       setPhoneVerificationError(null);
       setIsLoading(true);
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
           let errorMessage = "No se pudo enviar el código de verificación. Inténtalo de nuevo.";
           if (error.code === 'auth/invalid-phone-number') {
               errorMessage = "El número de teléfono proporcionado no es válido.";
           } else if (error.code === 'auth/too-many-requests') {
               errorMessage = "Demasiadas solicitudes. Inténtalo más tarde.";
           } else if (error.code === 'auth/missing-phone-number') {
                errorMessage = "Ingresa un número de teléfono.";
           } else if (error.code === 'auth/captcha-check-failed') {
               errorMessage = "Falló la verificación reCAPTCHA. Por favor, recarga la página e inténtalo de nuevo.";
           } else if (error.code === 'auth/network-request-failed') {
               errorMessage = "Error de red. Verifica tu conexión e inténtalo de nuevo.";
           }
           setPhoneVerificationError(errorMessage);
           toast({ title: "Error", description: errorMessage, variant: "destructive" });
           setIsVerificationSent(false);
       } finally {
           setIsLoading(false);
       }
   }, [toast]);

   const verifyCode = useCallback(async (code: string) => {
       if (!confirmationResult) {
           setPhoneVerificationError("Error: Intenta enviar el código de nuevo.");
           toast({ title: "Error", description: "Intenta enviar el código de verificación de nuevo.", variant: "destructive" });
           return;
       }
       setPhoneVerificationError(null);
       setIsVerifyingCode(true);
       setIsLoading(true);
       try {
           const credential = await confirmationResult.confirm(code);
           const verifiedUser = credential.user;
           if (user) {
               const updatedUser = {
                 ...user,
                 isPhoneVerified: true,
                 phone: verifiedUser.phoneNumber && verifiedUser.phoneNumber !== user.phone ? verifiedUser.phoneNumber : user.phone
               };
               setUser(updatedUser);
           }
           setConfirmationResult(null);
           setIsVerificationSent(false);
           toast({ title: "Teléfono Verificado", description: "Tu número de teléfono ha sido verificado correctamente." });
       } catch (error: any) {
           console.error("Error verifying code:", error);
           let errorMessage = "El código ingresado es incorrecto o ha expirado.";
            if (error.code === 'auth/invalid-verification-code') {
               errorMessage = "El código de verificación no es válido.";
           } else if (error.code === 'auth/code-expired') {
               errorMessage = "El código de verificación ha expirado. Solicita uno nuevo.";
           } else if (error.code === 'auth/credential-already-in-use') {
               errorMessage = "Este número de teléfono ya está asociado a otra cuenta.";
           }
           setPhoneVerificationError(errorMessage);
           toast({ title: "Error de Verificación", description: errorMessage, variant: "destructive" });
       } finally {
           setIsVerifyingCode(false);
           setIsLoading(false);
       }
   }, [confirmationResult, toast, user]);

    const openLoginDialog = useCallback(() => {
     if (isLoggedIn && user) {
         setShowProfileDialog(true);
         setShowLoginDialog(false);
     } else {
        setShowLoginDialog(true);
        setShowProfileDialog(false);
        setCurrentView('login');
        setSignupStep(1);
        setLoginError(null);
        resetPhoneVerification();
     }
    }, [isLoggedIn, user, resetPhoneVerification]);

    const openProfileDialog = useCallback(() => {
        if (isLoggedIn && user) {
            setShowProfileDialog(true);
            setShowLoginDialog(false);
            resetPhoneVerification();
        } else {
            openLoginDialog();
        }
    }, [isLoggedIn, user, openLoginDialog, resetPhoneVerification]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      if (showLoginDialog) setShowLoginDialog(false);
      if (showProfileDialog) setShowProfileDialog(false);
      setCurrentView('login');
      setSignupStep(1);
      setLoginError(null);
      resetPhoneVerification();
    }
  }, [showLoginDialog, showProfileDialog, resetPhoneVerification]);

   const handleLoginSubmit = useCallback(async (data: LoginValues, resetForm: UseFormReset<LoginValues>) => {
        await login(data);
   }, [login]);

   const handleSignupSubmit = useCallback((data: SignupValues, resetForm: UseFormReset<SignupValues>) => {
       signup(data).then(() => {
           resetForm();
       }).catch((err) => {
           console.error("Signup error:", err);
           toast({ title: "Error al Crear Cuenta", description: "No se pudo crear la cuenta. Inténtalo de nuevo.", variant: "destructive" });
       });
   }, [signup, toast]);

    const handleForgotPasswordSubmit = useCallback(async (data: ForgotPasswordValues, resetForm: UseFormReset<ForgotPasswordValues>) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, data.email);
      toast({
        title: "Correo Enviado",
        description: "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.",
      });
      setCurrentView('login'); // Switch back to login view
      resetForm();
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      let errorMessage = "No se pudo enviar el correo de recuperación. Inténtalo de nuevo.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No existe una cuenta con este correo electrónico.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El formato del correo electrónico no es válido.";
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

   const handleNextStep = useCallback(async (
    trigger: UseFormTrigger<SignupValues>,
    errors: FieldErrors<SignupValues>,
    toastFn: ReturnType<typeof useToast>['toast']
    ) => {
      const step1Fields: (keyof z.infer<typeof signupStep1Schema>)[] = ['firstName', 'lastName', 'country', 'profileType', 'phone'];
      const result = await trigger(step1Fields, { shouldFocus: true });
      if (result) {
         setSignupStep(2);
      } else {
         const firstErrorField = step1Fields.find(field => errors[field]);
         if (firstErrorField) {
            const errorElement = document.getElementsByName(firstErrorField)[0];
            errorElement?.focus();
            toastFn({ title: "Error de Validación", description: "Por favor, corrige los errores en el formulario.", variant: "destructive" });
         } else {
              toastFn({ title: "Error de Validación", description: "Por favor, completa los campos requeridos.", variant: "destructive" });
         }
      }
    }, []);

   const handlePrevStep = useCallback(() => {
       setSignupStep(1);
   }, []);

  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    showLoginDialog,
    showProfileDialog,
    currentView,
    signupStep,
    loginError,
    phoneVerificationError,
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
    sendVerificationCode,
    verifyCode,
    setIsVerificationSent,
    resetPhoneVerification,
    handleForgotPasswordSubmit, // Add new handler
  };

  if (isLoading && !user) { // Adjusted condition to show loading only if not logged in yet
     return <div>Cargando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
