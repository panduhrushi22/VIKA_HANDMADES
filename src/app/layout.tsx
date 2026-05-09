import type { Metadata } from "next";
import { Playfair_Display, Inter, Sacramento } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sacramento = Sacramento({
  weight: '400',
  variable: "--font-script",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIKA | Personalised Hampers & Elegant Bouquets",
  description: "Premium VV.Trends, elegant bouquets and personalised hampers for every occasion.",
};

import { StoreProvider } from "@/components/StoreProvider";
import { ToastProvider } from "@/components/ToastProvider";
import MainLayout from "@/components/MainLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} ${sacramento.variable}`}>
        <StoreProvider>
          <ToastProvider>
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading VIKA...</div>}>
              <MainLayout>
                {children}
              </MainLayout>
            </Suspense>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
