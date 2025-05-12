
import type React from 'react';
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout

const BookServiceContent = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8"> {/* Adjusted padding */}
      <h1 className="text-2xl font-semibold mb-4">Mis Reservas</h1>
      {/* Add book service specific content here */}
      <p className="text-muted-foreground">Aquí puedes ver y gestionar todos tus servicios reservados, incluyendo los pendientes y los pagados.</p>
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
