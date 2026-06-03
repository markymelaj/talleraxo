import QuoteForm from "@/components/QuoteForm";
import { workshop } from "@/data/workshop";

const flowSteps = [
  {
    title: "El cliente entra",
    text: "Ve servicios, trabajos tipo y entiende qué datos debe enviar."
  },
  {
    title: "Carga fotos y vehículo",
    text: "Marca, modelo, año, patente opcional, comentario y disponibilidad."
  },
  {
    title: "Llega ordenado",
    text: "El taller recibe WhatsApp armado y la oportunidad queda en el panel."
  },
  {
    title: "Se hace seguimiento",
    text: "Nuevo, falta foto, cotizado, agendado, en taller, listo o perdido."
  }
];

export default function Home() {
  return (
    <main>
      <header className="siteHeader">
        <div className="container nav">
          <a href="#inicio" className="brand" aria-label={workshop.name}>
            <span className="logoMark">TP</span>
            <span>
              <strong>{workshop.name}</strong>
              <small>{workshop.city}</small>
            </span>
          </a>
          <nav className="navLinks" aria-label="Menú principal">
            <a href="#servicios">Servicios</a>
            <a href="#trabajos">Trabajos</a>
            <a href="#cotizar">Cotizar</a>
            <a href="/panel">Panel</a>
          </nav>
          <a className="navCta" href="#cotizar">
            Pedir cotización
          </a>
        </div>
      </header>

      <section id="inicio" className="hero">
        <div className="container heroGrid">
          <div className="heroCopy">
            <span className="eyebrow">Demo para talleres mecánicos y afines</span>
            <h1>{workshop.heroTitle}</h1>
            <p className="heroText">{workshop.heroText}</p>
            <div className="heroActions">
              <a className="primaryButton" href="#cotizar">
                Probar cotizador
              </a>
              <a className="secondaryButton" href="/panel">
                Ver panel admin
              </a>
            </div>

            <div className="trustRow" aria-label="Beneficios principales">
              <div>
                <strong>Fotos</strong>
                <span>Del daño o falla</span>
              </div>
              <div>
                <strong>Vehículo</strong>
                <span>Marca, modelo, año</span>
              </div>
              <div>
                <strong>Seguimiento</strong>
                <span>Estados simples</span>
              </div>
            </div>
          </div>

          <div className="heroVisual" aria-label="Vista previa del sistema">
            <div className="visualToolbar">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="quotePreviewCard">
              <div className="quotePreviewTop">
                <span className="statusPill status-nuevo">Nuevo</span>
                <strong>Camila Rojas</strong>
              </div>
              <div className="miniVehicle">
                <span>Toyota Yaris 2018</span>
                <strong>Pintura por pieza</strong>
              </div>
              <div className="previewPhotoStrip">
                <img src="/demo-fotos/parachoque.svg" alt="Foto de parachoque" />
                <div>
                  <strong>Mensaje listo</strong>
                  <p>Rayón profundo en parachoque trasero derecho. Puede llevarlo mañana en la tarde.</p>
                </div>
              </div>
              <div className="fakeWhatsApp">
                Hola, quiero cotizar reparación para mi vehículo. Marca/modelo: Toyota Yaris · Servicio: Pintura por pieza · Fotos cargadas.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="problemBand">
        <div className="container problemGrid">
          <div>
            <span className="eyebrow darkEyebrow">Problema real</span>
            <h2>El WhatsApp del taller se llena de consultas incompletas.</h2>
          </div>
          <p>
            “¿Cuánto sale?” sin foto, sin modelo, sin año y sin explicación. Esta demo cambia esa entrada: el cliente se guía solo y el equipo responde con mejor información desde el primer contacto.
          </p>
        </div>
      </section>

      <section id="servicios" className="section">
        <div className="container">
          <div className="sectionHeader">
            <span className="eyebrow">Servicios</span>
            <h2>Una página comercial pensada para cotizar, no para decorar.</h2>
            <p>
              Sirve para talleres de pintura, desabolladura, mecánica general, mantención, reparación de choques menores y servicios automotrices especializados.
            </p>
          </div>
          <div className="serviceGrid">
            {workshop.services.map((service, index) => (
              <article className="serviceCard" key={service.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="trabajos" className="section workSection">
        <div className="container">
          <div className="sectionHeader splitHeader">
            <div>
              <span className="eyebrow">Antes / Después</span>
              <h2>La confianza se muestra con resultados.</h2>
            </div>
            <p>
              La galería queda preparada para reemplazar estas piezas de demo por fotos reales del taller. En este rubro, una buena imagen vende más que un texto largo.
            </p>
          </div>
          <div className="galleryGrid">
            {workshop.gallery.map((item, index) => (
              <article className="galleryCard" key={item.before}>
                <img src={["/demo-fotos/parachoque.svg", "/demo-fotos/puerta.svg", "/demo-fotos/motor.svg"][index]} alt={`${item.before} a ${item.after}`} />
                <div className="galleryBody">
                  <strong>{item.before} → {item.after}</strong>
                  <span>{item.detail}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="flowSection">
        <div className="container">
          <div className="sectionHeader">
            <span className="eyebrow">Flujo simple</span>
            <h2>Menos conversación perdida. Más oportunidades listas para cerrar.</h2>
          </div>
          <div className="flowGrid">
            {flowSteps.map((step, index) => (
              <article className="flowCard" key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="adminPreviewSection">
        <div className="container adminPreviewGrid">
          <div>
            <span className="eyebrow">Panel de taller</span>
            <h2>Diseñado para revisarlo desde el celular, entre trabajos.</h2>
            <p>
              El admin ve fotos grandes, datos del vehículo, estado de la oportunidad, monto estimado, nota interna y botón directo para responder por WhatsApp.
            </p>
            <a className="secondaryButton" href="/panel">Entrar al panel demo</a>
          </div>
          <div className="adminPhoneMock">
            <div className="adminPhoneHeader">
              <span>Oportunidades</span>
              <strong>3</strong>
            </div>
            <div className="adminMiniCard">
              <img src="/demo-fotos/puerta.svg" alt="Puerta con abolladura" />
              <div>
                <strong>Mauricio Pérez</strong>
                <span>Hyundai Accent · Falta foto</span>
              </div>
            </div>
            <div className="adminMiniActions">
              <span>Guardar</span>
              <span>WhatsApp</span>
            </div>
          </div>
        </div>
      </section>

      <section id="cotizar" className="quoteSection">
        <div className="container quoteWrap">
          <aside className="quoteAside">
            <span className="eyebrow">Prueba la demo</span>
            <h2>Formulario guiado para que el cliente mande una consulta útil.</h2>
            <p>
              Esta es la parte que más valor vende: convierte consultas vagas en oportunidades con fotos, vehículo, servicio y disponibilidad.
            </p>
            <div className="asideChecklist">
              <span>✓ WhatsApp automático</span>
              <span>✓ Fotos visibles en panel</span>
              <span>✓ Estados de seguimiento</span>
              <span>✓ Preparado para Supabase</span>
            </div>
          </aside>
          <QuoteForm />
        </div>
      </section>

      <footer className="footer">
        <div className="container footerGrid">
          <div>
            <strong>{workshop.name}</strong>
            <span>{workshop.brandLine}</span>
          </div>
          <a href="/panel">Panel demo</a>
        </div>
      </footer>
    </main>
  );
}
