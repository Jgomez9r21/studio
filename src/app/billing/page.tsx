
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  serviceTitle: string;
  amount: number;
  status: 'Pagada' | 'Pendiente' | 'Pago Rechazado';
}

const mockInvoicesData: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'FACT-00123',
    date: '2024-08-15',
    serviceTitle: 'Entrenamiento Fitness Personalizado - Julio',
    amount: 180000,
    status: 'Pagada',
  },
  {
    id: 'inv2',
    invoiceNumber: 'FACT-00124',
    date: '2025-05-17',
    serviceTitle: 'Clases Particulares de Matemáticas - Agosto',
    amount: 120000,
    status: 'Pendiente',
  },
  {
    id: 'inv3',
    invoiceNumber: 'FACT-00125',
    date: '2025-02-01',
    serviceTitle: 'Desarrollo Web Frontend - Proyecto X',
    amount: 1500000,
    status: 'Pagada',
  },
  {
    id: 'inv4',
    invoiceNumber: 'FACT-00126',
    date: '2024-09-05',
    serviceTitle: 'Consultoría SEO - Paquete Básico',
    amount: 350000,
    status: 'Pago Rechazado',
  },
  {
    id: 'inv5',
    invoiceNumber: 'FACT-00127',
    date: '2025-05-17',
    serviceTitle: 'Diseño de Logo y Branding',
    amount: 700000,
    status: 'Pendiente',
  },
];

const BillingContent = () => {
  const { user, isLoggedIn, isLoading, openLoginDialog } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isInvoiceDataLoading, setIsInvoiceDataLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoggedIn) {
      setIsInvoiceDataLoading(true);
      // Simulate fetching invoice data
      setTimeout(() => {
        setInvoices(mockInvoicesData);
        setIsInvoiceDataLoading(false);
      }, 1000);
    } else {
      setIsInvoiceDataLoading(false);
    }
  }, [isLoggedIn]);

  const handleDownloadPdf = (invoiceNumber: string) => {
    toast({
      title: "Descarga de PDF (Simulación)",
      description: `Aquí se iniciaría la generación y descarga del PDF para la factura N° ${invoiceNumber}. En una aplicación real, esto implicaría la creación del documento PDF.`,
    });
  };

  const getStatusBadgeVariant = (status: 'Pagada' | 'Pendiente' | 'Pago Rechazado'): 'default' | 'secondary' | 'outline' | 'destructive' => {
    if (status === 'Pagada') return 'default';
    if (status === 'Pendiente') return 'secondary';
    if (status === 'Pago Rechazado') return 'destructive';
    return 'outline';
  };


  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex justify-center items-center h-64">
        <p>Cargando facturación...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center border rounded-lg bg-card">
        <FileText className="h-16 w-16 text-muted-foreground/50 mb-6" />
        <h2 className="text-xl font-medium mb-2 text-foreground">Acceso Restringido a Facturación</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Debes iniciar sesión o crear una cuenta para ver tu historial de facturación.
        </p>
        <Button onClick={openLoginDialog}>Iniciar Sesión / Crear Cuenta</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold flex items-center">
          <FileText className="mr-3 h-7 w-7 text-primary" />
          Facturación
        </h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Aquí puedes ver y gestionar todas tus facturas y pagos.
        {user && <span className="block text-sm mt-1">Email de facturación: {user.email}</span>}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Facturas</CardTitle>
          <CardDescription>Listado de todas tus facturas generadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {isInvoiceDataLoading ? (
            <div className="flex justify-center items-center h-40"><p>Cargando facturas...</p></div>
          ) : invoices.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 border rounded-md bg-muted/30">
              <FileText className="mx-auto h-10 w-10 mb-3 text-muted-foreground/70" />
              <p className="font-medium">No tienes facturas disponibles todavía.</p>
              <p className="text-sm mt-1">Cuando se generen facturas, aparecerán aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Factura</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead className="text-right">Monto (COP)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                      <TableCell>{invoice.serviceTitle}</TableCell>
                      <TableCell className="text-right">{invoice.amount.toLocaleString('es-CO')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(invoice.status)} className="capitalize">
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadPdf(invoice.invoiceNumber)} title="Descargar PDF">
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
    </div>
  );
};

const BillingPage = () => {
  return (
    <AppLayout>
      <BillingContent />
    </AppLayout>
  );
};

export default BillingPage;

