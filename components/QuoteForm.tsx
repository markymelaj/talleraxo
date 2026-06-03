"use client";

import { FormEvent, useMemo, useState } from "react";
import { serviceOptions } from "@/data/workshop";
import { buildWhatsAppMessage, buildWhatsAppUrl, normalizeFileName } from "@/lib/format";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import type { LeadInput, LeadPhoto } from "@/lib/types";

type FormState = {
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
};

const initialState: FormState = {
  customer_name: "",
  customer_whatsapp: "",
  vehicle_brand: "",
  vehicle_model: "",
  vehicle_year: "",
  plate: "",
  service_type: "Desabolladura",
  damage_description: "",
  preferred_date: "",
  preferred_time: ""
};

export default function QuoteForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function uploadPhotos(): Promise<LeadPhoto[]> {
    if (!supabase || files.length === 0) return [];

    const uploaded: LeadPhoto[] = [];

    for (const file of files.slice(0, 6)) {
      const path = `leads/${Date.now()}-${crypto.randomUUID()}-${normalizeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("quote-photos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.warn("No se pudo subir una foto", uploadError.message);
        continue;
      }

      const { data } = supabase.storage.from("quote-photos").getPublicUrl(path);
      uploaded.push({
        storage_path: path,
        public_url: data.publicUrl,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size
      });
    }

    return uploaded;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice(null);
    setError(null);

    try {
      const photos = await uploadPhotos();
      const payload: LeadInput = {
        ...form,
        vehicle_year: form.vehicle_year ? Number(form.vehicle_year) : null,
        source: "demo_web",
        photos
      };

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar la cotización. Revisa la configuración de Supabase.");
      }

      const photoUrls = photos.map((photo) => photo.public_url).filter(Boolean) as string[];
      const message = buildWhatsAppMessage(payload, photoUrls);
      const whatsappUrl = buildWhatsAppUrl(message);

      setNotice("Consulta creada. Se abrirá WhatsApp con el mensaje listo para enviar.");
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setForm(initialState);
      setFiles([]);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Ocurrió un error inesperado.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="formPanel" onSubmit={handleSubmit}>
      <div className="formGrid">
        <div className="field">
          <label htmlFor="customer_name">Nombre</label>
          <input
            id="customer_name"
            required
            value={form.customer_name}
            onChange={(event) => updateField("customer_name", event.target.value)}
            placeholder="Ej: Camila Rojas"
          />
        </div>

        <div className="field">
          <label htmlFor="customer_whatsapp">WhatsApp</label>
          <input
            id="customer_whatsapp"
            required
            value={form.customer_whatsapp}
            onChange={(event) => updateField("customer_whatsapp", event.target.value)}
            placeholder="Ej: +56 9 1234 5678"
          />
        </div>

        <div className="field">
          <label htmlFor="vehicle_brand">Marca</label>
          <input
            id="vehicle_brand"
            value={form.vehicle_brand}
            onChange={(event) => updateField("vehicle_brand", event.target.value)}
            placeholder="Toyota, Hyundai, Nissan..."
          />
        </div>

        <div className="field">
          <label htmlFor="vehicle_model">Modelo</label>
          <input
            id="vehicle_model"
            value={form.vehicle_model}
            onChange={(event) => updateField("vehicle_model", event.target.value)}
            placeholder="Yaris, Accent, Kicks..."
          />
        </div>

        <div className="field">
          <label htmlFor="vehicle_year">Año</label>
          <input
            id="vehicle_year"
            inputMode="numeric"
            min="1980"
            max="2035"
            type="number"
            value={form.vehicle_year}
            onChange={(event) => updateField("vehicle_year", event.target.value)}
            placeholder="2018"
          />
        </div>

        <div className="field">
          <label htmlFor="plate">Patente opcional</label>
          <input
            id="plate"
            value={form.plate}
            onChange={(event) => updateField("plate", event.target.value.toUpperCase())}
            placeholder="ABCD12"
          />
        </div>

        <div className="field full">
          <label htmlFor="service_type">Servicio requerido</label>
          <select
            id="service_type"
            value={form.service_type}
            onChange={(event) => updateField("service_type", event.target.value)}
          >
            {serviceOptions.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        <div className="field full">
          <label htmlFor="damage_description">Comentario o descripción del daño</label>
          <textarea
            id="damage_description"
            value={form.damage_description}
            onChange={(event) => updateField("damage_description", event.target.value)}
            placeholder="Describe dónde está el daño, si fue choque, rayón, abolladura, ruido, falla o mantención requerida."
          />
        </div>

        <div className="field">
          <label htmlFor="preferred_date">Fecha ideal para evaluación</label>
          <input
            id="preferred_date"
            type="date"
            value={form.preferred_date}
            onChange={(event) => updateField("preferred_date", event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="preferred_time">Horario ideal</label>
          <select
            id="preferred_time"
            value={form.preferred_time}
            onChange={(event) => updateField("preferred_time", event.target.value)}
          >
            <option value="">A coordinar</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Sábado">Sábado</option>
          </select>
        </div>

        <div className="field full">
          <label htmlFor="photos">Fotos del daño</label>
          <div className="fileBox">
            <input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 6))}
            />
            <div className="fileMeta">
              {files.length > 0
                ? `${files.length} foto(s) seleccionada(s). Máximo recomendado: 6.`
                : "Puedes seleccionar varias fotos. Si Supabase Storage no está configurado, el mensaje pedirá adjuntarlas en WhatsApp."}
            </div>
          </div>
        </div>
      </div>

      <div className="formFooter">
        <button className="primaryButton" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Preparando consulta..." : "Enviar por WhatsApp"}
        </button>
        <span className="smallText">También queda lista para seguimiento interno cuando Supabase está activo.</span>
      </div>

      {notice && <div className="notice">{notice}</div>}
      {error && <div className="notice errorNotice">{error}</div>}
    </form>
  );
}
