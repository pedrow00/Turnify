import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { NAV_ITEMS, canAccess } from "../utils/permisos";
import "../styles/Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  // Cierra el menu al navegar.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [location.pathname]);

  // Cierra el menu con Escape y al volver a una resolucion de desktop.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const desktopQuery = window.matchMedia("(min-width: 1025px)");
    const handleDesktop = () => {
      if (desktopQuery.matches) setMenuOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    desktopQuery.addEventListener("change", handleDesktop);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      desktopQuery.removeEventListener("change", handleDesktop);
    };
  }, [menuOpen]);

  if (isAuthPage) return null;

  const handleLogout = async () => {
    setMenuOpen(false);
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
          <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
            <img src="/LogoSinLetras.png" alt="Turnify" className="logo-img" />
            <span className="logo-text">Turnify</span>
          </Link>
        </div>

        <button
          type="button"
          className={`navbar-toggle ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Cerrar menu de navegacion" : "Abrir menu de navegacion"}
          aria-expanded={menuOpen}
          aria-controls="navbar-menu"
        >
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
        </button>

        <div id="navbar-menu" className={`navbar-menu ${menuOpen ? "is-open" : ""}`}>
          <div className="navbar-links">
            {visibleLinks.map((item) => {
              const active = item.isActive(location.pathname);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-link ${active ? "active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
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
              <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
