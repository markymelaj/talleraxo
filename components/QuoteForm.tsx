"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { serviceOptions } from "@/data/workshop";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  normalizeFileName,
} from "@/lib/format";
import { saveStoredDemoOpportunity } from "@/lib/demoStore";
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

type PreviewPhoto = {
  name: string;
  url: string;
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
  preferred_time: "",
};

export default function QuoteForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<PreviewPhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState<string | null>(null);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    const nextPreviews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function removeFile(fileName: string) {
    setFiles((current) => current.filter((file) => file.name !== fileName));
  }

  function fillDemoData() {
    setForm({
      customer_name: "Camila Rojas",
      customer_whatsapp: "+56 9 5555 1010",
      vehicle_brand: "Toyota",
      vehicle_model: "Yaris",
      vehicle_year: "2018",
      plate: "ABCD12",
      service_type: "Pintura por pieza",
      damage_description:
        "Rayón profundo en parachoque trasero derecho. Puede llevarlo mañana en la tarde.",
      preferred_date: new Date().toISOString().slice(0, 10),
      preferred_time: "Tarde",
    });
    setNotice(
      "Datos de ejemplo cargados. Ahora puedes enviar y luego entrar al panel para mostrar el seguimiento.",
    );
    setLastWhatsAppUrl(null);
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
          contentType: file.type,
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
        size_bytes: file.size,
      });
    }

    return uploaded;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice(null);
    setError(null);
    setLastWhatsAppUrl(null);

    try {
      const photos = await uploadPhotos();
      const payload: LeadInput = {
        ...form,
        vehicle_year: form.vehicle_year ? Number(form.vehicle_year) : null,
        source: "demo_web",
        photos,
      };

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          "No se pudo guardar la cotización. Revisa la configuración de Supabase.",
        );
      }

      const result = (await response.json()) as {
        mode?: "demo" | "supabase";
        lead?: { id?: string };
      };

      if (result.mode === "demo") {
        saveStoredDemoOpportunity(payload, files, result.lead?.id);
      }

      const photoUrls = photos
        .map((photo) => photo.public_url)
        .filter(Boolean) as string[];
      const message = buildWhatsAppMessage(payload, photoUrls);
      const whatsappUrl = buildWhatsAppUrl(message);

      setLastWhatsAppUrl(whatsappUrl);
      setNotice(
        result.mode === "demo"
          ? "Consulta guardada en esta demo. Ahora puedes abrir WhatsApp y entrar al panel para verla como oportunidad nueva."
          : "Consulta guardada en el panel. Se abrirá WhatsApp con los datos ordenados para enviarlos al taller.",
      );
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setForm(initialState);
      setFiles([]);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Ocurrió un error inesperado.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="quoteForm" onSubmit={handleSubmit}>
      <div className="formIntro">
        <span className="eyebrow">Consulta guiada</span>
        <h2>
          Envía la información que el taller necesita para responder bien.
        </h2>
        <p>
          El objetivo es simple: que el taller reciba una consulta completa, con vehículo, servicio, fotos y disponibilidad.
        </p>
        <button className="demoFillButton" type="button" onClick={fillDemoData}>
          Cargar ejemplo de consulta
        </button>
      </div>

      <div className="formSection">
        <div className="formSectionTitle">
          <span>1</span>
          <div>
            <strong>Cliente</strong>
            <p>Datos mínimos para responder.</p>
          </div>
        </div>
        <div className="formGrid twoCols">
          <div className="field">
            <label htmlFor="customer_name">Nombre</label>
            <input
              id="customer_name"
              required
              value={form.customer_name}
              onChange={(event) =>
                updateField("customer_name", event.target.value)
              }
              placeholder="Ej: Camila Rojas"
            />
          </div>

          <div className="field">
            <label htmlFor="customer_whatsapp">WhatsApp</label>
            <input
              id="customer_whatsapp"
              required
              value={form.customer_whatsapp}
              onChange={(event) =>
                updateField("customer_whatsapp", event.target.value)
              }
              placeholder="Ej: +56 9 1234 5678"
            />
          </div>
        </div>
      </div>

      <div className="formSection">
        <div className="formSectionTitle">
          <span>2</span>
          <div>
            <strong>Vehículo</strong>
            <p>Marca, modelo y datos útiles para revisar.</p>
          </div>
        </div>
        <div className="formGrid vehicleGrid">
          <div className="field">
            <label htmlFor="vehicle_brand">Marca</label>
            <input
              id="vehicle_brand"
              value={form.vehicle_brand}
              onChange={(event) =>
                updateField("vehicle_brand", event.target.value)
              }
              placeholder="Toyota, Hyundai, Nissan..."
            />
          </div>

          <div className="field">
            <label htmlFor="vehicle_model">Modelo</label>
            <input
              id="vehicle_model"
              value={form.vehicle_model}
              onChange={(event) =>
                updateField("vehicle_model", event.target.value)
              }
              placeholder="Yaris, Accent, Kicks..."
            />
          </div>

          <div className="field smallField">
            <label htmlFor="vehicle_year">Año</label>
            <input
              id="vehicle_year"
              inputMode="numeric"
              min="1980"
              max="2035"
              type="number"
              value={form.vehicle_year}
              onChange={(event) =>
                updateField("vehicle_year", event.target.value)
              }
              placeholder="2018"
            />
          </div>

          <div className="field smallField">
            <label htmlFor="plate">Patente</label>
            <input
              id="plate"
              value={form.plate}
              onChange={(event) =>
                updateField("plate", event.target.value.toUpperCase())
              }
              placeholder="ABCD12"
            />
          </div>
        </div>
      </div>

      <div className="formSection">
        <div className="formSectionTitle">
          <span>3</span>
          <div>
            <strong>Trabajo solicitado</strong>
            <p>Servicio, descripción y fotos.</p>
          </div>
        </div>
        <div className="formGrid">
          <div className="field full">
            <label htmlFor="service_type">Servicio requerido</label>
            <select
              id="service_type"
              value={form.service_type}
              onChange={(event) =>
                updateField("service_type", event.target.value)
              }
            >
              {serviceOptions.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          <div className="field full">
            <label htmlFor="damage_description">Comentario o descripción</label>
            <textarea
              id="damage_description"
              value={form.damage_description}
              onChange={(event) =>
                updateField("damage_description", event.target.value)
              }
              placeholder="Ej: golpe en puerta del copiloto, rayón en parachoque, ruido al frenar, mantención antes de viaje..."
            />
          </div>

          <div className="field full">
            <label htmlFor="photos">Fotos del daño</label>
            <label className="fileDrop" htmlFor="photos">
              <input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  setFiles(Array.from(event.target.files || []).slice(0, 6))
                }
              />
              <strong>Subir fotos</strong>
              <span>
                Hasta 6 imágenes. Ideal: una general, una de cerca y otra con
                buena luz.
              </span>
            </label>
            {previews.length > 0 && (
              <div className="previewGrid">
                {previews.map((preview) => (
                  <div className="previewItem" key={preview.url}>
                    <img src={preview.url} alt={preview.name} />
                    <button
                      type="button"
                      onClick={() => removeFile(preview.name)}
                      aria-label={`Quitar ${preview.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="formSection lastSection">
        <div className="formSectionTitle">
          <span>4</span>
          <div>
            <strong>Disponibilidad</strong>
            <p>Ayuda a pasar de consulta a agenda.</p>
          </div>
        </div>
        <div className="formGrid twoCols">
          <div className="field">
            <label htmlFor="preferred_date">Fecha ideal para evaluación</label>
            <input
              id="preferred_date"
              type="date"
              value={form.preferred_date}
              onChange={(event) =>
                updateField("preferred_date", event.target.value)
              }
            />
          </div>

          <div className="field">
            <label htmlFor="preferred_time">Horario ideal</label>
            <select
              id="preferred_time"
              value={form.preferred_time}
              onChange={(event) =>
                updateField("preferred_time", event.target.value)
              }
            >
              <option value="">A coordinar</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Sábado">Sábado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="stickySubmit">
        <div>
          <strong>Listo para enviar</strong>
          <span>
            Se guarda en el panel y se arma un WhatsApp ordenado para responder.
          </span>
        </div>
        <button className="primaryButton" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Preparando..." : "Enviar consulta"}
        </button>
      </div>

      {notice && <div className="notice">{notice}</div>}
      {lastWhatsAppUrl && (
        <div className="successActions">
          <a
            className="whatsappButton"
            href={lastWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir WhatsApp
          </a>
          <a className="secondaryButton" href="/panel">
            Ver en panel demo
          </a>
        </div>
      )}
      {error && <div className="notice errorNotice">{error}</div>}
    </form>
  );
}
