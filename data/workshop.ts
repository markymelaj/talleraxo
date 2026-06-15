export const workshop = {
  name: "TallerPro",
  brandLine: "Cotizador digital para talleres, pintura y desabolladura",
  city: "Sur de Chile",
  phone: process.env.NEXT_PUBLIC_WORKSHOP_WHATSAPP || "56900000000",
  hours: "Lunes a viernes · Sábado medio día",
  location: "Atención por agenda y WhatsApp",
  heroTitle: "Convierte consultas vagas en trabajos listos para cotizar.",
  heroText:
    "El cliente envía fotos, datos del vehículo, servicio requerido y disponibilidad. El taller recibe una oportunidad ordenada para responder, presupuestar o agendar sin perder tiempo en preguntas repetidas.",
  services: [
    {
      title: "Desabolladura",
      text: "Fotos del daño, pieza afectada y prioridad para decidir si se cotiza, se pide más información o se agenda revisión."
    },
    {
      title: "Pintura por pieza",
      text: "Solicitud ordenada por panel, color, estado del vehículo y fecha ideal de evaluación."
    },
    {
      title: "Pintura general",
      text: "Ingreso claro para trabajos completos, restauraciones y evaluaciones de mayor valor."
    },
    {
      title: "Mecánica general",
      text: "Síntomas, comentario del cliente y disponibilidad para diagnóstico en taller."
    },
    {
      title: "Choques menores",
      text: "Registro visual para priorizar reparaciones, detectar urgencias y responder con más precisión."
    },
    {
      title: "Mantención preventiva",
      text: "Consultas ordenadas para revisión, kilometraje, viaje o mantenciones periódicas."
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
      before: "Revisión preventiva",
      after: "Diagnóstico ordenado",
      detail: "Agenda previa con datos del vehículo"
    }
  ],
  ownerBenefits: [
    {
      title: "Menos preguntas repetidas",
      text: "El formulario pide lo mínimo necesario antes de que el equipo responda."
    },
    {
      title: "Fotos en un solo lugar",
      text: "El admin abre las imágenes desde cada oportunidad, sin buscar en chats antiguos."
    },
    {
      title: "Seguimiento simple",
      text: "Nuevo, falta foto, cotizado, agendado, en taller, listo o perdido."
    },
    {
      title: "Mejor cierre",
      text: "Cada consulta queda con monto estimado, nota interna y botón directo a WhatsApp."
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
