import { Link } from "react-router-dom";
import "../styles/Inicio.css";


export default function Inicio() {
  return (
    <div className="inicio-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="badge">Centro de Salud</span>
          <h1>Gestión integral de turnos médicos</h1>
          <p className="hero-subtitle">
            Organizá profesionales, pacientes y turnos en un solo lugar. 
            Simplificá la administración de tu centro de salud con una plataforma moderna y eficiente.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn-primary">Comenzar</Link>
            <Link to="/about" className="btn-secondary">Más información</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="card-float">
            <div className="card-icon">📅</div>
            <div className="card-text">
              <strong>Turnos</strong>
              <span>Gestión rápida</span>
            </div>
          </div>
          <div className="card-float card-2">
            <div className="card-icon">👨‍⚕️</div>
            <div className="card-text">
              <strong>Profesionales</strong>
              <span>Agenda disponible</span>
            </div>
          </div>
          <div className="card-float card-3">
            <div className="card-icon">🧑‍🤝‍🧑</div>
            <div className="card-text">
              <strong>Pacientes</strong>
              <span>Historial completo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>¿Qué podés hacer?</h2>
        <div className="features-grid">
          <Link to="/turnos" className="feature-card">
            <div className="feature-icon">📆</div>
            <h3>Administrar Turnos</h3>
            <p>Creá, modificá y cancelá turnos de forma sencilla.</p>
          </Link>
          <Link to="/pacientes" className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Gestionar Pacientes</h3>
            <p>Registrá y consultá el historial de tus pacientes.</p>
          </Link>
          <Link to="/profesionales" className="feature-card">
            <div className="feature-icon">🩺</div>
            <h3>Control de Profesionales</h3>
            <p>Organizá la agenda de tus profesionales médicos.</p>
          </Link>
          <Link to="/consultorios" className="feature-card">
            <div className="feature-icon">🏥</div>
            <h3>Consultorios</h3>
            <p>Administrá los consultorios disponibles.</p>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Turnify. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
