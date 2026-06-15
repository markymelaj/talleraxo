"use client";

import { useEffect, useMemo, useState } from "react";
import { statusLabels, workshop, type LeadStatus } from "@/data/workshop";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatCLP,
} from "@/lib/format";
import {
  clearStoredDemoOpportunities,
  getStoredDemoOpportunities,
  updateStoredDemoOpportunity,
} from "@/lib/demoStore";
import type { LeadPhoto, Opportunity } from "@/lib/types";

const storageKey = "taller-demo-admin-password";
type StatusFilter = LeadStatus | "todos";

type PhotoSelection = {
  url: string;
  label: string;
};

function formatDate(value?: string) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizeSearch(lead: Opportunity) {
  return [
    lead.customer_name,
    lead.customer_whatsapp,
    lead.vehicle_brand,
    lead.vehicle_model,
    lead.vehicle_year,
    lead.plate,
    lead.service_type,
    lead.damage_description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function photoUrl(photo: LeadPhoto) {
  return photo.public_url || photo.storage_path || "";
}

function formatAvailability(lead: Opportunity) {
  const parts = [lead.preferred_date, lead.preferred_time].filter(Boolean);
  return parts.length ? parts.join(" · ") : "A coordinar";
}

function nextStepForLead(lead: Opportunity, hasPhotos: boolean) {
  if (!hasPhotos || lead.status === "falta_foto") return "Pedir foto clara y confirmar pieza afectada.";
  if (lead.status === "nuevo") return "Responder hoy: validar daño, rango de precio y disponibilidad.";
  if (lead.status === "cotizacion_enviada") return "Hacer seguimiento y cerrar fecha de revisión.";
  if (lead.status === "agendado") return "Confirmar asistencia y preparar recepción del vehículo.";
  if (lead.status === "en_taller") return "Actualizar avance y próximo compromiso con el cliente.";
  if (lead.status === "listo") return "Cerrar entrega, solicitar foto/testimonio y registrar aprendizaje.";
  return "Revisar motivo de pérdida para recuperar o mejorar la oferta.";
}

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("todos");
  const [search, setSearch] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoSelection | null>(
    null,
  );
  const [dataMode, setDataMode] = useState<"demo" | "supabase">("demo");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setPassword(saved);
  }, []);

  const summary = useMemo(() => {
    const open = opportunities.filter(
      (lead) => !["listo", "perdido"].includes(lead.status),
    ).length;
    const newLeads = opportunities.filter((lead) => lead.status === "nuevo").length;
    const needsPhoto = opportunities.filter(
      (lead) => lead.status === "falta_foto",
    ).length;
    const scheduled = opportunities.filter(
      (lead) => lead.status === "agendado" || lead.status === "en_taller",
    ).length;
    const total = opportunities
      .filter((lead) => lead.status !== "perdido")
      .reduce((sum, lead) => sum + (lead.estimated_amount || 0), 0);
    return { open, newLeads, needsPhoto, scheduled, total };
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    const query = search.trim().toLowerCase();
    return opportunities.filter((lead) => {
      const statusMatches =
        activeStatus === "todos" || lead.status === activeStatus;
      const searchMatches = !query || normalizeSearch(lead).includes(query);
      return statusMatches && searchMatches;
    });
  }, [opportunities, activeStatus, search]);

  function countByStatus(status: StatusFilter) {
    if (status === "todos") return opportunities.length;
    return opportunities.filter((lead) => lead.status === status).length;
  }

  async function loadOpportunities(pass = password) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/opportunities", {
        headers: { "x-admin-password": pass },
      });

      if (!response.ok)
        throw new Error("Clave incorrecta o panel no disponible.");

      const data = (await response.json()) as {
        opportunities: Opportunity[];
        mode: "demo" | "supabase";
      };
      const localDemo =
        data.mode === "demo" ? getStoredDemoOpportunities() : [];
      const merged = [...localDemo, ...data.opportunities].filter(
        (lead, index, list) =>
          list.findIndex((item) => item.id === lead.id) === index,
      );
      setDataMode(data.mode);
      setOpportunities(merged);
      setIsLogged(true);
      window.localStorage.setItem(storageKey, pass);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar el panel.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateOpportunity(
    id: string,
    status: LeadStatus,
    estimatedAmount?: number | null,
    adminNotes?: string | null,
  ) {
    const previous = opportunities;
    setOpportunities((current) =>
      current.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              status,
              estimated_amount: estimatedAmount ?? null,
              admin_notes: adminNotes ?? lead.admin_notes,
            }
          : lead,
      ),
    );

    try {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          status,
          estimated_amount: estimatedAmount,
          admin_notes: adminNotes,
        }),
      });

      if (!response.ok)
        throw new Error("No se pudo actualizar la oportunidad.");
      if (dataMode === "demo") {
        updateStoredDemoOpportunity(id, {
          status,
          estimated_amount: estimatedAmount ?? null,
          admin_notes: adminNotes ?? null,
        });
      }
    } catch (updateError) {
      setOpportunities(previous);
      setError(
        updateError instanceof Error
          ? updateError.message
          : "No se pudo actualizar.",
      );
    }
  }

  function resetLocalDemo() {
    clearStoredDemoOpportunities();
    void loadOpportunities();
  }

  if (!isLogged) {
    return (
      <main className="panelPage authPage">
        <section className="authCard">
          <a href="/" className="backLink">
            ← Ver demo pública
          </a>
          <span className="eyebrow">Acceso taller</span>
          <h1>
            Panel simple para responder, ordenar y no perder cotizaciones.
          </h1>
          <p>
            Pensado para usar desde celular: revisar fotos, cambiar estado,
            cargar monto estimado y responder por WhatsApp sin buscar datos
            sueltos.
          </p>

          <div className="field authField">
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

          <button
            className="primaryButton wideButton"
            type="button"
            onClick={() => loadOpportunities()}
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar al panel"}
          </button>

          <div className="authHint">
            Demo sin Supabase: <strong>demo123</strong>. Lo que cargues desde el
            formulario se verá en este mismo navegador. En cliente real se
            cambia con <strong>ADMIN_PASSWORD</strong>.
          </div>
          {error && <div className="notice errorNotice">{error}</div>}
        </section>
      </main>
    );
  }

  return (
    <main className="panelPage">
      <div className="adminTop">
        <div className="container adminTopGrid">
          <div>
            <a href="/" className="backLink">
              ← Demo pública
            </a>
            <span className="eyebrow">Panel móvil para taller</span>
            <h1>Oportunidades y fotos de reparación</h1>
            <p>
              Todo lo que llega desde el cotizador queda ordenado para cotizar,
              agendar o descartar.
            </p>
          </div>
          <div className="adminActions">
            <span className="demoModeBadge">
              {dataMode === "demo" ? "Modo demo" : "Supabase activo"}
            </span>
            {dataMode === "demo" && (
              <button
                className="ghostButton"
                onClick={resetLocalDemo}
                type="button"
              >
                Reiniciar demo
              </button>
            )}
            <button
              className="darkButton refreshButton"
              onClick={() => loadOpportunities()}
              type="button"
              disabled={isLoading}
            >
              {isLoading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>
      </div>

      <div className="container adminContent">
        <section className="adminMetrics" aria-label="Resumen del panel">
          <div className="adminMetric primaryMetric">
            <span>Por trabajar</span>
            <strong>{summary.open}</strong>
          </div>
          <div className="adminMetric">
            <span>Nuevas</span>
            <strong>{summary.newLeads}</strong>
          </div>
          <div className="adminMetric">
            <span>Agendadas / taller</span>
            <strong>{summary.scheduled}</strong>
          </div>
          <div className="adminMetric moneyMetric">
            <span>Monto activo</span>
            <strong>{formatCLP(summary.total)}</strong>
          </div>
        </section>

        <section className="adminToolbar">
          <div className="searchBox">
            <label htmlFor="search">Buscar</label>
            <input
              id="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cliente, patente, modelo, servicio..."
            />
          </div>
          <div className="statusTabs" aria-label="Filtrar por estado">
            {(["todos", ...workshop.statuses] as StatusFilter[]).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  className={`statusTab ${activeStatus === status ? "active" : ""}`}
                  onClick={() => setActiveStatus(status)}
                >
                  <span>
                    {status === "todos" ? "Todos" : statusLabels[status]}
                  </span>
                  <strong>{countByStatus(status)}</strong>
                </button>
              ),
            )}
          </div>
        </section>

        {error && <div className="notice errorNotice">{error}</div>}

        <section className="mobileLeadList">
          {filteredOpportunities.length === 0 ? (
            <div className="emptyState">
              <strong>No hay oportunidades con ese filtro.</strong>
              <span>Prueba cambiar el estado o limpiar la búsqueda.</span>
            </div>
          ) : (
            filteredOpportunities.map((lead) => (
              <OpportunityCard
                key={lead.id}
                lead={lead}
                onUpdate={(nextStatus, nextAmount, nextNotes) =>
                  updateOpportunity(lead.id, nextStatus, nextAmount, nextNotes)
                }
                onOpenPhoto={setSelectedPhoto}
              />
            ))
          )}
        </section>
      </div>

      {selectedPhoto && (
        <div
          className="photoModal"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="closeModal"
            type="button"
            aria-label="Cerrar foto"
            onClick={() => setSelectedPhoto(null)}
          >
            ×
          </button>
          <div
            className="photoModalInner"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={selectedPhoto.url} alt={selectedPhoto.label} />
            <span>{selectedPhoto.label}</span>
          </div>
        </div>
      )}
    </main>
  );
}

function OpportunityCard({
  lead,
  onUpdate,
  onOpenPhoto,
}: {
  lead: Opportunity;
  onUpdate: (
    status: LeadStatus,
    estimatedAmount?: number | null,
    adminNotes?: string | null,
  ) => void;
  onOpenPhoto: (photo: PhotoSelection) => void;
}) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [amount, setAmount] = useState(
    lead.estimated_amount ? String(lead.estimated_amount) : "",
  );
  const [notes, setNotes] = useState(lead.admin_notes || "");
  const vehicle =
    [lead.vehicle_brand, lead.vehicle_model, lead.vehicle_year]
      .filter(Boolean)
      .join(" ") || "Vehículo no indicado";
  const photos = lead.lead_photos || [];
  const photoUrls = photos.map(photoUrl).filter(Boolean);
  const availability = formatAvailability(lead);
  const nextStep = nextStepForLead(lead, photoUrls.length > 0);
  const whatsappMessage = buildWhatsAppMessage(lead, photoUrls);
  const whatsappUrl = buildWhatsAppUrl(whatsappMessage);

  useEffect(() => {
    setStatus(lead.status);
    setAmount(lead.estimated_amount ? String(lead.estimated_amount) : "");
    setNotes(lead.admin_notes || "");
  }, [lead.status, lead.estimated_amount, lead.admin_notes]);

  return (
    <article className="leadCard">
      <div className="leadCardHeader">
        <div>
          <span className={`statusPill status-${status}`}>
            {statusLabels[status]}
          </span>
          <h2>{lead.customer_name}</h2>
          <p>{formatDate(lead.created_at)}</p>
        </div>
        <a
          className="callButton"
          href={`tel:${lead.customer_whatsapp.replace(/\s/g, "")}`}
        >
          Llamar
        </a>
      </div>

      <div className="leadVehicleBlock">
        <div>
          <span>Vehículo</span>
          <strong>{vehicle}</strong>
        </div>
        <div>
          <span>Servicio</span>
          <strong>{lead.service_type}</strong>
        </div>
        <div>
          <span>Patente</span>
          <strong>{lead.plate || "No indicada"}</strong>
        </div>
      </div>

      <div className="leadMetaStrip">
        <div>
          <span>Disponibilidad</span>
          <strong>{availability}</strong>
        </div>
        <div>
          <span>WhatsApp</span>
          <strong>{lead.customer_whatsapp}</strong>
        </div>
        <div>
          <span>Origen</span>
          <strong>{lead.source || "Web"}</strong>
        </div>
      </div>

      <div className="damageBox">
        <span>Comentario del cliente</span>
        <p>{lead.damage_description || "Sin comentario del cliente."}</p>
      </div>

      <div className="nextStepBox">
        <span>Próximo paso sugerido</span>
        <strong>{nextStep}</strong>
      </div>

      <div className="photoSection">
        <div className="photoSectionHeader">
          <strong>Fotos recibidas</strong>
          <span>
            {photos.length ? `${photos.length} archivo(s)` : "Sin fotos"}
          </span>
        </div>
        {photos.length ? (
          <div className="adminPhotoGrid">
            {photos.map((photo, index) => {
              const url = photoUrl(photo);
              const label = photo.file_name || `Foto ${index + 1}`;
              return (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  className="photoThumb"
                  onClick={() => url && onOpenPhoto({ url, label })}
                  disabled={!url}
                >
                  {url ? <img src={url} alt={label} /> : <span>Sin URL</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="noPhotosBox">
            Pedir fotos antes de enviar presupuesto.
          </div>
        )}
      </div>

      <div className="leadControls">
        <div className="field compactField">
          <label>Estado</label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as LeadStatus)}
          >
            {workshop.statuses.map((item) => (
              <option key={item} value={item}>
                {statusLabels[item]}
              </option>
            ))}
          </select>
        </div>
        <div className="field compactField">
          <label>Monto estimado</label>
          <input
            inputMode="numeric"
            placeholder="Ej: 85000"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value.replace(/\D/g, ""))
            }
          />
        </div>
        <div className="field compactField fullControl">
          <label>Nota interna</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Ej: pedir foto con luz natural, confirmar color, cliente quiere sábado..."
          />
        </div>
      </div>

      <div className="leadActions">
        <button
          className="primaryButton"
          type="button"
          onClick={() =>
            onUpdate(status, amount ? Number(amount) : null, notes)
          }
        >
          Guardar
        </button>
        <a
          className="whatsappButton"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Responder por WhatsApp
        </a>
      </div>
    </article>
  );
}
