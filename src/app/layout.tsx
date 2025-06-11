import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AppShell from "@/components/layout/AppShell";
// fetchUniqueBetMonths ya no se importa aquí

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "BetBalance",
  description:
    "Realiza un seguimiento de tus apuestas deportivas y finanzas fácilmente.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // availableMonths ya no se obtiene aquí

  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body antialiased min-h-screen flex flex-col dark">
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
