"use client";

import type React from 'react';
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Button } from '@/components/ui/button'; // Import Button


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
         <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center h-64 border rounded-lg bg-card text-center">
           <p className="mb-4 text-muted-foreground">Debes iniciar sesión para ver tu información de facturación.</p>
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
