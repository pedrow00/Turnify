import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  if (isAuthPage) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-box-logo">
          <Link to="/" className="navbar-logo">
            <img src="/LogoSinLetras.png" alt="Turnify" className="logo-img" />
            <span className="logo-text">Turnify</span>
          </Link>
        </div>
        <div className="navbar-links-wrapper">
          <div className="navbar-links">
            <Link 
              to="/turno" 
              className={`nav-link ${location.pathname === '/turno' ? 'active' : ''}`}
            >
              Turnos
            </Link>
            <Link 
              to="/paciente" 
              className={`nav-link ${location.pathname === '/paciente' ? 'active' : ''}`}
            >
              Pacientes
            </Link>
            <Link 
              to="/profesional" 
              className={`nav-link ${location.pathname === '/profesional' ? 'active' : ''}`}
            >
              Profesionales
            </Link>
            <Link 
              to="/consultorio" 
              className={`nav-link ${location.pathname === '/consultorio' ? 'active' : ''}`}
            >
              Consultorios
            </Link>
          </div>
        </div>
        <div className="navbar-box-login">
          <Link to="/login" className="btn-login">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </nav>
  );
}