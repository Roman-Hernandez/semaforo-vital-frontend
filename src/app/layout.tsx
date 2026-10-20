
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Semáforo Vital",
  description:
    "Plataforma de prevención y seguimiento sanitario en albergues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
