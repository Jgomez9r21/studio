
import React from 'react';
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout

const FindTalentsContent = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold mb-4">Buscar Talento</h1>
      {/* Add find talents specific content here */}
      <p>Interfaz para buscar y filtrar proveedores de servicios.</p>
    </div>
  );
};


const FindTalents = () => {
  return (
     <AppLayout>
       <FindTalentsContent />
     </AppLayout>
  );
};

export default FindTalents;
