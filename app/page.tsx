import QuoteForm from "@/components/QuoteForm";
import { workshop } from "@/data/workshop";

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <div className="container nav">
          <a href="#inicio" className="brand" aria-label={workshop.name}>
            <span className="logoMark">TA</span>
            <span>{workshop.name}</span>
          </a>
          <nav className="navLinks" aria-label="Menú principal">
            <a href="#servicios">Servicios</a>
            <a href="#trabajos">Antes/después</a>
            <a href="#cotizar">Cotizar</a>
            <a href="/panel">Panel demo</a>
          </nav>
          <a className="navCta" href="#cotizar">
            Pedir cotización
          </a>
        </div>
      </header>

      <section id="inicio" className="hero">
        <div className="container heroGrid">
          <div>
            <p className="kicker">Demo para taller automotriz</p>
            <h1>{workshop.heroTitle}</h1>
            <p className="heroText">{workshop.heroText}</p>
            <div className="heroActions">
              <a className="primaryButton" href="#cotizar">
                Probar cotizador
              </a>
              <a className="secondaryButton" href="/panel">
                Ver panel interno
              </a>
            </div>
            <div className="metricRow" aria-label="Beneficios principales">
              <div className="metric">
                <strong>1</strong>
                <span>Formulario claro antes del WhatsApp</span>
              </div>
              <div className="metric">
                <strong>3</strong>
                <span>Fotos, vehículo y servicio en una consulta</span>
              </div>
              <div className="metric">
                <strong>7</strong>
                <span>Estados para seguir cada oportunidad</span>
              </div>
            </div>
          </div>

          <div className="phonePreview" aria-label="Vista previa de consulta por WhatsApp">
            <div className="phoneScreen">
              <div className="messageHeader">
                <span>WhatsApp taller</span>
                <span>Ahora</span>
              </div>
              <div className="messageBubble">
                Hola, quiero cotizar reparación para mi vehículo.{"\n\n"}
                Nombre: Camila Rojas{"\n"}
                Marca/modelo: Toyota Yaris{"\n"}
                Año: 2018{"\n"}
                Servicio requerido: Pintura por pieza{"\n"}
                Daño / comentario: rayón profundo en parachoque trasero derecho.{"\n"}
                Disponibilidad: mañana en la tarde.
              </div>
              <div className="photoStack">
                <div className="photoBox">Foto 1</div>
                <div className="photoBox">Foto 2</div>
                <div className="photoBox">Foto 3</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="section">
        <div className="container">
          <div className="sectionHeader">
            <h2>Servicios claros para cotizar rápido.</h2>
            <p>
              La página no vende una web genérica: ordena consultas reales para talleres que reciben preguntas por Instagram, llamadas o WhatsApp.
            </p>
          </div>
          <div className="cardGrid">
            {workshop.services.map((service) => (
              <article className="card" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="trabajos" className="section">
        <div className="container">
          <div className="sectionHeader">
            <h2>Antes/después para vender confianza.</h2>
            <p>
              En pintura y desabolladura el cliente compra resultado. Esta sección muestra trabajos de forma visual y deja preparado el sistema para cargar casos reales.
            </p>
          </div>
          <div className="galleryGrid">
            {workshop.gallery.map((item) => (
              <article className="galleryCard" key={item.before}>
                <div className="beforeAfterVisual">
                  <div className="visualHalf before">Antes</div>
                  <div className="visualHalf after">Después</div>
                </div>
                <div className="galleryBody">
                  <strong>{item.before} → {item.after}</strong>
                  <br />
                  <span>{item.detail}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cotizar" className="quoteSection">
        <div className="container quoteWrap">
          <aside className="quoteAside">
            <h2>Cotización con datos útiles desde el primer mensaje.</h2>
            <p>
              El cliente completa lo mínimo necesario y el taller recibe una oportunidad ordenada. Si Supabase está configurado, queda guardada en el panel.
            </p>
            <div className="stepList">
              <div className="step">
                <span className="stepNumber">1</span>
                <span>Datos del cliente y WhatsApp.</span>
              </div>
              <div className="step">
                <span className="stepNumber">2</span>
                <span>Vehículo, servicio requerido y fotos del daño.</span>
              </div>
              <div className="step">
                <span className="stepNumber">3</span>
                <span>Mensaje automático para responder sin perder tiempo.</span>
              </div>
            </div>
          </aside>
          <QuoteForm />
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          {workshop.name} · {workshop.city} · Demo comercial para talleres mecánicos y afines.
        </div>
      </footer>
    </main>
  );
}
