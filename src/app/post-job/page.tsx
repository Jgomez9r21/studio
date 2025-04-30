
import React from 'react';
import AppLayout from '@/layout/AppLayout'; // Import the reusable layout

const PostJobContent = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold mb-4">Publicar un Trabajo</h1>
      {/* Add post job specific content here */}
      <p>Formulario para que los clientes publiquen ofertas de trabajo.</p>
    </div>
  );
};


const PostJob = () => {
  return (
     <AppLayout>
      <PostJobContent />
     </AppLayout>
  );
};

export default PostJob;
