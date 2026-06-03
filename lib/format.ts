import { workshop } from "@/data/workshop";
import type { LeadInput } from "@/lib/types";

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCLP(value?: number | null): string {
  if (!value) return "Sin monto";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(value);
}

export function buildWhatsAppMessage(input: LeadInput, photoUrls: string[] = []): string {
  const lines = [
    "Hola, quiero cotizar reparación para mi vehículo.",
    "",
    `Nombre: ${input.customer_name}`,
    `WhatsApp: ${input.customer_whatsapp}`,
    `Marca/modelo: ${[input.vehicle_brand, input.vehicle_model].filter(Boolean).join(" ") || "No indicado"}`,
    `Año: ${input.vehicle_year || "No indicado"}`,
    `Patente: ${input.plate || "No indicada"}`,
    `Servicio requerido: ${input.service_type}`,
    `Daño / comentario: ${input.damage_description || "No indicado"}`,
    `Disponibilidad para evaluación: ${[input.preferred_date, input.preferred_time].filter(Boolean).join(" · ") || "A coordinar"}`
  ];

  if (photoUrls.length > 0) {
    lines.push("", "Fotos cargadas:", ...photoUrls.map((url) => `- ${url}`));
  } else {
    lines.push("", "Fotos: las adjunto en este WhatsApp.");
  }

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  const phone = onlyDigits(workshop.phone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function normalizeFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}
