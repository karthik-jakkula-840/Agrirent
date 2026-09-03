import type { Metadata, Viewport } from "next";
import "./globals.css";

import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SplashScreen } from "@/components/layout/splash-screen";

import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://agrirent.in'),
  title: {
    default: 'AgriRent | Smart Agricultural Equipment Rental',
    template: '%s | AgriRent',
  },
  description: 'Discover and rent high-quality agricultural equipment from verified owners near you. Affordable, reliable, and built for your farm\'s success.',
  keywords: [
    'agricultural equipment rental', 
    'tractor rental India', 
    'farm machinery', 
    'AgriRent', 
    'farming equipment rental', 
    'harvester rental', 
    'smart farming',
    'peer-to-peer equipment sharing'
  ],
  authors: [{ name: 'AgriRent Team' }],
  creator: 'AgriRent',
  publisher: 'AgriRent',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://agrirent.in',
    siteName: 'AgriRent',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'AgriRent - Smart Agricultural Equipment Rental' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgriRent | Smart Agricultural Equipment Rental',
    description: 'Discover and rent high-quality agricultural equipment from verified owners near you.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AgriRent',
    url: 'https://agrirent.in',
    logo: 'https://agrirent.in/logo.png',
    description: 'Smart Agricultural Equipment Rental Marketplace in India',
    sameAs: [
      'https://twitter.com/agrirent',
      'https://facebook.com/agrirent',
      'https://instagram.com/agrirent'
    ]
  };

  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (sessionStorage.getItem('agrirent_splash_shown')) {
                  document.documentElement.style.setProperty('--splash-display', 'none');
                } else {
                  document.documentElement.style.setProperty('--splash-display', 'flex');
                }
              } catch (e) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <SplashScreen />
        <QueryProvider>{children}</QueryProvider>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
