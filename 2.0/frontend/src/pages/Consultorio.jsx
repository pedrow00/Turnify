import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Consultorio.css";

export default function Consultorio() {
  const [busqueda, setBusqueda] = useState("");
  const [consultorios, setConsultorios] = useState([]);
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // 🔹 Cargar consultorios
  useEffect(() => {
    const cargarConsultorios = async () => {
      try {
        const response = await fetch(`${apiUrl}/consultorios`);
        const data = await response.json();
        setConsultorios(data);
      } catch {
        setError("Error al cargar consultorios");
      } finally {
        setLoading(false);
      }
    };

    cargarConsultorios();
  }, [apiUrl]);

  // 🔹 Cerrar modal con ESC
  useEffect(() => {
    if (!consultorioSeleccionado) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setConsultorioSeleccionado(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [consultorioSeleccionado]);

  // 🔹 Filtro búsqueda
  const consultoriosFiltrados = consultorios.filter((con) => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) return true;

    const numero = String(con.numero_consultorio ?? "").toLowerCase();
    const piso = String(con.piso ?? "").toLowerCase();
    const ubicacion = String(con.ubicacion ?? "").toLowerCase();

    return (
      numero.includes(termino) ||
      piso.includes(termino) ||
      ubicacion.includes(termino)
    );
  });

  if (loading) return <p>Cargando consultorios...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="consultorio-page">
        <div className="consultorio-header">
          <div className="header-title">
            <h1>Consultorios</h1>
            <p>Gestiona los consultorios del centro de salud</p>
          </div>

          <Link to="/consultorio/nuevo" className="btn-nuevo">
            + Nuevo Consultorio
          </Link>
        </div>

        {/* 🔎 Buscador */}
        <div className="consultorio-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por número, piso o ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* 🔹 Grid */}
        <div className="consultorio-grid">
          {consultoriosFiltrados.length > 0 ? (
            consultoriosFiltrados.map((con) => (
              <div key={con.id} className="consultorio-card">
                <div className="consultorio-header-card">
                  <h3>Consultorio {con.numero_consultorio}</h3>
                  <span className={`estado ${con.activo ? "activo" : "inactivo"}`}>
                    {con.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="consultorio-detalles">
                  <div className="detalle-item">
                    <span className="label">Piso</span>
                    <span className="value">{con.piso ?? "Sin dato"}</span>
                  </div>

                  <div className="detalle-item">
                    <span className="label">Ubicación</span>
                    <span className="value">{con.ubicacion ?? "Sin dato"}</span>
                  </div>
                </div>

                <div className="consultorio-actions">
                  <button
                    className="btn-ver"
                    onClick={() => setConsultorioSeleccionado(con)}
                  >
                    Ver
                  </button>

                  <Link
                    to={`/consultorio/${con.id}/editar`}
                    className="btn-editar"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No se encontraron consultorios</p>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 MODAL */}
    {consultorioSeleccionado && (
    <div
    className="consultorio-modal-overlay"
    onClick={() => setConsultorioSeleccionado(null)}
    >
    <div
        className="consultorio-modal"
        onClick={(e) => e.stopPropagation()}
    >
      {/* BOTÓN CERRAR */}
        <button
        className="consultorio-modal-close"
        onClick={() => setConsultorioSeleccionado(null)}
        >
        x
        </button>

      {/* 🔥 HEADER PRO (LO NUEVO) */}
        <div className="consultorio-modal-header">
        <div className="consultorio-modal-avatar">
            {consultorioSeleccionado.numero_consultorio}
        </div>

        <div>
            <span className="consultorio-modal-badge">
            Consultorio
            </span>

            <h2>
            Consultorio {consultorioSeleccionado.numero_consultorio}
            </h2>

            <p>Piso {consultorioSeleccionado.piso ?? "Sin dato"}</p>
        </div>
        </div>

      {/* 🔹 GRID */}
        <div className="consultorio-modal-grid">
        <div className="consultorio-modal-item">
            <span className="label">Número</span>
            <span className="value">
            {consultorioSeleccionado.numero_consultorio}
            </span>
        </div>

        <div className="consultorio-modal-item">
            <span className="label">Piso</span>
            <span className="value">
            {consultorioSeleccionado.piso ?? "Sin dato"}
            </span>
        </div>

        <div className="consultorio-modal-item">
            <span className="label">Ubicación</span>
            <span className="value">
            {consultorioSeleccionado.ubicacion ?? "Sin dato"}
            </span>
        </div>

        <div className="consultorio-modal-item">
            <span className="label">Estado</span>
            <span className="value">
            {consultorioSeleccionado.activo ? "Activo" : "Inactivo"}
            </span>
        </div>
        </div>

      {/* 🔹 ACTIONS */}
        <div className="consultorio-modal-actions">
        <button
            className="btn-editar consultorio-modal-button"
            onClick={() => setConsultorioSeleccionado(null)}
        >
            Cerrar
        </button>

        <Link
            to={`/consultorio/${consultorioSeleccionado.id}/editar`}
            className="btn-ver consultorio-modal-button"
        >
            Editar
        </Link>
        </div>
    </div>
  </div>
)}
    </>
  );
}