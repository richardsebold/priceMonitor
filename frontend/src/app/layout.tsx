import type { Metadata } from "next";
import "./globals.css";

import { Fustat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";


const fustat = Fustat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fustat",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Price Tracker",
  description: "Rastreador de preços",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${fustat.variable} min-h-screen bg-background antialiased`}
        suppressHydrationWarning
      >
        <Toaster position="top-center" richColors />
    
        {children}
      </body>
    </html>
  );
}
