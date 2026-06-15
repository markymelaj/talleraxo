"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { serviceOptions, statusLabels, workshop, type LeadStatus } from "@/data/workshop";
import { buildWhatsAppMessage, buildWhatsAppUrl, formatCLP } from "@/lib/format";
import { clearStoredDemoOpportunities, getStoredDemoOpportunities, updateStoredDemoOpportunity } from "@/lib/demoStore";
import type { LeadPhoto, Opportunity } from "@/lib/types";

const storageKey = "taller-demo-admin-password";
type StatusFilter = LeadStatus | "todos";
type ViewMode = "lista" | "dia" | "semana" | "mes";

type PhotoSelection = {
  url: string;
  label: string;
};

type AdminFormState = {
  customer_name: string;
  customer_whatsapp: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: string;
  plate: string;
  service_type: string;
  damage_description: string;
  preferred_date: string;
  preferred_time: string;
  status: LeadStatus;
  estimated_amount: string;
  admin_notes: string;
};


const adminGuideCards = [
  {
    title: "1. Captar",
    text: "Las consultas de la web llegan solas con datos, fotos y disponibilidad."
  },
  {
    title: "2. Registrar",
    text: "Si el cliente llega al taller, usa Nueva entrada y queda dentro de la misma agenda."
  },
  {
    title: "3. Ordenar",
    text: "Cambia estados, agrega monto, deja nota interna y usa filtros para no perder seguimiento."
  },
  {
    title: "4. Agendar",
    text: "Mira trabajos por lista, día, semana o mes para saber qué está pendiente o en curso."
  }
];

const initialAdminForm = (): AdminFormState => ({
  customer_name: "",
  customer_whatsapp: "",
  vehicle_brand: "",
  vehicle_model: "",
  vehicle_year: "",
  plate: "",
  service_type: "Desabolladura",
  damage_description: "",
  preferred_date: todayKey(),
  preferred_time: "",
  status: "agendado",
  estimated_amount: "",
  admin_notes: ""
});

function todayKey() {
  const now = new Date();
  return toDateKey(now);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay() || 7;
  next.setDate(next.getDate() - day + 1);
  return next;
}

function formatDate(value?: string) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatAgendaLabel(value: string, options: Intl.DateTimeFormatOptions = { weekday: "short", day: "2-digit", month: "short" }) {
  return new Intl.DateTimeFormat("es-CL", options).format(fromDateKey(value));
}

function leadDateKey(lead: Opportunity) {
  return lead.preferred_date || lead.created_at.slice(0, 10);
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
    lead.admin_notes
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

function vehicleLabel(lead: Opportunity) {
  return [lead.vehicle_brand, lead.vehicle_model, lead.vehicle_year].filter(Boolean).join(" ") || "Vehículo no indicado";
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

function sortByAgenda(a: Opportunity, b: Opportunity) {
  const date = leadDateKey(a).localeCompare(leadDateKey(b));
  if (date !== 0) return date;
  return (a.preferred_time || "99").localeCompare(b.preferred_time || "99");
}

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("todos");
  const [search, setSearch] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoSelection | null>(null);
  const [dataMode, setDataMode] = useState<"demo" | "supabase">("demo");
  const [viewMode, setViewMode] = useState<ViewMode>("lista");
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<AdminFormState>(initialAdminForm);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setPassword(saved);
  }, []);

  const summary = useMemo(() => {
    const open = opportunities.filter((lead) => !["listo", "perdido"].includes(lead.status)).length;
    const newLeads = opportunities.filter((lead) => lead.status === "nuevo").length;
    const scheduled = opportunities.filter((lead) => lead.status === "agendado" || lead.status === "en_taller").length;
    const total = opportunities
      .filter((lead) => lead.status !== "perdido")
      .reduce((sum, lead) => sum + (lead.estimated_amount || 0), 0);
    return { open, newLeads, scheduled, total };
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    const query = search.trim().toLowerCase();
    return opportunities.filter((lead) => {
      const statusMatches = activeStatus === "todos" || lead.status === activeStatus;
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
        headers: { "x-admin-password": pass }
      });

      if (!response.ok) throw new Error("Clave incorrecta o panel no disponible.");

      const data = (await response.json()) as { opportunities: Opportunity[]; mode: "demo" | "supabase" };
      const localDemo = data.mode === "demo" ? getStoredDemoOpportunities() : [];
      const merged = [...localDemo, ...data.opportunities].filter(
        (lead, index, list) => list.findIndex((item) => item.id === lead.id) === index
      );
      setDataMode(data.mode);
      setOpportunities(merged);
      setIsLogged(true);
      window.localStorage.setItem(storageKey, pass);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "No se pudo cargar el panel.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function createOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({
          ...createForm,
          vehicle_year: createForm.vehicle_year ? Number(createForm.vehicle_year) : null,
          estimated_amount: createForm.estimated_amount ? Number(createForm.estimated_amount) : null,
          source: "admin_panel"
        })
      });

      const data = (await response.json()) as { opportunity?: Opportunity; error?: string };
      if (!response.ok || !data.opportunity) throw new Error(data.error || "No se pudo crear la entrada.");

      setOpportunities((current) => [data.opportunity as Opportunity, ...current]);
      setSelectedDate(leadDateKey(data.opportunity));
      setCreateForm(initialAdminForm());
      setIsCreateOpen(false);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "No se pudo crear la entrada.");
    } finally {
      setIsCreating(false);
    }
  }

  async function updateOpportunity(id: string, status: LeadStatus, estimatedAmount?: number | null, adminNotes?: string | null) {
    const previous = opportunities;
    setOpportunities((current) =>
      current.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              status,
              estimated_amount: estimatedAmount ?? null,
              admin_notes: adminNotes ?? lead.admin_notes
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
        body: JSON.stringify({ status, estimated_amount: estimatedAmount, admin_notes: adminNotes })
      });

      if (!response.ok) throw new Error("No se pudo actualizar la oportunidad.");
      if (dataMode === "demo") {
        updateStoredDemoOpportunity(id, {
          status,
          estimated_amount: estimatedAmount ?? null,
          admin_notes: adminNotes ?? null
        });
      }
    } catch (updateError) {
      setOpportunities(previous);
      setError(updateError instanceof Error ? updateError.message : "No se pudo actualizar.");
    }
  }

  function resetLocalDemo() {
    clearStoredDemoOpportunities();
    void loadOpportunities();
  }

  function updateCreateField<K extends keyof AdminFormState>(field: K, value: AdminFormState[K]) {
    setCreateForm((current) => ({ ...current, [field]: value }));
  }

  if (!isLogged) {
    return (
      <main className="panelPage authPage">
        <section className="authCard">
          <a href="/" className="backLink">← Ver demo pública</a>
          <span className="eyebrow">Acceso taller</span>
          <h1>Panel simple para responder, ordenar y no perder cotizaciones.</h1>
          <p>
            Pensado para usar desde celular: revisar fotos, crear trabajos presenciales, ver agenda, cambiar estados, cargar monto estimado y responder por WhatsApp sin buscar datos sueltos.
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

          <button className="primaryButton wideButton" type="button" onClick={() => loadOpportunities()} disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar al panel"}
          </button>

          <div className="authHint">
            Si Supabase está configurado, el panel trabaja con oportunidades reales. Sin Supabase queda en modo demo local.
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
            <a href="/" className="backLink">← Demo pública</a>
            <span className="eyebrow">Panel móvil para taller</span>
            <h1>Bandeja de oportunidades y agenda de trabajos</h1>
            <p>Desde aquí puedes recibir consultas web, crear trabajos presenciales, agendar, cambiar estados y responder por WhatsApp sin perder el orden.</p>
          </div>
          <div className="adminActions">
            <button className="primaryButton" type="button" onClick={() => setIsCreateOpen(true)}>
              + Nueva entrada
            </button>
            <span className="demoModeBadge">{dataMode === "demo" ? "Modo demo" : "Supabase activo"}</span>
            {dataMode === "demo" && (
              <button className="ghostButton" onClick={resetLocalDemo} type="button">
                Reiniciar demo
              </button>
            )}
            <button className="darkButton refreshButton" onClick={() => loadOpportunities()} type="button" disabled={isLoading}>
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


        <section className="adminGuideGrid" aria-label="Cómo usar el panel">
          {adminGuideCards.map((card) => (
            <article key={card.title}>
              <strong>{card.title}</strong>
              <span>{card.text}</span>
            </article>
          ))}
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
            {(["todos", ...workshop.statuses] as StatusFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                className={`statusTab ${activeStatus === status ? "active" : ""}`}
                onClick={() => setActiveStatus(status)}
              >
                <span>{status === "todos" ? "Todos" : statusLabels[status]}</span>
                <strong>{countByStatus(status)}</strong>
              </button>
            ))}
          </div>
          <div className="agendaControls">
            <div className="viewSwitch" aria-label="Cambiar vista">
              {(["lista", "dia", "semana", "mes"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={viewMode === mode ? "active" : ""}
                  onClick={() => setViewMode(mode)}
                >
                  {mode === "dia" ? "Día" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </div>
        </section>

        {error && <div className="notice errorNotice">{error}</div>}

        {viewMode === "lista" ? (
          <section className="mobileLeadList">
            {filteredOpportunities.length === 0 ? (
              <div className="emptyState">
                <strong>No hay oportunidades con ese filtro.</strong>
                <span>Prueba cambiar el estado, limpiar la búsqueda o crear una entrada manual.</span>
              </div>
            ) : (
              filteredOpportunities.map((lead) => (
                <OpportunityCard
                  key={lead.id}
                  lead={lead}
                  onUpdate={(nextStatus, nextAmount, nextNotes) => updateOpportunity(lead.id, nextStatus, nextAmount, nextNotes)}
                  onOpenPhoto={setSelectedPhoto}
                />
              ))
            )}
          </section>
        ) : (
          <AgendaBoard opportunities={filteredOpportunities} viewMode={viewMode} selectedDate={selectedDate} />
        )}
      </div>

      {isCreateOpen && (
        <CreateOpportunityModal
          form={createForm}
          isCreating={isCreating}
          onChange={updateCreateField}
          onSubmit={createOpportunity}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {selectedPhoto && (
        <div className="photoModal" role="dialog" aria-modal="true" onClick={() => setSelectedPhoto(null)}>
          <button className="closeModal" type="button" aria-label="Cerrar foto" onClick={() => setSelectedPhoto(null)}>
            ×
          </button>
          <div className="photoModalInner" onClick={(event) => event.stopPropagation()}>
            <img src={selectedPhoto.url} alt={selectedPhoto.label} />
            <span>{selectedPhoto.label}</span>
          </div>
        </div>
      )}
    </main>
  );
}

function AgendaBoard({ opportunities, viewMode, selectedDate }: { opportunities: Opportunity[]; viewMode: ViewMode; selectedDate: string }) {
  const sorted = [...opportunities].sort(sortByAgenda);
  const selected = fromDateKey(selectedDate);

  if (viewMode === "dia") {
    const dayLeads = sorted.filter((lead) => leadDateKey(lead) === selectedDate);
    return (
      <section className="agendaBoard">
        <div className="agendaHeader">
          <div>
            <span className="eyebrow">Agenda diaria</span>
            <h2>{formatAgendaLabel(selectedDate, { weekday: "long", day: "2-digit", month: "long" })}</h2>
          </div>
          <strong>{dayLeads.length} trabajo(s)</strong>
        </div>
        <div className="agendaDayList">
          {dayLeads.length ? dayLeads.map((lead) => <AgendaItem key={lead.id} lead={lead} />) : <EmptyAgenda />}
        </div>
      </section>
    );
  }

  if (viewMode === "semana") {
    const start = startOfWeek(selected);
    const days = Array.from({ length: 7 }, (_, index) => toDateKey(addDays(start, index)));
    return (
      <section className="agendaBoard">
        <div className="agendaHeader">
          <div>
            <span className="eyebrow">Agenda semanal</span>
            <h2>{formatAgendaLabel(days[0])} — {formatAgendaLabel(days[6])}</h2>
          </div>
          <strong>{sorted.filter((lead) => days.includes(leadDateKey(lead))).length} trabajo(s)</strong>
        </div>
        <div className="weekGrid">
          {days.map((day) => {
            const dayLeads = sorted.filter((lead) => leadDateKey(lead) === day);
            return (
              <div className="agendaColumn" key={day}>
                <div className="agendaColumnHead">
                  <strong>{formatAgendaLabel(day, { weekday: "short" })}</strong>
                  <span>{formatAgendaLabel(day, { day: "2-digit", month: "short" })}</span>
                </div>
                {dayLeads.length ? dayLeads.map((lead) => <AgendaItem key={lead.id} lead={lead} compact />) : <span className="agendaEmptyMini">Libre</span>}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  const first = new Date(selected.getFullYear(), selected.getMonth(), 1, 12, 0, 0);
  const calendarStart = startOfWeek(first);
  const days = Array.from({ length: 42 }, (_, index) => toDateKey(addDays(calendarStart, index)));
  return (
    <section className="agendaBoard">
      <div className="agendaHeader">
        <div>
          <span className="eyebrow">Agenda mensual</span>
          <h2>{new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric" }).format(selected)}</h2>
        </div>
        <strong>{sorted.filter((lead) => leadDateKey(lead).slice(0, 7) === selectedDate.slice(0, 7)).length} trabajo(s)</strong>
      </div>
      <div className="monthGrid">
        {days.map((day) => {
          const dayLeads = sorted.filter((lead) => leadDateKey(lead) === day).slice(0, 3);
          const isCurrentMonth = fromDateKey(day).getMonth() === selected.getMonth();
          return (
            <div className={`monthCell ${isCurrentMonth ? "" : "muted"}`} key={day}>
              <strong>{fromDateKey(day).getDate()}</strong>
              {dayLeads.map((lead) => <AgendaItem key={lead.id} lead={lead} mini />)}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AgendaItem({ lead, compact = false, mini = false }: { lead: Opportunity; compact?: boolean; mini?: boolean }) {
  return (
    <article className={`agendaItem ${compact ? "compact" : ""} ${mini ? "mini" : ""}`}>
      <span className={`agendaDot status-${lead.status}`}>{statusLabels[lead.status]}</span>
      <strong>{lead.preferred_time || "Sin hora"} · {lead.customer_name}</strong>
      {!mini && <small>{lead.service_type} · {vehicleLabel(lead)}</small>}
    </article>
  );
}

function EmptyAgenda() {
  return (
    <div className="emptyState">
      <strong>No hay trabajos para esta fecha.</strong>
      <span>Puedes crear una entrada manual desde el botón “Nueva entrada”.</span>
    </div>
  );
}

function CreateOpportunityModal({
  form,
  isCreating,
  onChange,
  onSubmit,
  onClose
}: {
  form: AdminFormState;
  isCreating: boolean;
  onChange: <K extends keyof AdminFormState>(field: K, value: AdminFormState[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <div className="adminModal" role="dialog" aria-modal="true" onClick={onClose}>
      <form className="adminModalCard" onSubmit={onSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="adminModalHeader">
          <div>
            <span className="eyebrow">Entrada manual</span>
            <h2>Crear trabajo desde el taller</h2>
            <p>Para clientes que llegan presencialmente, llaman por teléfono o escriben directo al WhatsApp del taller.</p>
          </div>
          <button type="button" className="closeModal inlineClose" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="modalFormGrid">
          <div className="field">
            <label>Cliente</label>
            <input required value={form.customer_name} onChange={(event) => onChange("customer_name", event.target.value)} placeholder="Nombre del cliente" />
          </div>
          <div className="field">
            <label>WhatsApp</label>
            <input required value={form.customer_whatsapp} onChange={(event) => onChange("customer_whatsapp", event.target.value)} placeholder="+56 9 ..." />
          </div>
          <div className="field">
            <label>Marca</label>
            <input value={form.vehicle_brand} onChange={(event) => onChange("vehicle_brand", event.target.value)} placeholder="Toyota" />
          </div>
          <div className="field">
            <label>Modelo</label>
            <input value={form.vehicle_model} onChange={(event) => onChange("vehicle_model", event.target.value)} placeholder="Yaris" />
          </div>
          <div className="field">
            <label>Año</label>
            <input inputMode="numeric" value={form.vehicle_year} onChange={(event) => onChange("vehicle_year", event.target.value.replace(/\D/g, ""))} placeholder="2018" />
          </div>
          <div className="field">
            <label>Patente</label>
            <input value={form.plate} onChange={(event) => onChange("plate", event.target.value.toUpperCase())} placeholder="ABCD12" />
          </div>
          <div className="field">
            <label>Servicio</label>
            <select value={form.service_type} onChange={(event) => onChange("service_type", event.target.value)}>
              {serviceOptions.map((service) => <option key={service} value={service}>{service}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Estado inicial</label>
            <select value={form.status} onChange={(event) => onChange("status", event.target.value as LeadStatus)}>
              {workshop.statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Fecha agenda</label>
            <input type="date" value={form.preferred_date} onChange={(event) => onChange("preferred_date", event.target.value)} />
          </div>
          <div className="field">
            <label>Horario</label>
            <input value={form.preferred_time} onChange={(event) => onChange("preferred_time", event.target.value)} placeholder="10:30 / Mañana / Tarde" />
          </div>
          <div className="field">
            <label>Monto estimado</label>
            <input inputMode="numeric" value={form.estimated_amount} onChange={(event) => onChange("estimated_amount", event.target.value.replace(/\D/g, ""))} placeholder="85000" />
          </div>
          <div className="field fullControl">
            <label>Comentario del trabajo</label>
            <textarea value={form.damage_description} onChange={(event) => onChange("damage_description", event.target.value)} placeholder="Daño, síntoma, compromiso o detalle importante..." />
          </div>
          <div className="field fullControl">
            <label>Nota interna</label>
            <textarea value={form.admin_notes} onChange={(event) => onChange("admin_notes", event.target.value)} placeholder="Ej: cliente llegó presencial, pidió entrega viernes, confirmar repuesto..." />
          </div>
        </div>

        <div className="modalActions">
          <button type="button" className="secondaryButton" onClick={onClose}>Cancelar</button>
          <button type="submit" className="primaryButton" disabled={isCreating}>{isCreating ? "Creando..." : "Crear entrada"}</button>
        </div>
      </form>
    </div>
  );
}

function OpportunityCard({
  lead,
  onUpdate,
  onOpenPhoto
}: {
  lead: Opportunity;
  onUpdate: (status: LeadStatus, estimatedAmount?: number | null, adminNotes?: string | null) => void;
  onOpenPhoto: (photo: PhotoSelection) => void;
}) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [amount, setAmount] = useState(lead.estimated_amount ? String(lead.estimated_amount) : "");
  const [notes, setNotes] = useState(lead.admin_notes || "");
  const vehicle = vehicleLabel(lead);
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
          <span className={`statusPill status-${status}`}>{statusLabels[status]}</span>
          <h2>{lead.customer_name}</h2>
          <p>{formatDate(lead.created_at)}</p>
        </div>
        <a className="callButton" href={`tel:${lead.customer_whatsapp.replace(/\s/g, "")}`}>
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
          <strong>{lead.source === "admin_panel" ? "Taller" : lead.source || "Web"}</strong>
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
          <span>{photos.length ? `${photos.length} archivo(s)` : "Sin fotos"}</span>
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
          <div className="noPhotosBox">Pedir fotos antes de enviar presupuesto.</div>
        )}
      </div>

      <div className="leadControls">
        <div className="field compactField">
          <label>Estado</label>
          <select value={status} onChange={(event) => setStatus(event.target.value as LeadStatus)}>
            {workshop.statuses.map((item) => (
              <option key={item} value={item}>{statusLabels[item]}</option>
            ))}
          </select>
        </div>
        <div className="field compactField">
          <label>Monto estimado</label>
          <input inputMode="numeric" placeholder="Ej: 85000" value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))} />
        </div>
        <div className="field compactField fullControl">
          <label>Nota interna</label>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ej: pedir foto con luz natural, confirmar color, cliente quiere sábado..." />
        </div>
      </div>

      <div className="leadActions">
        <button className="primaryButton" type="button" onClick={() => onUpdate(status, amount ? Number(amount) : null, notes)}>
          Guardar avance
        </button>
        <a className="whatsappButton" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Responder por WhatsApp
        </a>
      </div>
    </article>
  );
}
