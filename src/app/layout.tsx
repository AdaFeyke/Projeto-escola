import Loader from '~/components/ui/loader';
import { ConfirmProvider } from "~/components/ui/ConfirmProvider";
import { Toaster } from "sonner";
import { Suspense } from 'react';
import '../styles/globals.css'
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Escola',
  description: 'Gestão escolar profissional',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Escola",
  },
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        <ConfirmProvider>
          <Toaster position="bottom-right" richColors />
          {children}
        </ConfirmProvider>
      </body>
    </html>
  );
}