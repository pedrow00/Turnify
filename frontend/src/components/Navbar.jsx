import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NAV_ITEMS, canAccess } from "../utils/permisos";
import "../styles/Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  if (isAuthPage) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const visibleLinks = NAV_ITEMS.filter(
    (item) => user && canAccess(user.rol, item.permission)
  );

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
            {visibleLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${item.isActive(location.pathname) ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="navbar-box-login">
          {user ? (
            <div className="navbar-user">
              <span className="user-name">
                {user.email} ({user.rol})
              </span>
              <button type="button" className="user-logout" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
