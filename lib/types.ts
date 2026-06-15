import type { LeadStatus } from "@/data/workshop";

export type LeadPhoto = {
  storage_path?: string | null;
  public_url?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
};

export type LeadInput = {
  customer_name: string;
  customer_whatsapp: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_year?: number | null;
  plate?: string;
  service_type: string;
  damage_description?: string;
  preferred_date?: string | null;
  preferred_time?: string | null;
  source?: string;
  photos?: LeadPhoto[];
};

export type Opportunity = LeadInput & {
  id: string;
  created_at: string;
  updated_at?: string;
  status: LeadStatus;
  estimated_amount?: number | null;
  admin_notes?: string | null;
  lead_photos?: LeadPhoto[];
};
