"use client";

import type React from 'react';
import AppLayout from '@/layout/AppLayout';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FavoritesContent = () => {
  // In a real app, you'd fetch and display favorited items here
  // For now, it's a placeholder.
  const noFavorites = true; // Simulate no favorites for now

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold flex items-center">
          <Heart className="mr-3 h-7 w-7 text-primary" />
          Mis Favoritos
        </h1>
        {/* Optional: Add a button to clear all favorites or other actions */}
      </div>

      {noFavorites ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-15rem)] text-center border rounded-lg bg-card p-8">
          <Heart className="h-16 w-16 text-muted-foreground/50 mb-6" />
          <h2 className="text-xl font-medium mb-2 text-foreground">No tienes favoritos todavía</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Marca tus servicios y talentos preferidos con el ícono de corazón para verlos aquí.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/">Explorar Servicios</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/find-talents">Buscar Talentos</Link>
            </Button>
          </div>
        </div>
      ) : (
        // Placeholder for when there are favorites
        // You would map over a list of favorite items here
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Example of how a favorite card might look (adapt from page.tsx or find-talents/page.tsx) */}
          <p className="text-muted-foreground">Aquí se mostrarán tus servicios y talentos favoritos.</p>
        </div>
      )}
    </div>
  );
};

const FavoritesPage = () => {
  return (
    <AppLayout>
      <FavoritesContent />
    </AppLayout>
  );
};

export default FavoritesPage;
