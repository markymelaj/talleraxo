import { NextRequest, NextResponse } from "next/server";
import { demoOpportunities } from "@/lib/demoData";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

function isAuthorized(request: NextRequest) {
  const configuredPassword = process.env.ADMIN_PASSWORD || "demo123";
  return request.headers.get("x-admin-password") === configuredPassword;
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
