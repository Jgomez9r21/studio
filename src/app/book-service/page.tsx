
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Download, Briefcase, AlertTriangle } from 'lucide-react';
import Link from 'next/link'; // Import Link

interface Booking {
  id: string;
  serviceTitle: string;
  location: string;
  serviceDate: string;
  serviceTime: string;
  orderNumber: string;
}

interface UserBooking extends Booking {
  professionalName: string;
  professionalEmail: string;
  professionalPhone: string;
}

interface ProfessionalBooking extends Booking {
  clientName: string; // Changed from clientEmail to clientName for clarity
  clientEmail: string;
  clientPhone: string;
}

const mockUserBookingsData: UserBooking[] = [
  {
    id: 'ub1',
    serviceTitle: 'Entrenamiento Fitness Personalizado',
    professionalName: 'Ana García',
    location: 'Gimnasio Local Central',
    professionalEmail: 'ana.garcia@example.com',
    professionalPhone: '+573001112233',
    serviceDate: '2024-09-15',
    serviceTime: '09:00',
    orderNumber: 'ORD-U001',
  },
  {
    id: 'ub2',
    serviceTitle: 'Clases Particulares de Matemáticas',
    professionalName: 'Elena Martínez',
    location: 'Remoto',
    professionalEmail: 'elena.martinez@example.com',
    professionalPhone: '+573109998877',
    serviceDate: '2024-09-20',
    serviceTime: '16:00',
    orderNumber: 'ORD-U002',
  },
];

const mockProfessionalBookingsData: ProfessionalBooking[] = [
  {
    id: 'pb1',
    serviceTitle: 'Desarrollo Web Frontend',
    location: 'Remoto',
    clientName: 'Pedro Cliente',
    clientEmail: 'pedro.cliente@example.com',
    clientPhone: '+573207776655',
    serviceDate: '2024-09-18',
    serviceTime: '14:00',
    orderNumber: 'ORD-P001',
  },
  {
    id: 'pb2',
    serviceTitle: 'Diseño Gráfico y Branding',
    location: 'Remoto',
    clientName: 'Lucía Empresa',
    clientEmail: 'lucia.empresa@example.com',
    clientPhone: '+573151234567',
    serviceDate: '2024-09-22',
    serviceTime: '10:00',
    orderNumber: 'ORD-P002',
  },
];


const BookServiceContent = () => {
  const { user, isLoggedIn, isLoading, openLoginDialog } = useAuth();
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [professionalBookings, setProfessionalBookings] = useState<ProfessionalBooking[]>([]);
  const [isBookingDataLoading, setIsBookingDataLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    if (isLoggedIn) {
      setIsBookingDataLoading(true);
      setTimeout(() => {
        setUserBookings(mockUserBookingsData);
        setProfessionalBookings(mockProfessionalBookingsData);
        setIsBookingDataLoading(false);
      }, 1000);
    } else {
      setIsBookingDataLoading(false);
    }
  }, [isLoggedIn]);

  const handleViewServiceInfo = (orderNumber: string, type: 'user' | 'professional') => {
    console.log(`Ver info para orden ${orderNumber} (${type})`);
    // In a real app, navigate to a detailed view or open a modal
    // router.push(`/booking-details/${orderNumber}`);
  };

  const handleDownloadPdf = (orderNumber: string) => {
    console.log(`Descargar PDF para orden ${orderNumber}`);
    // Placeholder for PDF generation logic
    alert(`Simulación: Descargando PDF para orden N° ${orderNumber}`);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex justify-center items-center h-64">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center border rounded-lg bg-card">
        <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-6" />
        <h2 className="text-xl font-medium mb-2 text-foreground">Acceso Restringido</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Debes iniciar sesión o crear una cuenta para ver tus reservas.
        </p>
        <Button onClick={openLoginDialog}>Iniciar Sesión / Crear Cuenta</Button>
      </div>
    );
  }
  
  const noUserBookings = !isBookingDataLoading && userBookings.length === 0;
  const noProfessionalBookings = !isBookingDataLoading && professionalBookings.length === 0;


  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold flex items-center">
          <Briefcase className="mr-3 h-7 w-7 text-primary" />
          Mis Reservas
        </h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Aquí puedes ver y gestionar todos tus servicios reservados (como usuario) y los servicios que ofreces (como profesional).
      </p>

      <Tabs defaultValue="user-bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-6">
          <TabsTrigger value="user-bookings">Mis Servicios Solicitados</TabsTrigger>
          <TabsTrigger value="professional-bookings">Servicios que Ofrezco</TabsTrigger>
        </TabsList>

        <TabsContent value="user-bookings">
          <Card>
            <CardHeader>
              <CardTitle>Servicios Solicitados (Usuario)</CardTitle>
              <CardDescription>Listado de servicios que has reservado.</CardDescription>
            </CardHeader>
            <CardContent>
              {isBookingDataLoading ? (
                <div className="flex justify-center items-center h-40"><p>Cargando tus reservas...</p></div>
              ) : noUserBookings ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground border rounded-md bg-muted/30">
                  <AlertTriangle className="h-10 w-10 mb-3 text-muted-foreground/70" />
                  <p className="font-medium">No has solicitado ningún servicio todavía.</p>
                  <p className="text-sm mt-1">¡Explora y reserva servicios!</p>
                  <Button asChild className="mt-4" size="sm">
                    <Link href="/">Explorar Servicios</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título Servicio</TableHead>
                        <TableHead>Profesional</TableHead>
                        <TableHead>Lugar</TableHead>
                        <TableHead>Email Profesional</TableHead>
                        <TableHead>Celular Profesional</TableHead>
                        <TableHead>Fecha Servicio</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>N° Orden</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.serviceTitle}</TableCell>
                          <TableCell>{booking.professionalName}</TableCell>
                          <TableCell>{booking.location}</TableCell>
                          <TableCell>{booking.professionalEmail}</TableCell>
                          <TableCell>{booking.professionalPhone}</TableCell>
                          <TableCell>{new Date(booking.serviceDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                          <TableCell>{booking.serviceTime}</TableCell>
                          <TableCell>{booking.orderNumber}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleViewServiceInfo(booking.orderNumber, 'user')} title="Ver Información">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional-bookings">
          <Card>
            <CardHeader>
              <CardTitle>Servicios Ofrecidos (Profesional)</CardTitle>
              <CardDescription>Listado de servicios que otros usuarios te han reservado.</CardDescription>
            </CardHeader>
            <CardContent>
              {isBookingDataLoading ? (
                <div className="flex justify-center items-center h-40"><p>Cargando tus servicios ofrecidos...</p></div>
              ) : noProfessionalBookings ? (
                 <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground border rounded-md bg-muted/30">
                  <AlertTriangle className="h-10 w-10 mb-3 text-muted-foreground/70" />
                  <p className="font-medium">Aún no tienes reservas para los servicios que ofreces.</p>
                  <p className="text-sm mt-1">Asegúrate de tener tus servicios publicados.</p>
                   <Button asChild className="mt-4" size="sm">
                    <Link href="/post-job">Publicar un Servicio</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título Servicio</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Lugar</TableHead>
                        <TableHead>Email Cliente</TableHead>
                        <TableHead>Celular Cliente</TableHead>
                        <TableHead>Fecha Servicio</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>N° Orden</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {professionalBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.serviceTitle}</TableCell>
                          <TableCell>{booking.clientName}</TableCell>
                          <TableCell>{booking.location}</TableCell>
                          <TableCell>{booking.clientEmail}</TableCell>
                          <TableCell>{booking.clientPhone}</TableCell>
                          <TableCell>{new Date(booking.serviceDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                          <TableCell>{booking.serviceTime}</TableCell>
                          <TableCell>{booking.orderNumber}</TableCell>
                          <TableCell className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleViewServiceInfo(booking.orderNumber, 'professional')} title="Ver Información">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDownloadPdf(booking.orderNumber)} title="Descargar PDF">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BookServicePage = () => {
  return (
    <AppLayout>
       <BookServiceContent />
    </AppLayout>
  );
};

export default BookServicePage;

