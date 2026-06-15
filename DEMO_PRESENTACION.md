# Guía rápida para mostrar TallerPro a potenciales clientes

## Objetivo de la demo

Mostrar que no es una página decorativa: es una forma de ordenar consultas reales de WhatsApp para talleres mecánicos, pintura, desabolladura, mantención y servicios automotrices.

## Links que se muestran

- Landing pública: `/`
- Panel interno: `/panel`
- Clave demo: `demo123`

## Recorrido recomendado en 4 minutos

1. Abrir la landing y explicar el problema:
   - “Hoy al taller le preguntan cuánto sale, pero muchas veces sin foto, sin modelo, sin año y sin disponibilidad.”
   - “Esto guía al cliente para que mande una consulta útil desde el primer contacto.”

2. Ir al formulario de cotización:
   - Usar “Cargar ejemplo para mostrar la demo”.
   - Explicar que el cliente puede cargar fotos, servicio, vehículo, comentario y fecha ideal.
   - Enviar la cotización.
   - Se abre WhatsApp con el mensaje armado.

3. Entrar al panel:
   - Ruta `/panel`.
   - Clave `demo123`.
   - Mostrar que la consulta cargada aparece en el panel del mismo navegador.
   - Abrir fotos, revisar comentario, cambiar estado, poner monto estimado y guardar.

4. Cierre comercial:
   - “Esto le evita perder consultas, ordenar trabajos y responder más rápido.”
   - “Para el cliente final es simple; para el taller queda un panel de oportunidades.”

## Qué se entrega al cliente real

- Landing adaptada al nombre, rubro, fotos y servicios del taller.
- Formulario guiado de cotización.
- WhatsApp automático con mensaje ordenado.
- Panel interno con clave.
- Estados de seguimiento.
- Visualización de fotos.
- Búsqueda por cliente, patente, modelo o servicio.
- Supabase configurado para guardar oportunidades reales.
- Deploy en Vercel.

## Modo demo sin Supabase

La demo funciona aunque no haya base de datos configurada. En ese caso, las consultas nuevas se guardan en `localStorage`, por eso aparecen en el panel del mismo navegador. Para producción real conviene configurar Supabase con `supabase/schema.sql`.

## Frase simple para enviar la demo

Hola, soy Ignacio de Alto Cauce. Te comparto una demo pensada para talleres: permite que el cliente mande fotos, vehículo, servicio y disponibilidad de forma ordenada, y del lado del taller queda un panel para responder, cotizar o agendar sin perder consultas por WhatsApp.

Demo pública: [pegar link]
Panel: [pegar link]/panel
Clave: demo123
