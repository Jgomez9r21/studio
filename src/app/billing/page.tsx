"use client";

import type React from 'react';
import AppLayout from '@/layout/AppLayout'; // Importar el diseño reutilizable
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Button } from '@/components/ui/button'; // Import Button
import {  Briefcase } from 'lucide-react';

const BillingContent = () => {
  const { user, isLoggedIn, isLoading, openLoginDialog } = useAuth(); // Get user state from context

 if (isLoading) {
     return (
        <div className="p-4 md:p-6 lg:p-8 flex justify-center items-center h-64">
           <p>Cargando facturación...</p> {/* Or a spinner component */}
        </div>
     );
 }

 if (!isLoggedIn) {
     return (
      <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center border rounded-lg bg-card">
      <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-6" />
      <h2 className="text-xl font-medium mb-2 text-foreground">Acceso Restringido</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Debes iniciar sesión o crear una cuenta para ver tus reservas.
      </p>
      <Button onClick={openLoginDialog}>Iniciar Sesión / Crear Cuenta</Button>
    </div>
       );
 }


  return (
    <div className="p-4 md:p-6 lg:p-8"> {/* Adjusted padding */}
      <h1 className="text-2xl font-semibold mb-4">Facturación</h1>
      {/* Add billing specific content here */}
      <p>Detalles de facturación y historial de pagos.</p>
       {/* Example: Show user's email if logged in */}
       {user && <p className="mt-4 text-sm">Email de facturación: {user.email}</p>}
    </div>
  );
};


const Billing = () => {
  return (
    <AppLayout>
      <BillingContent />
    </AppLayout>
  );
};

export default Billing;
