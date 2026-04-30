import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Profesional.css";

export default function Profesional() {
  const [busqueda, setBusqueda] = useState("");
  const [profesionales, setProfesionales] = useState([]);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const cargarProfesionales = async () => {
      try {
        const response = await fetch(`${apiUrl}/profesionales`);
        const data = await response.json();
        setProfesionales(data);
      } catch (err) {
        setError("Error al cargar profesionales");
      } finally {
        setLoading(false);
      }
    };

    cargarProfesionales();
  }, [apiUrl]);

  useEffect(() => {
    if (!profesionalSeleccionado) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfesionalSeleccionado(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [profesionalSeleccionado]);

  const profesionalesFiltrados = profesionales.filter((prof) => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      return true;
    }

    const nombre = String(prof.nombre ?? "").toLowerCase();
    const apellido = String(prof.apellido ?? "").toLowerCase();
    const cuil = String(prof.cuil ?? "").toLowerCase();
    const nombreCompleto = `${nombre} ${apellido}`.trim();

    return (
      nombre.includes(termino) ||
      apellido.includes(termino) ||
      cuil.includes(termino) ||
      nombreCompleto.includes(termino)
    );
  });

  if (loading) return <p>Cargando profesionales...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="profesional-page">
        <div className="profesional-header">
          <div className="header-title">
            <h1>Profesionales</h1>
            <p>Gestiona los profesionales del centro de salud</p>
          </div>
          <Link to="/profesional/nuevo" className="btn-nuevo">
            + Nuevo Profesional
          </Link>
        </div>

        <div className="profesional-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por CUIL, nombre o apellido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="profesional-grid">
          {profesionalesFiltrados.length > 0 ? (
            profesionalesFiltrados.map((prof) => (
              <div key={prof.id} className="profesional-card">
                <div className="profesional-header-card">
                  <div className="profesional-avatar">
                    {`${prof.nombre ?? ""} ${prof.apellido ?? ""}`
                      .trim()
                      .split(" ")
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="profesional-nombre">
                    <h3>
                      {prof.nombre} {prof.apellido}
                    </h3>
                    <span className="profesional-code">CUIL: {prof.cuil || "Sin dato"}</span>
                  </div>
                </div>

                <div className="profesional-detalles">
                  <div className="detalle-item">
                    <span className="label">Telefono</span>
                    <span className="value">{prof.telefono || "Sin dato"}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="label">Email</span>
                    <span className="value">{prof.email || "Sin dato"}</span>
                  </div>
                </div>

                <div className="profesional-actions">
                  <button
                    type="button"
                    className="btn-ver"
                    onClick={() => setProfesionalSeleccionado(prof)}
                  >
                    Ver
                  </button>
                  <Link to={`/profesional/${prof.id}/editar`} className="btn-editar">
                    Editar
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No se encontraron profesionales</p>
            </div>
          )}
        </div>
      </div>

      {profesionalSeleccionado ? (
        <div
          className="profesional-modal-overlay"
          onClick={() => setProfesionalSeleccionado(null)}
          role="presentation"
        >
          <div
            className="profesional-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profesional-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="profesional-modal-close"
              onClick={() => setProfesionalSeleccionado(null)}
              aria-label="Cerrar ficha del profesional"
            >
              x
            </button>

            <div className="profesional-modal-header">
              <div className="profesional-modal-avatar">
                {`${profesionalSeleccionado.nombre ?? ""} ${profesionalSeleccionado.apellido ?? ""}`
                  .trim()
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <span className="profesional-modal-badge">Ficha del profesional</span>
                <h2 id="profesional-modal-title">
                  {profesionalSeleccionado.nombre} {profesionalSeleccionado.apellido}
                </h2>
                <p>{profesionalSeleccionado.cuil || "Sin CUIL registrado"}</p>
              </div>
            </div>

            <div className="profesional-modal-grid">
              <div className="profesional-modal-item">
                <span className="label">Nombre</span>
                <span className="value">{profesionalSeleccionado.nombre || "Sin dato"}</span>
              </div>
              <div className="profesional-modal-item">
                <span className="label">Apellido</span>
                <span className="value">{profesionalSeleccionado.apellido || "Sin dato"}</span>
              </div>
              <div className="profesional-modal-item">
                <span className="label">CUIL</span>
                <span className="value">{profesionalSeleccionado.cuil || "Sin dato"}</span>
              </div>
              <div className="profesional-modal-item">
                <span className="label">Email</span>
                <span className="value">{profesionalSeleccionado.email || "Sin dato"}</span>
              </div>
              <div className="profesional-modal-item">
                <span className="label">Telefono</span>
                <span className="value">{profesionalSeleccionado.telefono || "Sin dato"}</span>
              </div>
            </div>

            <div className="profesional-modal-actions">
              <button
                type="button"
                className="btn-editar profesional-modal-button"
                onClick={() => setProfesionalSeleccionado(null)}
              >
                Cerrar
              </button>
              <Link
                to={`/profesional/${profesionalSeleccionado.id}/editar`}
                className="btn-ver profesional-modal-button"
              >
                Editar profesional
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
