
import type React from 'react';
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout

const BookServiceContent = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8"> {/* Adjusted padding */}
      <h1 className="text-2xl font-semibold mb-4">Servicios Pendientes</h1>
      {/* Add book service specific content here */}
      <p>Aquí puedes ver y gestionar tus servicios reservados pendientes.</p>
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
