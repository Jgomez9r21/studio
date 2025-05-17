
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { z } from "zod";
import type { FieldErrors, UseFormReset, UseFormTrigger, UseFormGetValues, UseFormSetError, FieldPath } from 'react-hook-form';
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  type User as FirebaseUser 
} from 'firebase/auth';
import { auth as firebaseAuth, db, app as firebaseApp } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";


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
  profileType?: string; 
  gender?: string;      
  documentType?: string;
  documentNumber?: string;
  createdAt?: any; 
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
  profileType: "usuario", 
};

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
  password: z.string().min(1, "La contraseña es requerida."),
});
type LoginValues = z.infer<typeof loginSchema>;

const phoneValidation = z.string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Número inválido. Debe estar en formato E.164 (ej: +573001234567).')
  .optional()
  .or(z.literal(""));

const signupStep1Schema = z.object({
  firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres."),
  lastName: z.string().min(2, "Apellido debe tener al menos 2 caracteres."),
  country: z.string().min(1, "Debes seleccionar un país.").default("CO"),
  phone: phoneValidation,
  profileType: z.string().min(1, "Debes seleccionar un tipo de perfil."),
});

const baseSignupStep2Schema = z.object({
  dob: z.date({ required_error: "La fecha de nacimiento es requerida." }).optional().nullable(),
  gender: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo es requerido."),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Confirmar contraseña debe tener al menos 6 caracteres."),
});

const signupSchema = signupStep1Schema.merge(baseSignupStep2Schema)
  .refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
});

type SignupValues = z.infer<typeof signupSchema>;

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
  currentView: 'login' | 'signup' | 'forgotPassword';
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
  setCurrentView: (view: 'login' | 'signup' | 'forgotPassword') => void;
  setSignupStep: (step: number) => void;
  handleLoginSubmit: (data: LoginValues, resetForm: UseFormReset<LoginValues>) => void;
  handleSignupSubmit: (data: SignupValues, resetForm: UseFormReset<SignupValues>) => void;
  handleNextStep: (
    getValues: UseFormGetValues<SignupValues>,
    setError: UseFormSetError<SignupValues>,
    errors: FieldErrors<SignupValues>, 
    toast: ReturnType<typeof useToast>['toast']
  ) => Promise<void>;
  handlePrevStep: () => void;
  handleLogout: () => void;
  sendVerificationCode: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  setIsVerificationSent: (sent: boolean) => void;
  resetPhoneVerification: () => void;
  handleForgotPasswordSubmit: (data: ForgotPasswordValues, resetForm: UseFormReset<ForgotPasswordValues>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'forgotPassword'>('login');
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
      setUser(dummyUser); 
      setIsLoggedIn(true); 
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
    setLoginError(null);

    try {
      if (!firebaseAuth) {
        throw new Error("Firebase Auth service is not available.");
      }
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, details.email, details.password);
      const firebaseUser = userCredential.user;

      await updateFirebaseProfile(firebaseUser, {
        displayName: `${details.firstName} ${details.lastName}`,
      });

      const newUserForFirestore: Omit<User, 'id' | 'initials' | 'name' | 'avatarUrl'> & { uid: string, createdAt: any } = {
        uid: firebaseUser.uid,
        firstName: details.firstName,
        lastName: details.lastName,
        email: details.email,
        phone: details.phone || "",
        country: details.country || "",
        dob: details.dob ? details.dob.toISOString() : null,
        isPhoneVerified: false, 
        profileType: details.profileType || "",
        gender: details.gender || "",
        documentType: details.documentType || "",
        documentNumber: details.documentNumber || "",
        createdAt: serverTimestamp(),
      };
      
      if (!db) {
        toast({ title: "Error de Base de Datos", description: "La conexión con la base de datos no está disponible. No se pudieron guardar los datos del perfil.", variant: "destructive" });
        console.warn("Firestore (db) not available, user profile data not saved to Firestore.");
      } else {
        await setDoc(doc(db, "users", firebaseUser.uid), newUserForFirestore);
      }

      const appUser: User = {
        id: firebaseUser.uid,
        name: `${details.firstName} ${details.lastName}`,
        firstName: details.firstName,
        lastName: details.lastName,
        initials: `${details.firstName[0]}${details.lastName[0]}`,
        avatarUrl: firebaseUser.photoURL || `https://placehold.co/50x50.png`, 
        email: firebaseUser.email || details.email, 
        phone: newUserForFirestore.phone,
        country: newUserForFirestore.country,
        dob: newUserForFirestore.dob,
        isPhoneVerified: newUserForFirestore.isPhoneVerified,
        profileType: newUserForFirestore.profileType,
        gender: newUserForFirestore.gender,
        documentType: newUserForFirestore.documentType,
        documentNumber: newUserForFirestore.documentNumber,
        createdAt: newUserForFirestore.createdAt,
      };
      setUser(appUser);
      setIsLoggedIn(true);
      setShowLoginDialog(false);
      setCurrentView('login');
      setSignupStep(1);
      toast({ title: "Cuenta Creada", description: `¡Bienvenido/a, ${details.firstName}! Tu cuenta ha sido creada.` });

    } catch (error: any) {
      console.error("Error during signup:", error);
      let errorMessage = "No se pudo crear la cuenta. Inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este correo electrónico ya está registrado.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña es demasiado débil.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El correo electrónico no es válido.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Error de red. Verifica tu conexión e inténtalo de nuevo.";
         toast({ title: "Error de Red", description: "No se pudo conectar con los servicios de autenticación. Verifica tu conexión a internet.", variant: "destructive" });
      }
      setLoginError(errorMessage);
      if(error.code !== 'auth/network-request-failed') { // Avoid double toast for network error
        toast({ title: "Error al Crear Cuenta", description: errorMessage, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
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

      let newAvatarUrl = user.avatarUrl;
      let objectUrlToRevoke: string | null = null;

      if (data.avatarFile) {
          console.log("Simulating avatar upload for:", data.avatarFile.name);
          try {
              newAvatarUrl = URL.createObjectURL(data.avatarFile);
              objectUrlToRevoke = newAvatarUrl;
              console.log("Simulation: Using generated object URL for avatar preview:", newAvatarUrl);
          } catch (error) {
                console.error("Error creating object URL for preview:", error);
                 toast({
                    title: "Error de Imagen",
                    description: "No se pudo generar la vista previa de la imagen.",
                    variant: "destructive",
                 });
                 newAvatarUrl = user.avatarUrl;
          }
      }

      const updatedFirstName = data.firstName !== undefined ? data.firstName : user.firstName;
      const updatedLastName = data.lastName !== undefined ? data.lastName : user.lastName;
      const updatedName = `${updatedFirstName} ${updatedLastName}`;
      const updatedInitials = `${updatedFirstName?.[0] ?? ''}${updatedLastName?.[0] ?? ''}`.toUpperCase();
      
      const newPhone = data.phone !== undefined ? (data.phone === "" ? "" : data.phone) : user.phone;
      const isPhoneUpdated = newPhone !== user.phone;
      let newPhoneVerifiedStatus = user.isPhoneVerified ?? false;

      if (isPhoneUpdated) {
        newPhoneVerifiedStatus = false; // Always set to false if phone number changes
        if (newPhone === "") { // If phone is cleared, it's not verified
           newPhoneVerifiedStatus = false;
        }
      }


      const updatedUser: User = {
          ...user,
          name: updatedName,
          firstName: updatedFirstName,
          lastName: updatedLastName,
          initials: updatedInitials,
          phone: newPhone || '', // Ensure phone is string or empty string
          country: data.country !== undefined ? data.country : user.country,
          dob: data.dob !== undefined ? (data.dob instanceof Date ? data.dob.toISOString() : data.dob) : user.dob,
          avatarUrl: newAvatarUrl,
          isPhoneVerified: newPhoneVerifiedStatus,
      };

      if (db && user.id !== 'usr123') { 
        try {
            const userDocRef = doc(db, "users", user.id);
            const firestoreUpdateData: Partial<Omit<User, 'id' | 'email' | 'createdAt'>> = { // Omit fields not typically updated here
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                name: updatedUser.name,
                initials: updatedUser.initials,
                phone: updatedUser.phone,
                country: updatedUser.country,
                dob: updatedUser.dob,
                avatarUrl: updatedUser.avatarUrl, 
                isPhoneVerified: updatedUser.isPhoneVerified,
            };
            await updateDoc(userDocRef, firestoreUpdateData);
            console.log("Firestore update for user:", user.id, firestoreUpdateData);
        } catch (error) {
            console.error("Error updating user in Firestore:", error);
            toast({ title: "Error de Base de Datos", description: "No se pudieron guardar los cambios en el servidor.", variant: "destructive" });
             // Optionally, revert optimistic UI update or handle error more gracefully
        }
      } else if (user.id !== 'usr123') {
        console.warn("Firestore (db) not available, profile update not saved to backend for user:", user.id);
        toast({ title: "Advertencia", description: "La base de datos no está disponible. Los cambios de perfil no se guardaron en el servidor.", variant: "default" });
      }


      setUser(updatedUser); 

      if (objectUrlToRevoke && objectUrlToRevoke !== user.avatarUrl && user.avatarUrl.startsWith('blob:')) {
         console.log("Consider revoking previous blob URL if no longer needed:", user.avatarUrl);
      }
      
      // If phone was updated and now requires verification
      const needsVerificationAfterUpdate = isPhoneUpdated && !!newPhone && !newPhoneVerifiedStatus;

      if (!needsVerificationAfterUpdate) {
        toast({
            title: "Perfil Actualizado",
            description: "Tus datos han sido guardados correctamente.",
        });
      } else {
         toast({
              title: "Verificación de Teléfono Requerida",
              description: "Tu número de teléfono ha cambiado. Por favor, verifica tu nuevo número desde la página de configuración.",
              variant: "default",
         });
         resetPhoneVerification();
      }
      setIsLoading(false);
  }, [user, toast, resetPhoneVerification]);

   const sendVerificationCode = useCallback(async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
       setPhoneVerificationError(null);
       setIsLoading(true);
       if (!firebaseAuth) {
           setPhoneVerificationError("Error de Firebase: Servicio de autenticación no disponible.");
           toast({ title: "Error de Firebase", description: "El servicio de autenticación no está disponible.", variant: "destructive" });
           setIsLoading(false);
           return;
       }
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
           } else if (error.code === 'auth/captcha-check-failed' || error.code === 'auth/missing-recaptcha-token') {
               errorMessage = "Falló la verificación reCAPTCHA. Por favor, recarga la página e inténtalo de nuevo.";
           } else if (error.code === 'auth/network-request-failed') {
               errorMessage = "Error de red. Verifica tu conexión e inténtalo de nuevo.";
               toast({ title: "Error de Red", description: "No se pudo conectar con los servicios de autenticación. Verifica tu conexión a internet.", variant: "destructive" });
           }
           setPhoneVerificationError(errorMessage);
           if(error.code !== 'auth/network-request-failed') {
             toast({ title: "Error al Enviar Código", description: errorMessage, variant: "destructive" });
           }
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
           const verifiedFirebaseUser = credential.user as FirebaseUser; 
           if (user) {
               const updatedUser = {
                 ...user,
                 isPhoneVerified: true,
                 phone: verifiedFirebaseUser.phoneNumber && verifiedFirebaseUser.phoneNumber !== user.phone ? verifiedFirebaseUser.phoneNumber : user.phone
               };
               setUser(updatedUser); // Optimistically update user state
                if (db && user.id !== 'usr123') { 
                   try {
                      await updateDoc(doc(db, "users", user.id), { phone: updatedUser.phone, isPhoneVerified: true });
                      console.log("Phone verification status updated in Firestore for user:", user.id);
                   } catch (dbError) {
                       console.error("Error updating phone verification status in Firestore:", dbError);
                       toast({ title: "Error de Base de Datos", description: "No se pudo actualizar el estado de verificación del teléfono.", variant: "destructive"});
                       // Optionally revert optimistic UI update for isPhoneVerified if backend update fails
                       setUser(user); // Revert to previous user state
                   }
               } else if (user.id !== 'usr123') {
                   console.warn("Firestore (db) not available, phone verification status not saved to backend for user:", user.id);
                   toast({ title: "Advertencia", description: "La base de datos no está disponible. El estado de verificación del teléfono no se guardó en el servidor.", variant: "default" });
               }
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
           } else if (error.code === 'auth/network-request-failed') {
               errorMessage = "Error de red. Verifica tu conexión e inténtalo de nuevo.";
               toast({ title: "Error de Red", description: "No se pudo conectar con los servicios de autenticación. Verifica tu conexión a internet.", variant: "destructive" });
           }
           setPhoneVerificationError(errorMessage);
           if(error.code !== 'auth/network-request-failed') {
             toast({ title: "Error de Verificación", description: errorMessage, variant: "destructive" });
           }
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
       }).catch((err) => {
           console.error("Signup error propagated to submit handler:", err);
       });
   }, [signup]);

    const handleForgotPasswordSubmit = useCallback(async (data: ForgotPasswordValues, resetForm: UseFormReset<ForgotPasswordValues>) => {
    setIsLoading(true);
    if (!firebaseAuth) {
        toast({ title: "Error de Firebase", description: "El servicio de autenticación no está disponible.", variant: "destructive" });
        setIsLoading(false);
        return;
    }
    try {
      await sendPasswordResetEmail(firebaseAuth, data.email);
      toast({
        title: "Correo Enviado",
        description: "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.",
      });
      setCurrentView('login');
      resetForm();
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      let errorMessage = "No se pudo enviar el correo de recuperación. Inténtalo de nuevo.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No existe una cuenta con este correo electrónico.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El formato del correo electrónico no es válido.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Error de red. Verifica tu conexión e inténtalo de nuevo.";
         toast({ title: "Error de Red", description: "No se pudo conectar con los servicios de autenticación. Verifica tu conexión a internet.", variant: "destructive" });
      }
      if(error.code !== 'auth/network-request-failed') {
        toast({ title: "Error al Enviar Correo", description: errorMessage, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleNextStep = useCallback(async (
    getValues: UseFormGetValues<SignupValues>,
    setError: UseFormSetError<SignupValues>,
    errors: FieldErrors<SignupValues>, 
    toastFn: ReturnType<typeof useToast>['toast']
  ) => {
    const currentStep1Values = {
      firstName: getValues("firstName"),
      lastName: getValues("lastName"),
      country: getValues("country"),
      phone: getValues("phone") || undefined, 
      profileType: getValues("profileType"),
    };

    const validationResult = signupStep1Schema.safeParse(currentStep1Values);

    if (validationResult.success) {
      setSignupStep(2);
    } else {
      validationResult.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          const fieldName = err.path[0] as FieldPath<SignupValues>; 
          setError(fieldName, {
            type: "manual",
            message: err.message,
          });
        }
      });

      const firstErrorField = validationResult.error.errors[0]?.path[0];
      if (firstErrorField) {
        const errorElement = document.getElementsByName(firstErrorField as string)[0];
        errorElement?.focus();
        toastFn({ title: "Error de Validación", description: "Por favor, corrige los errores en el formulario.", variant: "destructive" });
      } else {
        toastFn({ title: "Error de Validación", description: "Por favor, completa los campos requeridos.", variant: "destructive" });
      }
    }
  }, [toast]); 

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
    handleForgotPasswordSubmit,
  };

  if (isLoading && typeof window !== 'undefined' && !user) { 
     return (
        <div className="flex justify-center items-center h-screen">
           <p>Cargando autenticación...</p> 
        </div>
     );
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
