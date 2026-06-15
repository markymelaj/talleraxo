import type { LeadInput, LeadPhoto, Opportunity } from "@/lib/types";

const DEMO_STORAGE_KEY = "tallerpro-demo-local-opportunities";
const MAX_LOCAL_LEADS = 12;

type LocalFileInfo = {
  name: string;
  type?: string;
  size?: number;
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function safeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function pickDemoPhoto(serviceType: string, index = 0) {
  const value = serviceType.toLowerCase();
  if (value.includes("desaboll")) return "/demo-fotos/puerta.svg";
  if (value.includes("mec") || value.includes("mant"))
    return "/demo-fotos/motor.svg";
  if (
    value.includes("pint") ||
    value.includes("choque") ||
    value.includes("repar")
  )
    return "/demo-fotos/parachoque.svg";
  return [
    "/demo-fotos/parachoque.svg",
    "/demo-fotos/puerta.svg",
    "/demo-fotos/motor.svg",
  ][index % 3];
}

function normalizeLocalPhoto(
  file: LocalFileInfo,
  serviceType: string,
  index: number,
): LeadPhoto {
  return {
    public_url: pickDemoPhoto(serviceType, index),
    file_name: file.name || `foto-demo-${index + 1}.jpg`,
    mime_type: file.type || "image/demo",
    size_bytes: file.size || null,
  };
}

function parseOpportunities(value: string | null): Opportunity[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.customer_name === "string",
    );
  } catch {
    return [];
  }
}

export function getStoredDemoOpportunities(): Opportunity[] {
  if (!canUseStorage()) return [];
  return parseOpportunities(window.localStorage.getItem(DEMO_STORAGE_KEY));
}

export function isStoredDemoOpportunity(id: string) {
  return id.startsWith("demo-local-");
}

export function saveStoredDemoOpportunity(
  input: LeadInput,
  files: LocalFileInfo[] = [],
  apiId?: string,
): Opportunity {
  const now = new Date().toISOString();
  const localPhotos = input.photos?.length
    ? input.photos
    : files
        .slice(0, 3)
        .map((file, index) =>
          normalizeLocalPhoto(file, input.service_type, index),
        );

  const opportunity: Opportunity = {
    ...input,
    id:
      apiId && apiId.startsWith("demo-")
        ? `demo-local-${safeId()}`
        : apiId || `demo-local-${safeId()}`,
    created_at: now,
    updated_at: now,
    status: "nuevo",
    estimated_amount: null,
    admin_notes: localPhotos.length ? "Ingresado desde el formulario en modo demo local." : "Ingresado desde ejemplo demo con foto de referencia.",
    lead_photos: localPhotos.length
      ? localPhotos
      : [
          {
            public_url: pickDemoPhoto(input.service_type),
            file_name: "foto-referencia-demo.svg",
            mime_type: "image/svg+xml",
            size_bytes: null,
          },
        ],
  };

  if (!canUseStorage()) return opportunity;

  const current = getStoredDemoOpportunities().filter(
    (lead) => lead.id !== opportunity.id,
  );
  window.localStorage.setItem(
    DEMO_STORAGE_KEY,
    JSON.stringify([opportunity, ...current].slice(0, MAX_LOCAL_LEADS)),
  );
  return opportunity;
}

export function updateStoredDemoOpportunity(
  id: string,
  updates: Pick<Opportunity, "status"> &
    Pick<Partial<Opportunity>, "estimated_amount" | "admin_notes">,
) {
  if (!canUseStorage()) return;

  const current = getStoredDemoOpportunities();
  const next = current.map((lead) =>
    lead.id === id
      ? {
          ...lead,
          ...updates,
          updated_at: new Date().toISOString(),
        }
      : lead,
  );

  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
}

export function clearStoredDemoOpportunities() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DEMO_STORAGE_KEY);
}
