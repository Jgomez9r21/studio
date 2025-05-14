/** @format */
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layout/AppLayout';
import { Heart, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import type { ServiceListing } from '@/services/service-listings'; // Assuming this type exists
import { HOURLY_RATE_CATEGORIES } from '@/lib/config';

// Define a Talent type (simplified from find-talents/page.tsx for this example)
interface Talent {
  id: string;
  name: string;
  title: string;
  location: string;
  rate: number;
  rating: number;
  reviews: number;
  category: string;
  image: string;
  description: string;
  dataAiHint: string;
}

// Combined type for favorited items
type FavoriteItem = (ServiceListing & { itemType: 'service' }) | (Talent & { itemType: 'talent' });

// Mock data for demonstration
const mockFavoritedItemsData: FavoriteItem[] = [
  {
    itemType: 'talent',
    id: 't1',
    name: 'Carlos Rodriguez',
    title: 'Desarrollador Web Full-Stack',
    location: 'Remoto',
    rate: 70,
    rating: 4.9,
    reviews: 45,
    category: 'Tecnología',
    skills: ['React', 'Node.js'],
    description: 'Desarrollador con experiencia en aplicaciones web modernas.',
    image: 'https://placehold.co/400x300.png',
    dataAiHint: "web developer man code"
  },
];


const FavoritesContent = () => {
  const [favoritedItems, setFavoritedItems] = useState<FavoriteItem[]>(mockFavoritedItemsData);
  const [toggledFavorites, setToggledFavorites] = useState<Set<string>>(() => {
    // Initialize with all mock items being favorited
    const initialFavorites = new Set<string>();
    mockFavoritedItemsData.forEach(item => initialFavorites.add(item.id));
    return initialFavorites;
  });

  const toggleFavorite = (itemId: string) => {
    setToggledFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
        // Also remove from the displayed list for this mock setup
        setFavoritedItems(currentItems => currentItems.filter(item => item.id !== itemId));
      } else {
        // In a real app, if re-favoriting from this page was possible, you'd add it back
        // For this mock, we assume only un-favoriting from this page.
        // If you want to re-add, you'd need access to the original item data.
      }
      return newFavorites;
    });
  };

  const isEmpty = favoritedItems.length === 0;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold flex items-center">
          <Heart className="mr-3 h-7 w-7 text-primary" />
          Mis Favoritos
        </h1>
      </div>

      {isEmpty ? (
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
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoritedItems.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-card">
              <Link href={item.itemType === 'service' ? `/service/${item.id}` : `/talent/${item.id}`} passHref>
                <div className="relative aspect-[4/3] w-full overflow-hidden cursor-pointer">
                  <Image
                    src={(item.itemType === 'service' ? item.imageUrl : item.image) || `https://placehold.co/400x300.png`}
                    alt={item.itemType === 'service' ? item.title : item.name}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={item.itemType === 'service' ? `${item.category} service` : (item as Talent).dataAiHint}
                  />
                </div>
              </Link>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-grow">
                    <CardTitle className="text-lg font-semibold">
                      <Link href={item.itemType === 'service' ? `/service/${item.id}` : `/talent/${item.id}`} className="hover:underline">
                        {item.itemType === 'service' ? item.title : item.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-1">
                      {item.itemType === 'service' ? item.category : (item as Talent).title}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive flex-shrink-0 -mt-1 -mr-1"
                    onClick={() => toggleFavorite(item.id)}
                    aria-label={toggledFavorites.has(item.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
                  >
                    <Heart className={cn("h-5 w-5", toggledFavorites.has(item.id) && "fill-destructive text-destructive")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0 space-y-1.5">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                  <span>{item.location}</span>
                </div>
                {item.rating !== undefined && (
                   <div className="flex items-center gap-1 text-sm">
                     <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                     <span className="font-semibold text-foreground">{item.rating.toFixed(1)}</span>
                     {/* {item.itemType === 'talent' && <span className="text-xs text-muted-foreground">({(item as Talent).reviews} reseñas)</span>} Removed review count */}
                   </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-2 border-t mt-auto bg-muted/30">
                <div className="flex justify-between items-center w-full">
                  <p className="text-sm">
                    Tarifa: <span className="font-bold text-lg text-primary">${item.rate}</span>
                    { HOURLY_RATE_CATEGORIES.includes(item.category) ? <span className="text-xs text-muted-foreground">/hr</span> : ''}
                  </p>
                  <Button size="sm" className="h-8 text-xs sm:text-sm" asChild>
                    <Link href={item.itemType === 'service' ? `/service/${item.id}` : `/talent/${item.id}`}>
                      {item.itemType === 'service' ? 'Ver Servicio' : 'Ver Perfil'}
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
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
