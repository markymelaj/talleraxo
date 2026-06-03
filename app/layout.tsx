import type { Metadata } from "next";
import "./globals.css";
import { workshop } from "@/data/workshop";

export const metadata: Metadata = {
  title: `${workshop.name} | Cotizador automotriz`,
  description:
    "Demo de cotizador digital para talleres mecánicos, pintura, desabolladura y servicios automotrices con WhatsApp ordenado."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
