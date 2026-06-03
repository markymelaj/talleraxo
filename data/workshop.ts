export const workshop = {
  name: "Taller Automotriz Demo",
  brandLine: "Cotizador digital para talleres mecánicos, pintura y desabolladura",
  city: "Concepción, Biobío",
  phone: process.env.NEXT_PUBLIC_WORKSHOP_WHATSAPP || "56900000000",
  hours: "Lunes a viernes · Sábado medio día",
  location: "Concepción, Biobío",
  heroTitle: "Recibe cotizaciones automotrices con fotos, datos del vehículo y WhatsApp ordenado.",
  heroText:
    "Una demo pensada para talleres de desabolladura, pintura, mecánica general y servicios afines. El cliente completa la información clave antes de pedir presupuesto y el taller recibe una consulta mucho más clara.",
  services: [
    {
      title: "Desabolladura",
      text: "Recepción de fotos del daño, ubicación de la pieza y comentario del cliente."
    },
    {
      title: "Pintura por pieza",
      text: "Cotización preliminar según panel afectado, color y estado del vehículo."
    },
    {
      title: "Pintura general",
      text: "Solicitud ordenada para evaluación de trabajos completos o restauraciones."
    },
    {
      title: "Mecánica general",
      text: "Ingreso de síntomas, historial breve y disponibilidad para revisión."
    },
    {
      title: "Choques menores",
      text: "Registro inicial para priorizar reparaciones rápidas y trabajos de alta urgencia."
    },
    {
      title: "Mantención preventiva",
      text: "Agenda de revisión, kilometraje y necesidad principal del cliente."
    }
  ],
  gallery: [
    {
      before: "Parachoque con roce",
      after: "Pintura y terminación",
      detail: "Trabajo por pieza · 24 a 48 horas estimadas"
    },
    {
      before: "Puerta con abolladura",
      after: "Desabolladura y pulido",
      detail: "Evaluación con fotos antes de agendar"
    },
    {
      before: "Rayón profundo",
      after: "Repintado localizado",
      detail: "Cotización inicial por WhatsApp"
    }
  ],
  statuses: [
    "nuevo",
    "falta_foto",
    "cotizacion_enviada",
    "agendado",
    "en_taller",
    "listo",
    "perdido"
  ] as const
};

export type LeadStatus = (typeof workshop.statuses)[number];

export const statusLabels: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  falta_foto: "Falta foto",
  cotizacion_enviada: "Cotización enviada",
  agendado: "Agendado",
  en_taller: "En taller",
  listo: "Listo",
  perdido: "Perdido"
};

export const serviceOptions = [
  "Desabolladura",
  "Pintura por pieza",
  "Pintura general",
  "Reparación de choque menor",
  "Mecánica general",
  "Mantención preventiva",
  "Otro servicio"
];
