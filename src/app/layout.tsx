import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import { PageTransitionProvider } from '@/components/PageTransitionContext';
import PageTransitionLoader from '@/components/PageTransitionLoader';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'HHS Welfare — Ministry Group Membership Registration Portal',
  description:
    'Register for ministry group membership, manage next of kin, family details, and confirm M-Pesa payments — all in one guided portal.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PageTransitionProvider>
          {children}
          <PageTransitionLoader />
        </PageTransitionProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
