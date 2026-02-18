import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Control Center – Peinture Rémy Ouellette",
  description: "Centre de gestion interne – Peinture Rémy Ouellette",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${inter.className}`}>
      <body className="min-h-screen bg-neutral-white">{children}</body>
    </html>
  );
}
