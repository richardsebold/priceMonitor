import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/sidebar";


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "600", "700"],
})


export const metadata: Metadata = {
  title: "Price Tracker",
  description: "Rastreador de preços",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${inter.variable} min-h-screen bg-background antialiased`}
        suppressHydrationWarning
      >
        <Toaster position="top-center" richColors />
        <Sidebar />
        {children}
      </body>
    </html>
  );
}
