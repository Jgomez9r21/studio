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
//import { auth as firebaseAuth } from '@/lib/firebase'; // Import initialized auth

// Define user type
interface User {
  id: string;
  name: string;
  firstName: string; // Added for easier access
  lastName: string; // Added for easier access
  initials: string;
  avatarUrl: string; // This will store the persistent URL after upload (or placeholder)
  email: string;
  phone?: string;
  country?: string;
  dob?: Date | string | null; // Allow null
  isPhoneVerified?: boolean; // Add flag for phone verification status
}

// Corrected Dummy User Credentials
const DUMMY_EMAIL = "user@ejemplo.com";
const DUMMY_PASSWORD = "user12345"; // Corrected password
const dummyUser: User = {
  id: 'usr123',
  name: "Usuario Ejemplo",
  firstName: "Usuario",
  lastName: "Ejemplo",
  initials: "UE",
  avatarUrl: "https://picsum.photos/50/50?random=user", // Placeholder/default
  email: DUMMY_EMAIL,
  phone: "+1234567890", // Example phone number
  country: "CO",
  dob: new Date(1990, 5, 15).toISOString(),
  isPhoneVerified: true, // Assume verified initially for dummy user
};

// Zod Schemas for Login and Signup (Ensure these match the forms in AppLayout)
const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
  password: z.string().min(1, "La contraseña es requerida."),
});
type LoginValues = z.infer<typeof loginSchema>;

const signupStep1Schema = z.object({
  firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres."),
  lastName: z.string().min(2, "Apellido debe tener al menos 2 caracteres."),
  country: z.string().min(1, "Debes seleccionar un país."),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Número inválido. Incluye código de país (ej: +57...).").optional().or(z.literal("")), // Updated validation
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

// Define the profile update data type (align with form values in settings/page.tsx)
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
  const [isLoading, setIsLoading] = useState(true); // Start loading until auth check completes
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
      setIsLoading(true); // Ensure loading state is true initially
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async check
      // For demo: Assume logged in initially for testing settings page
      // In a real app, check Firebase Auth state: getAuth().onAuthStateChanged(...)
      // setUser(dummyUser); // Uncomment for testing logged in state
      // setIsLoggedIn(true); // Uncomment for testing logged in state
      setIsLoading(false); // Set loading false after check completes
    };
    checkAuth();
  }, []); // Empty dependency array ensures this runs only once on mount


  const resetPhoneVerification = useCallback(() => {
      setConfirmationResult(null);
      setPhoneVerificationError(null);
      setIsVerificationSent(false);
      setIsVerifyingCode(false);
      // Consider resetting the reCAPTCHA verifier if applicable
  }, []);

  const login = useCallback(async (credentials: LoginValues) => {
    setLoginError(null);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    // Use the correct dummy credentials
    if (credentials.email === DUMMY_EMAIL && credentials.password === DUMMY_PASSWORD) {
      const loggedInUser = { ...dummyUser };
      setUser(loggedInUser);
      setIsLoggedIn(true);
      setShowLoginDialog(false);
      toast({ title: "Ingreso exitoso", description: `¡Bienvenido/a de vuelta, ${loggedInUser.firstName}!` }); // Use firstName
    } else {
      const errorMessage = "Correo o contraseña incorrectos.";
      setLoginError(errorMessage);
      toast({ title: "Error de Ingreso", description: errorMessage, variant: "destructive" });
    }
    setIsLoading(false);
  }, [toast]);


   const signup = useCallback(async (details: SignupValues) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

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
        isPhoneVerified: false, // New accounts need phone verification
    };

    setUser(newUser);
    setIsLoggedIn(true);
    setShowLoginDialog(false); // Close the dialog on successful signup
    setCurrentView('login'); // Reset view for next time
    setSignupStep(1);      // Reset step for next time
    toast({ title: "Cuenta Creada", description: `¡Bienvenido/a, ${details.firstName}! Tu cuenta ha sido creada.` });
    setIsLoading(false);
  }, [toast]);


  const logout = useCallback(() => {
    // In a real app, also sign out from Firebase: getAuth().signOut()
    setUser(null);
    setIsLoggedIn(false);
    setShowProfileDialog(false); // Ensure profile dialog is closed on logout
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
      let objectUrlToRevoke: string | null = null;

      // Simulate avatar upload or update
      if (data.avatarFile) {
          console.log("Simulating avatar upload for:", data.avatarFile.name);
          try {
              // Use createObjectURL for *preview only*
              newAvatarUrl = URL.createObjectURL(data.avatarFile);
              objectUrlToRevoke = newAvatarUrl; // Store for potential later revocation
              console.log("Simulation: Using generated object URL for avatar preview:", newAvatarUrl);
               // Important: In a real app, upload to Firebase Storage here
               // const storageRef = ref(storage, `avatars/${user.id}`);
               // await uploadBytes(storageRef, data.avatarFile);
               // newAvatarUrl = await getDownloadURL(storageRef); // Get persistent URL
          } catch (error) {
                console.error("Error creating object URL for preview:", error);
                 toast({
                    title: "Error de Imagen",
                    description: "No se pudo generar la vista previa de la imagen.",
                    variant: "destructive",
                 });
                 newAvatarUrl = user.avatarUrl; // Keep old URL on error
          }
      }


      const updatedFirstName = data.firstName || user.firstName;
      const updatedLastName = data.lastName || user.lastName;
      const updatedName = `${updatedFirstName} ${updatedLastName}`;
      const updatedInitials = `${updatedFirstName?.[0] ?? ''}${updatedLastName?.[0] ?? ''}`;

      // Determine if phone number is being updated and needs verification
      const newPhone = data.phone !== undefined ? data.phone : user.phone;
      const isPhoneUpdated = newPhone !== user.phone;
      // Needs verification if phone changed AND is not empty AND was not previously verified with this number
      const needsVerification = isPhoneUpdated && !!newPhone && !(user.isPhoneVerified && newPhone === user.phone);


      const updatedUser: User = {
          ...user,
          name: updatedName,
          firstName: updatedFirstName, // Update firstName
          lastName: updatedLastName,   // Update lastName
          initials: updatedInitials,
          phone: newPhone || '', // Ensure phone is string or empty string
          country: data.country !== undefined ? data.country : user.country,
          dob: data.dob !== undefined ? (data.dob instanceof Date ? data.dob.toISOString() : data.dob) : user.dob,
          avatarUrl: newAvatarUrl, // Use new URL (persistent from Storage or temporary Object URL)
          // Reset verification status ONLY if phone changes to a new, non-empty value
          isPhoneVerified: needsVerification ? false : (user.isPhoneVerified ?? false), // Handle potential undefined isPhoneVerified
      };

      setUser(updatedUser); // Update the user state

      // Revoke previous object URL if a new one was created and we are done with it
      if (objectUrlToRevoke && objectUrlToRevoke !== user.avatarUrl && user.avatarUrl.startsWith('blob:')) {
         // URL.revokeObjectURL(user.avatarUrl); // Be cautious with revoking if the URL is still needed elsewhere
         console.log("Consider revoking previous blob URL if no longer needed:", user.avatarUrl);
      }


      // Conditional Toasting based on verification need
      if (!needsVerification) {
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
         resetPhoneVerification(); // Ensure previous confirmationResult is cleared
      }

      setIsLoading(false);
  }, [user, toast, resetPhoneVerification]); // Dependency array includes user and toast

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
           } else if (error.code === 'auth/captcha-check-failed') {
               errorMessage = "Falló la verificación reCAPTCHA. Por favor, recarga la página e inténtalo de nuevo.";
           } else if (error.code === 'auth/network-request-failed') {
               errorMessage = "Error de red. Verifica tu conexión e inténtalo de nuevo.";
           }

           setPhoneVerificationError(errorMessage);
           toast({ title: "Error", description: errorMessage, variant: "destructive" });
           setIsVerificationSent(false); // Reset verification state on error
       } finally {
           setIsLoading(false); // Clear loading state
       }
   }, [toast]); // Only toast depends on external scope

   const verifyCode = useCallback(async (code: string) => {
       if (!confirmationResult) {
           setPhoneVerificationError("Error: Intenta enviar el código de nuevo."); // More informative error
           toast({ title: "Error", description: "Intenta enviar el código de verificación de nuevo.", variant: "destructive" });
           return;
       }
       setPhoneVerificationError(null);
       setIsVerifyingCode(true);
       setIsLoading(true);
       try {
           const credential = await confirmationResult.confirm(code);
           // Phone number verified successfully!
           const verifiedUser = credential.user; // Get the user from the credential
           if (user) {
               const updatedUser = {
                 ...user,
                 isPhoneVerified: true,
                 // Update phone number from auth if available and different
                 phone: verifiedUser.phoneNumber && verifiedUser.phoneNumber !== user.phone ? verifiedUser.phoneNumber : user.phone
               };
               setUser(updatedUser); // Update user state locally
               // TODO: Update user profile in your backend to mark phone as verified
               // e.g., await updateBackendProfile({ isPhoneVerified: true, phone: updatedUser.phone });
           }
           setConfirmationResult(null); // Clear confirmation result
           setIsVerificationSent(false); // Hide code input UI
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
   }, [confirmationResult, toast, user]); // Depends on confirmationResult, toast, user


   // Define openLoginDialog and openProfileDialog first
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
    }, [isLoggedIn, user, resetPhoneVerification]); // Added resetPhoneVerification


    const openProfileDialog = useCallback(() => {
        if (isLoggedIn && user) {
            setShowProfileDialog(true);
            setShowLoginDialog(false);
            resetPhoneVerification(); // Reset on opening profile too
        } else {
            openLoginDialog(); // Redirect to login if not logged in
        }
    }, [isLoggedIn, user, openLoginDialog, resetPhoneVerification]); // Added resetPhoneVerification


  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      // Close appropriate dialog based on which one might be open
      if (showLoginDialog) setShowLoginDialog(false);
      if (showProfileDialog) setShowProfileDialog(false);
      // Reset state only if closing, not on opening
      setCurrentView('login');
      setSignupStep(1);
      setLoginError(null);
      resetPhoneVerification(); // Reset phone verification on dialog close
    }
    // Don't automatically open a dialog here, let openLoginDialog/openProfileDialog handle it
  }, [showLoginDialog, showProfileDialog, resetPhoneVerification]);



   // Pass resetForm to the context function
   const handleLoginSubmit = useCallback(async (data: LoginValues, resetForm: UseFormReset<LoginValues>) => {
        await login(data);
        // Login function handles success/failure logic including toast and dialog closing
        // Optionally reset form fields here if login function doesn't handle it on failure
        // if (loginError) { // Check if there was an error after login attempt
        //   // Maybe don't reset on error, let user correct input
        // } else {
        //    resetForm(); // Reset only on success if desired
        // }
   }, [login]); // Depends on login function

   // Pass resetForm to the context function
   const handleSignupSubmit = useCallback((data: SignupValues, resetForm: UseFormReset<SignupValues>) => {
       signup(data).then(() => {
           resetForm(); // Reset form on successful signup
       }).catch((err) => { // Catch potential errors from signup
           console.error("Signup error:", err);
           toast({ title: "Error al Crear Cuenta", description: "No se pudo crear la cuenta. Inténtalo de nuevo.", variant: "destructive" });
       });
   }, [signup, toast]); // Depends on signup and toast

   const handleNextStep = useCallback(async (
    trigger: UseFormTrigger<SignupValues>,
    errors: FieldErrors<SignupValues>,
    toastFn: ReturnType<typeof useToast>['toast']
    ) => {
      // Fields relevant to step 1
      const step1Fields: (keyof z.infer<typeof signupStep1Schema>)[] = ['firstName', 'lastName', 'country', 'profileType', 'phone'];
      const result = await trigger(step1Fields, { shouldFocus: true }); // Trigger validation for step 1 fields

      if (result) {
         setSignupStep(2); // Move to next step if validation passes
      } else {
         // Focus the first field with an error if validation fails
         const firstErrorField = step1Fields.find(field => errors[field]);
         if (firstErrorField) {
            // Try to focus the element associated with the error
            const errorElement = document.getElementsByName(firstErrorField)[0];
            errorElement?.focus();
            // Show a general toast or rely on individual field messages
            toastFn({ title: "Error de Validación", description: "Por favor, corrige los errores en el formulario.", variant: "destructive" });
         } else {
             // Fallback toast if no specific field found (shouldn't happen often with shouldFocus)
              toastFn({ title: "Error de Validación", description: "Por favor, completa los campos requeridos.", variant: "destructive" });
         }

      }
    }, []); // No external dependencies needed for this logic

   const handlePrevStep = useCallback(() => {
       setSignupStep(1);
   }, []); // No dependencies


  const value: AuthContextType = {
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

  // Show loading indicator or children based on isLoading state
  // This prevents rendering children potentially before auth state is determined
  if (isLoading) {
     // Optional: Render a loading spinner or skeleton screen here
     return <div>Cargando...</div>; // Simple loading text
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
