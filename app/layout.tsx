import type { Metadata } from "next";
import "./globals.css";
import { workshop } from "@/data/workshop";

export const metadata: Metadata = {
  title: `${workshop.name} | Cotizador para talleres`,
  description:
    "Cotizador digital para talleres: recibe fotos, datos del vehículo y disponibilidad en un panel ordenado para responder por WhatsApp."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
