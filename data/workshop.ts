export const workshop = {
  name: "TallerPro Demo",
  brandLine: "Cotizador digital para talleres mecánicos, pintura y desabolladura",
  city: "Concepción, Biobío",
  phone: process.env.NEXT_PUBLIC_WORKSHOP_WHATSAPP || "56900000000",
  hours: "Lunes a viernes · Sábado medio día",
  location: "Concepción, Biobío",
  heroTitle: "Cotizaciones automotrices claras antes del primer WhatsApp.",
  heroText:
    "El cliente manda fotos, datos del vehículo, tipo de reparación y disponibilidad. El taller recibe una consulta ordenada, lista para responder, cotizar o agendar.",
  services: [
    {
      title: "Desabolladura",
      text: "Fotos del daño, pieza afectada y prioridad para estimar rápido sin tanto ida y vuelta."
    },
    {
      title: "Pintura por pieza",
      text: "Solicitud ordenada por panel, color, estado del vehículo y fecha ideal de evaluación."
    },
    {
      title: "Pintura general",
      text: "Ingreso simple para trabajos completos, restauraciones y evaluaciones de mayor valor."
    },
    {
      title: "Mecánica general",
      text: "Síntomas, comentario del cliente y disponibilidad para diagnóstico en taller."
    },
    {
      title: "Choques menores",
      text: "Registro visual para priorizar reparaciones, pedir más fotos o agendar revisión."
    },
    {
      title: "Mantención preventiva",
      text: "Consultas ordenadas para revisión, viaje, kilometraje o mantenciones periódicas."
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
