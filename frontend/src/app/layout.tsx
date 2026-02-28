import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/dist/server/request/headers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "600", "700"],
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

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${inter.variable} min-h-screen bg-background antialiased`}
        suppressHydrationWarning
      >
        <Toaster position="top-center" richColors />
        {/* only show sidebar when user is authenticated */}
        {session ? <Sidebar /> : null}
        {children}
      </body>
    </html>
  );
}
