
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { Body } from '@/layout/app';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'sportoffice', // Changed from SkillHub Connect
  description: 'Conéctate con proveedores de servicios locales y reserva servicios con facilidad.', // Translated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">{/* Changed language to Spanish */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
       <AuthProvider> {/* Wrap with AuthProvider */}
          <SidebarProvider> {/* Wrap with SidebarProvider */}
            <Body>
                {children}
            </Body>
          </SidebarProvider>
       </AuthProvider>
      </body>
    </html>
  );
}
