import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { LeadInput } from "@/lib/types";

function cleanText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim().slice(0, 2000) : fallback;
}

function normalizePayload(body: LeadInput): LeadInput {
  return {
    customer_name: cleanText(body.customer_name),
    customer_whatsapp: cleanText(body.customer_whatsapp),
    vehicle_brand: cleanText(body.vehicle_brand),
    vehicle_model: cleanText(body.vehicle_model),
    vehicle_year: body.vehicle_year ? Number(body.vehicle_year) : null,
    plate: cleanText(body.plate).toUpperCase(),
    service_type: cleanText(body.service_type, "Consulta general"),
    damage_description: cleanText(body.damage_description),
    preferred_date: cleanText(body.preferred_date) || null,
    preferred_time: cleanText(body.preferred_time) || null,
    source: cleanText(body.source, "demo_web"),
    photos: Array.isArray(body.photos) ? body.photos.slice(0, 6) : []
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LeadInput;
    const payload = normalizePayload(body);

    if (!payload.customer_name || !payload.customer_whatsapp || !payload.service_type) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios: nombre, WhatsApp y servicio." },
        { status: 400 }
      );
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({
        mode: "demo",
        lead: {
          id: `demo-${Date.now()}`,
          status: "nuevo",
          ...payload
        }
      });
    }

    const supabase = getSupabaseAdmin();
    const { photos, ...leadPayload } = payload;

    const { data: lead, error: leadError } = await supabase
      .from("workshop_leads")
      .insert({ ...leadPayload, status: "nuevo" })
      .select("id")
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: leadError?.message || "No se pudo crear la oportunidad." },
        { status: 500 }
      );
    }

    if (photos?.length) {
      const photoRows = photos.map((photo) => ({
        lead_id: lead.id,
        storage_path: photo.storage_path || null,
        public_url: photo.public_url || null,
        file_name: photo.file_name || null,
        mime_type: photo.mime_type || null,
        size_bytes: photo.size_bytes || null
      }));

      const { error: photoError } = await supabase.from("lead_photos").insert(photoRows);
      if (photoError) {
        console.warn("No se pudieron guardar las fotos", photoError.message);
      }
    }

    return NextResponse.json({ mode: "supabase", lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
