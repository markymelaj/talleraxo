# Taller Cotizador Demo

Sistema demo para talleres mecánicos, desabolladura, pintura y servicios automotrices afines.

Incluye:

- Landing comercial de servicios.
- Formulario de cotización con datos del cliente, vehículo, servicio y fotos.
- Mensaje automático para WhatsApp.
- Panel interno tipo oportunidades/Kanban.
- SQL listo para Supabase.
- Preparado para GitHub y despliegue en Vercel.

## Stack

- Next.js App Router
- React
- TypeScript
- Supabase Database + Storage
- Vercel

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrir:

```bash
http://localhost:3000
```

Panel demo:

```bash
http://localhost:3000/panel
```

Clave inicial si no configuras `ADMIN_PASSWORD`:

```bash
demo123
```

## Configurar Supabase

1. Crear un proyecto en Supabase.
2. Ir a **SQL Editor**.
3. Pegar y ejecutar el archivo:

```bash
supabase/schema.sql
```

Ese script crea:

- `workshop_leads`
- `lead_photos`
- `lead_status_events`
- `workshop_services`
- `workshop_gallery`
- bucket público `quote-photos`
- políticas mínimas para recibir cotizaciones y fotos

## Variables de entorno

Crear `.env.local` para desarrollo:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
NEXT_PUBLIC_WORKSHOP_WHATSAPP=56900000000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_PASSWORD=cambia-esta-clave
```

En Vercel debes cargar las mismas variables en:

**Project Settings → Environment Variables**

Importante:

- `NEXT_PUBLIC_WORKSHOP_WHATSAPP` debe ir sin `+`, espacios ni guiones.
- `SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse en el frontend. En este proyecto solo se usa en rutas API del servidor.
- Cambiar `ADMIN_PASSWORD` antes de mostrar una demo real a un cliente.

## Subir a GitHub

```bash
git init
git add .
git commit -m "Demo cotizador taller automotriz"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/taller-cotizador-demo.git
git push -u origin main
```

## Desplegar en Vercel

1. Entrar a Vercel.
2. Importar el repositorio desde GitHub.
3. Framework: Next.js.
4. Agregar variables de entorno.
5. Deploy.

## Personalizar para un taller específico

Editar:

```bash
data/workshop.ts
```

Ahí puedes cambiar:

- nombre del taller
- ciudad
- teléfono WhatsApp
- servicios
- textos comerciales
- casos antes/después
- estados del panel

## Flujo comercial recomendado

Primera etapa para vender:

> Cotizador digital + landing de servicios + galería antes/después + WhatsApp ordenado.

Segunda etapa:

> Panel interno para seguimiento de cotizaciones, trabajos agendados y oportunidades perdidas.

Frase de venta:

> Convertimos consultas desordenadas por WhatsApp en cotizaciones claras con fotos, datos del vehículo y seguimiento.

---

## Nota importante para Vercel

Este paquete no debe subirse con `package-lock.json`. Si aparece un lock viejo en GitHub, bórralo antes de desplegar. Vercel debe instalar desde el registry público de npm usando la configuración incluida en `.npmrc` y `vercel.json`.
