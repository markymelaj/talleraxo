import { NextRequest, NextResponse } from "next/server";
import { workshop } from "@/data/workshop";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { LeadStatus } from "@/data/workshop";

function isAuthorized(request: NextRequest) {
  const configuredPassword = process.env.ADMIN_PASSWORD || "demo123";
  return request.headers.get("x-admin-password") === configuredPassword;
}

function isValidStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (workshop.statuses as readonly string[]).includes(value);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const nextStatus = body.status;

  if (!isValidStatus(nextStatus)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const estimatedAmount = body.estimated_amount === null || body.estimated_amount === undefined || body.estimated_amount === ""
    ? null
    : Number(body.estimated_amount);
  const adminNotes = typeof body.admin_notes === "string" ? body.admin_notes.trim().slice(0, 2000) : null;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ mode: "demo", id, status: nextStatus, estimated_amount: estimatedAmount, admin_notes: adminNotes });
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("workshop_leads")
    .select("status")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("workshop_leads")
    .update({
      status: nextStatus,
      estimated_amount: Number.isFinite(estimatedAmount) ? estimatedAmount : null,
      admin_notes: adminNotes,
      last_status_change_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("lead_status_events").insert({
    lead_id: id,
    old_status: existing?.status || null,
    new_status: nextStatus,
    note: "Cambio desde panel demo"
  });

  return NextResponse.json({ mode: "supabase", opportunity: data });
}
