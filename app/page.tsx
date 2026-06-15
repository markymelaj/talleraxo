import QuoteForm from "@/components/QuoteForm";
import { workshop } from "@/data/workshop";

const flowSteps = [
  {
    title: "El cliente entiende qué enviar",
    text: "No parte con un mensaje suelto. El sistema lo guía con datos simples y fotos."
  },
  {
    title: "La consulta llega completa",
    text: "Nombre, WhatsApp, vehículo, servicio, comentario, disponibilidad y fotos en un solo registro."
  },
  {
    title: "El taller decide el próximo paso",
    text: "Responder, pedir una foto, estimar precio, agendar revisión o marcar como perdido."
  },
  {
    title: "Nada queda perdido en el chat",
    text: "Cada oportunidad tiene estado, nota interna, monto estimado y botón directo a WhatsApp."
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
            <a href="#trabajos">Resultados</a>
            <a href="#cotizar">Cotizar</a>
            <a href="/panel">Panel</a>
          </nav>
          <a className="navCta" href="#cotizar">
            Probar cotizador
          </a>
        </div>
      </header>

      <section id="inicio" className="hero">
        <div className="container heroGrid">
          <div className="heroCopy">
            <span className="eyebrow">Sistema para talleres que cotizan por WhatsApp</span>
            <h1>{workshop.heroTitle}</h1>
            <p className="heroText">{workshop.heroText}</p>
            <div className="heroActions">
              <a className="primaryButton" href="#cotizar">
                Probar como cliente
              </a>
              <a className="secondaryButton" href="/panel">
                Ver panel del taller · clave demo123
              </a>
            </div>

            <div className="trustRow" aria-label="Beneficios principales">
              <div>
                <strong>Consulta completa</strong>
                <span>Datos útiles desde el inicio</span>
              </div>
              <div>
                <strong>Fotos visibles</strong>
                <span>Sin perderlas en el chat</span>
              </div>
              <div>
                <strong>Seguimiento</strong>
                <span>Estados simples para cerrar</span>
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
                  <strong>Mensaje listo para responder</strong>
                  <p>Rayón profundo en parachoque trasero derecho. Puede llevarlo mañana en la tarde.</p>
                </div>
              </div>
              <div className="fakeWhatsApp">
                Consulta ordenada: vehículo, servicio, comentario, disponibilidad y fotos. El taller responde sin volver a empezar la conversación.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="problemBand">
        <div className="container problemGrid">
          <div>
            <span className="eyebrow darkEyebrow">Problema real</span>
            <h2>No reemplaza WhatsApp. Lo ordena para vender mejor.</h2>
          </div>
          <p>
            Muchos talleres pierden tiempo con consultas incompletas: “cuánto sale”, sin foto, sin modelo, sin año y sin horario. Este sistema hace que el cliente entregue la información mínima antes de hablar con el taller.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sectionHeader">
            <span className="eyebrow">Para el dueño del taller</span>
            <h2>La diferencia está en ordenar la entrada de trabajo.</h2>
            <p>
              Un sitio común muestra información. Este sistema captura oportunidades, las ordena y deja un camino claro para responder, cotizar y agendar.
            </p>
          </div>
          <div className="serviceGrid">
            {workshop.ownerBenefits.map((benefit, index) => (
              <article className="serviceCard" key={benefit.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="servicios" className="section workSection">
        <div className="container">
          <div className="sectionHeader">
            <span className="eyebrow">Servicios adaptables</span>
            <h2>Sirve para pintura, desabolladura, mecánica y mantención.</h2>
            <p>
              La demo está preparada para un taller general, pero puede ajustarse a un negocio específico: pintura, detailing, mecánica, diagnóstico, neumáticos o reparación de choques menores.
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

      <section id="trabajos" className="section">
        <div className="container">
          <div className="sectionHeader splitHeader">
            <div>
              <span className="eyebrow">Confianza visual</span>
              <h2>Las fotos ayudan a vender antes de la primera visita.</h2>
            </div>
            <p>
              En producción se reemplazan estas imágenes por trabajos reales del taller. En rubros automotrices, ver daños, terminaciones y casos resueltos ayuda a que el cliente avance con menos dudas.
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
            <span className="eyebrow">Flujo de venta</span>
            <h2>Del “hola, cuánto sale” a una oportunidad trabajable.</h2>
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
            <span className="eyebrow">Panel del taller</span>
            <h2>Una bandeja simple para revisar oportunidades desde el celular.</h2>
            <p>
              El admin ve fotos, datos del vehículo, estado, disponibilidad, monto estimado, nota interna y botón directo para responder por WhatsApp. Es el punto donde el taller deja de depender de memoria y chats sueltos.
            </p>
            <a className="secondaryButton" href="/panel">Entrar al panel demo · clave demo123</a>
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
                <span>Hyundai Accent · Falta foto · Responder hoy</span>
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
            <span className="eyebrow">Probar como cliente</span>
            <h2>Completa una consulta y después mírala desde el panel.</h2>
            <p>
              Este recorrido es lo que debe ver el cliente potencial: la persona consulta fácil, el taller recibe ordenado y el seguimiento queda centralizado.
            </p>
            <div className="asideChecklist">
              <span>✓ WhatsApp automático</span>
              <span>✓ Fotos visibles en panel</span>
              <span>✓ Estados de seguimiento</span>
              <span>✓ Supabase para oportunidades reales</span>
              <span>✓ Modo demo para presentación comercial</span>
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
