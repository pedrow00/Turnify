import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { NAV_ITEMS, canAccess } from "../utils/permisos";
import "../styles/Navbar.css";

const ROLE_LABELS = {
  admin: "Administrador",
  socio: "Socio",
  secretaria: "Secretaría",
  profesional: "Profesional",
};

const iniciales = (nombre) =>
  String(nombre || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("") || "U";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const isAuthPage = location.pathname === "/login";

  // Cierra los menus al navegar.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setUserMenuOpen(false);
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

  // Menu del usuario: cierra al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!userMenuOpen) return undefined;

    const handleClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [userMenuOpen]);

  if (isAuthPage) return null;

  const handleLogout = async () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const visibleLinks = NAV_ITEMS.filter(
    (item) => user && canAccess(user.rol, item.permission)
  );

  const nombre = user?.nombre_completo || user?.email || "Usuario";

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
              <div className="navbar-user" ref={userMenuRef}>
                <button
                  type="button"
                  className={`user-menu-toggle ${userMenuOpen ? "is-open" : ""}`}
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-label={`Menú de ${nombre}`}
                >
                  <span className="user-avatar" aria-hidden="true">
                    {iniciales(nombre)}
                  </span>
                  <span className="user-name">{nombre}</span>
                  <span className="user-caret" aria-hidden="true">
                    ▾
                  </span>
                </button>

                {userMenuOpen ? (
                  <div className="user-menu" role="menu">
                    <div className="user-menu-header">
                      <span className="user-menu-name">{nombre}</span>
                      <span className="user-menu-role">
                        {ROLE_LABELS[user.rol] || user.rol}
                      </span>
                    </div>

                    <Link
                      to="/perfil"
                      className="user-menu-item"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Mi perfil
                    </Link>

                    <button
                      type="button"
                      className="user-menu-item peligro"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : null}
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
