-- Sistema demo para talleres automotrices
-- Ejecutar en Supabase SQL Editor antes de desplegar en Vercel.

create extension if not exists pgcrypto;

-- Tabla principal: oportunidades/cotizaciones recibidas desde la landing.
create table if not exists public.workshop_leads (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_whatsapp text not null,
  vehicle_brand text,
  vehicle_model text,
  vehicle_year integer,
  plate text,
  service_type text not null,
  damage_description text,
  preferred_date date,
  preferred_time text,
  source text default 'demo_web',
  status text not null default 'nuevo' check (
    status in (
      'nuevo',
      'falta_foto',
      'cotizacion_enviada',
      'agendado',
      'en_taller',
      'listo',
      'perdido'
    )
  ),
  estimated_amount integer,
  admin_notes text,
  contacted_at timestamptz,
  last_status_change_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_photos (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.workshop_leads(id) on delete cascade,
  storage_path text,
  public_url text,
  file_name text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_status_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.workshop_leads(id) on delete cascade,
  old_status text,
  new_status text not null,
  note text,
  created_at timestamptz not null default now()
);

-- Tablas opcionales para futura administración de contenido.
create table if not exists public.workshop_services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.workshop_gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  before_label text default 'Antes',
  after_label text default 'Después',
  detail text,
  before_image_url text,
  after_image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_workshop_leads_updated_at on public.workshop_leads;
create trigger set_workshop_leads_updated_at
before update on public.workshop_leads
for each row execute function public.set_updated_at();

create index if not exists workshop_leads_status_idx on public.workshop_leads(status);
create index if not exists workshop_leads_created_at_idx on public.workshop_leads(created_at desc);
create index if not exists workshop_leads_customer_whatsapp_idx on public.workshop_leads(customer_whatsapp);
create index if not exists lead_photos_lead_id_idx on public.lead_photos(lead_id);

-- Seguridad: el formulario público puede insertar, pero no leer todo el panel.
alter table public.workshop_leads enable row level security;
alter table public.lead_photos enable row level security;
alter table public.lead_status_events enable row level security;
alter table public.workshop_services enable row level security;
alter table public.workshop_gallery enable row level security;

drop policy if exists "Public can create workshop leads" on public.workshop_leads;
create policy "Public can create workshop leads"
on public.workshop_leads
for insert
to anon, authenticated
with check (
  customer_name is not null
  and customer_whatsapp is not null
  and service_type is not null
);

drop policy if exists "Public can create lead photos" on public.lead_photos;
create policy "Public can create lead photos"
on public.lead_photos
for insert
to anon, authenticated
with check (true);

-- El panel usa SUPABASE_SERVICE_ROLE_KEY desde rutas API de Next.js, por eso no se crea policy de lectura pública.

-- Bucket público para fotos de cotización. Ajustar tamaño si el cliente necesita imágenes más pesadas.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-photos',
  'quote-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can upload quote photos" on storage.objects;
create policy "Anyone can upload quote photos"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'quote-photos');

drop policy if exists "Anyone can read quote photos" on storage.objects;
create policy "Anyone can read quote photos"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'quote-photos');

-- Contenido inicial opcional.
insert into public.workshop_services (title, description, sort_order)
values
  ('Desabolladura', 'Recepción de fotos del daño, ubicación de la pieza y comentario del cliente.', 1),
  ('Pintura por pieza', 'Cotización preliminar según panel afectado, color y estado del vehículo.', 2),
  ('Pintura general', 'Solicitud ordenada para evaluación de trabajos completos o restauraciones.', 3),
  ('Mecánica general', 'Ingreso de síntomas, historial breve y disponibilidad para revisión.', 4),
  ('Choques menores', 'Registro inicial para priorizar reparaciones rápidas y trabajos de alta urgencia.', 5),
  ('Mantención preventiva', 'Agenda de revisión, kilometraje y necesidad principal del cliente.', 6)
on conflict do nothing;
