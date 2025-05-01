

import React from 'react';
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout

const BookServiceContent = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8"> {/* Adjusted padding */}
      <h1 className="text-2xl font-semibold mb-4">Reservar un Servicio</h1>
      {/* Add book service specific content here */}
      <p>Formulario para reservar un servicio específico.</p>
    </div>
  );
};

const BookService = () => {
  return (
    <AppLayout>
       <BookServiceContent />
    </AppLayout>
  );
};

export default BookService;

