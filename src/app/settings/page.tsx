
import React from 'react';
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout


const SettingsContent = () => {
 return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold mb-4">Configuración</h1>
      {/* Add settings specific content here */}
      <p>Ajustes de cuenta, notificaciones y preferencias.</p>
    </div>
  );
};


const Settings = () => {
  return (
    <AppLayout>
       <SettingsContent />
    </AppLayout>
  );
};

export default Settings;
