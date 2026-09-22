import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/auth.context';
import { BackgroundBlobs } from '@/components/ui/backgroundBlobs';

export const metadata: Metadata = {
  title:       'ERP GYM — BEN TECH',
  description: 'Sistema de gestão para academias',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <BackgroundBlobs />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
