"use client";

import { useEffect, useMemo, useState } from "react";
import { statusLabels, workshop, type LeadStatus } from "@/data/workshop";
import { buildWhatsAppMessage, buildWhatsAppUrl, formatCLP } from "@/lib/format";
import type { Opportunity } from "@/lib/types";

const storageKey = "taller-demo-admin-password";

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setPassword(saved);
  }, []);

  const summary = useMemo(() => {
    const open = opportunities.filter((lead) => !["listo", "perdido"].includes(lead.status)).length;
    const scheduled = opportunities.filter((lead) => lead.status === "agendado" || lead.status === "en_taller").length;
    const quoted = opportunities.filter((lead) => lead.status === "cotizacion_enviada").length;
    const total = opportunities.reduce((sum, lead) => sum + (lead.estimated_amount || 0), 0);
    return { open, scheduled, quoted, total };
  }, [opportunities]);

  async function loadOpportunities(pass = password) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/opportunities", {
        headers: { "x-admin-password": pass }
      });

      if (!response.ok) throw new Error("Clave incorrecta o panel no disponible.");

      const data = (await response.json()) as { opportunities: Opportunity[]; mode: "demo" | "supabase" };
      setOpportunities(data.opportunities);
      setIsLogged(true);
      window.localStorage.setItem(storageKey, pass);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "No se pudo cargar el panel.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateOpportunity(id: string, status: LeadStatus, estimatedAmount?: number | null) {
    const previous = opportunities;
    setOpportunities((current) =>
      current.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              status,
              estimated_amount: estimatedAmount ?? lead.estimated_amount
            }
          : lead
      )
    );

    try {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({ status, estimated_amount: estimatedAmount })
      });

      if (!response.ok) throw new Error("No se pudo actualizar la oportunidad.");
    } catch (updateError) {
      setOpportunities(previous);
      setError(updateError instanceof Error ? updateError.message : "No se pudo actualizar.");
    }
  }

  if (!isLogged) {
    return (
      <main className="panelPage">
        <div className="loginBox">
          <a href="/" className="secondaryButton">← Volver a la demo</a>
          <h1>Panel interno</h1>
          <p className="smallText">
            Ingresa la clave definida en <strong>ADMIN_PASSWORD</strong>. Para probar sin configurar Supabase, usa <strong>demo123</strong>.
          </p>
          <div className="field">
            <label htmlFor="password">Clave del panel</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="demo123"
              onKeyDown={(event) => {
                if (event.key === "Enter") void loadOpportunities();
              }}
            />
          </div>
          <div className="formFooter">
            <button className="primaryButton" type="button" onClick={() => loadOpportunities()} disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
          {error && <div className="notice errorNotice">{error}</div>}
        </div>
      </main>
    );
  }

  return (
    <main className="panelPage">
      <div className="container">
        <div className="panelHero">
          <div>
            <a href="/" className="secondaryButton">← Volver a la demo</a>
            <h1>Panel de oportunidades</h1>
            <p className="smallText">Seguimiento simple para cotizaciones, trabajos agendados y oportunidades perdidas.</p>
          </div>
          <button className="darkButton" onClick={() => loadOpportunities()} type="button">
            Actualizar
          </button>
        </div>

        <div className="summaryStrip">
          <div className="summaryCard">
            <strong>{opportunities.length}</strong>
            <span>Total consultas</span>
          </div>
          <div className="summaryCard">
            <strong>{summary.open}</strong>
            <span>Abiertas</span>
          </div>
          <div className="summaryCard">
            <strong>{summary.scheduled}</strong>
            <span>Agendadas / taller</span>
          </div>
          <div className="summaryCard">
            <strong>{formatCLP(summary.total)}</strong>
            <span>Monto estimado</span>
          </div>
        </div>

        {error && <div className="notice errorNotice">{error}</div>}

        <section className="panelShell">
          <div className="kanban">
            {workshop.statuses.map((status) => {
              const filtered = opportunities.filter((lead) => lead.status === status);
              return (
                <div className="column" key={status}>
                  <div className="columnHeader">
                    <span>{statusLabels[status]}</span>
                    <span className="countPill">{filtered.length}</span>
                  </div>
                  {filtered.map((lead) => (
                    <OpportunityCard
                      key={lead.id}
                      lead={lead}
                      onUpdate={(nextStatus, nextAmount) => updateOpportunity(lead.id, nextStatus, nextAmount)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function OpportunityCard({
  lead,
  onUpdate
}: {
  lead: Opportunity;
  onUpdate: (status: LeadStatus, estimatedAmount?: number | null) => void;
}) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [amount, setAmount] = useState(lead.estimated_amount ? String(lead.estimated_amount) : "");
  const vehicle = [lead.vehicle_brand, lead.vehicle_model, lead.vehicle_year].filter(Boolean).join(" ") || "Vehículo no indicado";
  const whatsappMessage = buildWhatsAppMessage(lead, (lead.lead_photos || []).map((photo) => photo.public_url || "").filter(Boolean));
  const whatsappUrl = buildWhatsAppUrl(whatsappMessage);

  useEffect(() => {
    setStatus(lead.status);
    setAmount(lead.estimated_amount ? String(lead.estimated_amount) : "");
  }, [lead.status, lead.estimated_amount]);

  return (
    <article className="opportunityCard">
      <h3>{lead.customer_name}</h3>
      <div className="opportunityMeta">
        <strong>{lead.service_type}</strong>
        <br />
        {vehicle}
        <br />
        {lead.customer_whatsapp}
        <br />
        {lead.damage_description || "Sin comentario"}
        <br />
        {lead.lead_photos?.length ? `${lead.lead_photos.length} foto(s) cargada(s)` : "Sin fotos cargadas"}
      </div>
      <div className="opportunityActions">
        <select value={status} onChange={(event) => setStatus(event.target.value as LeadStatus)}>
          {workshop.statuses.map((item) => (
            <option key={item} value={item}>
              {statusLabels[item]}
            </option>
          ))}
        </select>
        <input
          inputMode="numeric"
          placeholder="Monto estimado"
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
        />
        <button className="miniButton" type="button" onClick={() => onUpdate(status, amount ? Number(amount) : null)}>
          Guardar estado
        </button>
        <a className="secondaryButton" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Responder WhatsApp
        </a>
      </div>
    </article>
  );
}
