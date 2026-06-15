import { NextRequest, NextResponse } from "next/server";
import { statusLabels, workshop, type LeadStatus } from "@/data/workshop";
import { demoOpportunities } from "@/lib/demoData";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { LeadInput } from "@/lib/types";

function isAuthorized(request: NextRequest) {
  const configuredPassword = process.env.ADMIN_PASSWORD || "demo123";
  return request.headers.get("x-admin-password") === configuredPassword;
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 2000) : fallback;
}

function isValidStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (workshop.statuses as readonly string[]).includes(value);
}

function normalizeAdminPayload(body: LeadInput & { status?: LeadStatus; estimated_amount?: number | string | null; admin_notes?: string | null }) {
  const status = isValidStatus(body.status) ? body.status : "nuevo";
  const estimatedAmount = body.estimated_amount === null || body.estimated_amount === undefined || body.estimated_amount === ""
    ? null
    : Number(body.estimated_amount);

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
    source: cleanText(body.source, "admin_panel"),
    status,
    estimated_amount: typeof estimatedAmount === "number" && Number.isFinite(estimatedAmount) ? estimatedAmount : null,
    admin_notes: cleanText(body.admin_notes || null)
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ mode: "demo", opportunities: demoOpportunities });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workshop_leads")
    .select("*, lead_photos(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ mode: "supabase", opportunities: data || [] });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = normalizeAdminPayload(body);

    if (!payload.customer_name || !payload.customer_whatsapp || !payload.service_type) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios: nombre, WhatsApp y servicio." },
        { status: 400 }
      );
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({
        mode: "demo",
        opportunity: {
          id: `demo-admin-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          lead_photos: [],
          ...payload
        }
      });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("workshop_leads")
      .insert(payload)
      .select("*, lead_photos(*)")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "No se pudo crear la entrada." }, { status: 500 });
    }

    await supabase.from("lead_status_events").insert({
      lead_id: data.id,
      old_status: null,
      new_status: payload.status,
      note: `Creado desde admin como ${statusLabels[payload.status]}`
    });

    return NextResponse.json({ mode: "supabase", opportunity: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
