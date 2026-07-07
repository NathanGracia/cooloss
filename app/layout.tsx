import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "cooloss",
  description: "Compte unifié pour les apps de Nathan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
