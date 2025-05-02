
import type React from 'react';
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout

const BillingContent = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8"> {/* Adjusted padding */}
      <h1 className="text-2xl font-semibold mb-4">Facturación</h1>
      {/* Add billing specific content here */}
      <p>Detalles de facturación y historial de pagos.</p>
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
