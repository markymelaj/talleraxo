# TallerPro Demo · Cotizador automotriz

Sistema demo para talleres mecánicos, desabolladura, pintura y servicios afines.

Incluye:

- Landing pública profesional, móvil primero.
- Formulario de cotización con datos del cliente, vehículo, servicio, comentario, fecha ideal y fotos.
- Subida de fotos a Supabase Storage cuando las variables están configuradas.
- WhatsApp automático con mensaje ordenado.
- Panel interno `/panel` optimizado para celular.
- Fotos visibles desde el panel de admin con ampliación tipo modal.
- Búsqueda por cliente, WhatsApp, patente, modelo o servicio.
- Filtros por estado: nuevo, falta foto, cotización enviada, agendado, en taller, listo y perdido.
- Monto estimado y nota interna por oportunidad.
- Modo demo funcional sin Supabase. Las consultas cargadas desde la landing aparecen en el panel del mismo navegador usando localStorage.
- Botón para cargar datos de ejemplo y mostrar el flujo en vivo.
- Guía comercial en `DEMO_PRESENTACION.md`.

## Acceso demo

Ruta:

```txt
/panel
```

Clave por defecto:

```txt
demo123
```

## Variables de entorno Vercel

Crear estas variables en Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WORKSHOP_WHATSAPP=569XXXXXXXX
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
ADMIN_PASSWORD=demo123
```

Para una demo sin base de datos, puedes dejar Supabase vacío. El formulario abre WhatsApp, guarda la oportunidad en el navegador y el panel muestra tanto oportunidades demo base como las consultas cargadas durante la presentación.

## Cómo mostrar la demo

1. Abrir la landing.
2. Bajar al formulario o tocar **Probar cotizador**.
3. Usar **Cargar ejemplo para mostrar la demo** o completar una consulta real.
4. Enviar cotización. Se abre WhatsApp con el mensaje armado.
5. Entrar a `/panel` con clave `demo123`.
6. Mostrar la oportunidad, fotos, estados, monto estimado y respuesta por WhatsApp.

Ver guion completo en `DEMO_PRESENTACION.md`.

## Supabase

1. Crear proyecto en Supabase.
2. Ir a SQL Editor.
3. Ejecutar `supabase/schema.sql` completo.
4. Copiar las claves del proyecto a Vercel.
5. Configurar `NEXT_PUBLIC_WORKSHOP_WHATSAPP` con el número del taller sin espacios.

El SQL crea:

- `workshop_leads`
- `lead_photos`
- `lead_status_events`
- `workshop_services`
- `workshop_gallery`
- Bucket público `quote-photos`
- Políticas para que el formulario público pueda insertar oportunidades y subir fotos.

El panel lee y actualiza usando `SUPABASE_SERVICE_ROLE_KEY` desde rutas API de Next.js. No expongas esa clave en el navegador.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir:

```txt
http://localhost:3000
```

Panel:

```txt
http://localhost:3000/panel
```

## Build

```bash
npm run build
```

Este paquete fue validado con:

```txt
Next.js 16.2.7
React 19.2.7
Node 22.x
npm 10.9.2
```

## Importante para Vercel

No subir `node_modules`, `.next` ni `package-lock.json`. El repo ya incluye `.gitignore`, `.npmrc` y `.env.example`.

Este proyecto incluye:

- `.npmrc` con registry público.
- `packageManager: npm@10.9.2`.
- `engines.node: 22.x`.
- `vercel.json` con install command estable.

Si Vercel vuelve a fallar en instalación, hacer redeploy con **Clear Build Cache**.
