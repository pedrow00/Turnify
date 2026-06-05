import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FEATURE_ITEMS, canAccess } from "../utils/permisos";
import "../styles/Inicio.css";

export default function Inicio() {
  const { user } = useAuth();

  const visibleFeatures = user
    ? FEATURE_ITEMS.filter((item) => canAccess(user.rol, item.permission))
    : FEATURE_ITEMS;

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
          {visibleFeatures.map((item) => (
            <Link key={item.to} to={item.to} className="feature-card">
              <div className="feature-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Turnify. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
