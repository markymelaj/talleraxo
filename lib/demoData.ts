import type { Opportunity } from "@/lib/types";

export const demoOpportunities: Opportunity[] = [
  {
    id: "demo-001",
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    customer_name: "Camila Rojas",
    customer_whatsapp: "+56 9 5555 1010",
    vehicle_brand: "Toyota",
    vehicle_model: "Yaris",
    vehicle_year: 2018,
    plate: "ABCD12",
    service_type: "Pintura por pieza",
    damage_description: "Rayón profundo en parachoque trasero derecho. Puede llevarlo mañana en la tarde.",
    preferred_date: new Date().toISOString().slice(0, 10),
    preferred_time: "Tarde",
    source: "demo_web",
    status: "nuevo",
    estimated_amount: null,
    admin_notes: "Pedir foto de costado y confirmar color.",
    lead_photos: [
      {
        public_url: "/demo-fotos/parachoque.svg",
        file_name: "parachoque-trasero-demo.svg",
        mime_type: "image/svg+xml",
        size_bytes: 4120
      }
    ]
  },
  {
    id: "demo-002",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    customer_name: "Mauricio Pérez",
    customer_whatsapp: "+56 9 4444 2020",
    vehicle_brand: "Hyundai",
    vehicle_model: "Accent",
    vehicle_year: 2020,
    plate: "EFGH34",
    service_type: "Desabolladura",
    damage_description: "Puerta del copiloto con golpe de estacionamiento. Enviará más fotos.",
    preferred_time: "Mañana",
    source: "demo_web",
    status: "falta_foto",
    estimated_amount: 0,
    admin_notes: "Falta foto frontal y foto con luz natural.",
    lead_photos: [
      {
        public_url: "/demo-fotos/puerta.svg",
        file_name: "puerta-copiloto-demo.svg",
        mime_type: "image/svg+xml",
        size_bytes: 3980
      }
    ]
  },
  {
    id: "demo-003",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    customer_name: "Daniela Muñoz",
    customer_whatsapp: "+56 9 3333 3030",
    vehicle_brand: "Nissan",
    vehicle_model: "Kicks",
    vehicle_year: 2022,
    service_type: "Mantención preventiva",
    damage_description: "Revisión general antes de viaje. Quiere agendar para el viernes.",
    preferred_time: "Mañana",
    source: "demo_web",
    status: "agendado",
    estimated_amount: 45000,
    admin_notes: "Agendada evaluación inicial.",
    lead_photos: [
      {
        public_url: "/demo-fotos/motor.svg",
        file_name: "revision-motor-demo.svg",
        mime_type: "image/svg+xml",
        size_bytes: 3890
      }
    ]
  }
];
