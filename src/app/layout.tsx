import type { Metadata } from "next";
import "./globals.css";

import { Fustat, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";


const fustat = Fustat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fustat",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
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
    <html lang="pt-BR" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}
        className={cn(
          "min-h-screen antialiased font-sans",
          fustat.variable,
          jetbrains.variable
        )}
      >
        <Toaster position="top-center" richColors />
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
            forcedTheme="dark"
          >
            {children}
          </ThemeProvider>
      </body>
    </html>
  );
}
