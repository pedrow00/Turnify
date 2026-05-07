import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Paciente.css";

export default function Paciente() {
  const [busqueda, setBusqueda] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const response = await fetch(`${apiUrl}/pacientes`);
        const data = await response.json();
        setPacientes(data);
      } catch {
        setError("Error al cargar pacientes");
      } finally {
        setLoading(false);
      }
    };

    cargarPacientes();
  }, [apiUrl]);

  useEffect(() => {
    if (!pacienteSeleccionado) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setPacienteSeleccionado(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [pacienteSeleccionado]);

  const pacientesFiltrados = pacientes.filter((pac) => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      return true;
    }

    const nombre = String(pac.nombre ?? "").toLowerCase();
    const apellido = String(pac.apellido ?? "").toLowerCase();
    const dni = String(pac.dni ?? "").toLowerCase();
    const nombreCompleto = `${nombre} ${apellido}`.trim();

    return (
      dni.includes(termino) ||
      nombre.includes(termino) ||
      apellido.includes(termino) ||
      nombreCompleto.includes(termino)
    );
  });

  const formatDireccion = (pac) => {
    const calleNumero = [pac.calle, pac.numero].filter(Boolean).join(" ");
    const pisoDepto = [pac.piso ? `Piso ${pac.piso}` : "", pac.dpto ? `Depto ${pac.dpto}` : ""]
      .filter(Boolean)
      .join(" ");
    const partes = [calleNumero, pisoDepto, pac.codigo_postal ? `CP ${pac.codigo_postal}` : ""]
      .filter(Boolean)
      .join(", ");

    return partes || "Sin dato";
  };

  if (loading) return <p>Cargando pacientes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="paciente-page">
        <div className="paciente-header">
          <div className="header-title">
            <h1>Pacientes</h1>
            <p>Gestiona los pacientes del centro de salud</p>
          </div>
          <Link to="/paciente/nuevo" className="btn-nuevo">
            + Nuevo Paciente
          </Link>
        </div>

        <div className="paciente-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por DNI, nombre o apellido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="paciente-grid">
          {pacientesFiltrados.length > 0 ? (
            pacientesFiltrados.map((pac) => (
              <div key={pac.id} className="paciente-card">
                <div className="paciente-header-card">
                  <div className="paciente-avatar">
                    {`${pac.nombre ?? ""} ${pac.apellido ?? ""}`
                      .trim()
                      .split(" ")
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="paciente-nombre">
                    <h3>
                      {pac.nombre} {pac.apellido}
                    </h3>
                    <span className="dni">DNI: {pac.dni}</span>
                  </div>
                </div>
                <div className="paciente-detalles">
                  <div className="detalle-item">
                    <span className="label">Telefono</span>
                    <span className="value">{pac.telefono || "Sin dato"}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="label">Email</span>
                    <span className="value">{pac.email}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="label">Ubicacion</span>
                    <span className="value">
                      {[pac.localidad_nombre, pac.provincia_nombre].filter(Boolean).join(", ") ||
                        "Sin dato"}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="label">Nacimiento</span>
                    <span className="value">
                      {pac.fecha_nacimiento
                        ? new Date(pac.fecha_nacimiento).toLocaleDateString("es-AR")
                        : "Sin dato"}
                    </span>
                  </div>
                </div>
                <div className="paciente-actions">
                  <button
                    className="btn-ver"
                    type="button"
                    onClick={() => setPacienteSeleccionado(pac)}
                  >
                    Ver
                  </button>
                  <Link to={`/paciente/${pac.id}/editar`} className="btn-editar">
                    Editar
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No se encontraron pacientes</p>
            </div>
          )}
        </div>
      </div>

      {pacienteSeleccionado ? (
        <div
          className="paciente-modal-overlay"
          onClick={() => setPacienteSeleccionado(null)}
          role="presentation"
        >
          <div
            className="paciente-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paciente-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="paciente-modal-close"
              onClick={() => setPacienteSeleccionado(null)}
              aria-label="Cerrar ficha del paciente"
            >
              x
            </button>

            <div className="paciente-modal-header">
              <div className="paciente-modal-avatar">
                {`${pacienteSeleccionado.nombre ?? ""} ${pacienteSeleccionado.apellido ?? ""}`
                  .trim()
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <span className="paciente-modal-badge">Ficha del paciente</span>
                <h2 id="paciente-modal-title">
                  {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                </h2>
                <p>DNI {pacienteSeleccionado.dni}</p>
              </div>
            </div>

            <div className="paciente-modal-grid">
              <div className="paciente-modal-item">
                <span className="label">Nombre</span>
                <span className="value">{pacienteSeleccionado.nombre || "Sin dato"}</span>
              </div>
              <div className="paciente-modal-item">
                <span className="label">Apellido</span>
                <span className="value">{pacienteSeleccionado.apellido || "Sin dato"}</span>
              </div>
              <div className="paciente-modal-item">
                <span className="label">DNI</span>
                <span className="value">{pacienteSeleccionado.dni || "Sin dato"}</span>
              </div>
              <div className="paciente-modal-item">
                <span className="label">Fecha de nacimiento</span>
                <span className="value">
                  {pacienteSeleccionado.fecha_nacimiento
                    ? new Date(pacienteSeleccionado.fecha_nacimiento).toLocaleDateString("es-AR")
                    : "Sin dato"}
                </span>
              </div>
              <div className="paciente-modal-item">
                <span className="label">Email</span>
                <span className="value">{pacienteSeleccionado.email || "Sin dato"}</span>
              </div>
              <div className="paciente-modal-item">
                <span className="label">Telefono</span>
                <span className="value">{pacienteSeleccionado.telefono || "Sin dato"}</span>
              </div>
              <div className="paciente-modal-item">
                <span className="label">Provincia</span>
                <span className="value">
                  {pacienteSeleccionado.provincia_nombre || "Sin dato"}
                </span>
              </div>
              <div className="paciente-modal-item">
                <span className="label">Localidad</span>
                <span className="value">
                  {pacienteSeleccionado.localidad_nombre || "Sin dato"}
                </span>
              </div>
              <div className="paciente-modal-item">
                <span className="label">Direccion</span>
                <span className="value">{formatDireccion(pacienteSeleccionado)}</span>
              </div>
              <div className="paciente-modal-item">
                <span className="label">Codigo postal</span>
                <span className="value">
                  {pacienteSeleccionado.codigo_postal || "Sin dato"}
                </span>
              </div>
              <div className="paciente-modal-item">
                <span className="label">Observaciones</span>
                <span className="value">
                  {pacienteSeleccionado.observaciones || "Sin dato"}
                </span>
              </div>
            </div>

            <div className="paciente-modal-actions">
              <button
                type="button"
                className="btn-editar paciente-modal-button"
                onClick={() => setPacienteSeleccionado(null)}
              >
                Cerrar
              </button>
              <Link
                to={`/paciente/${pacienteSeleccionado.id}/editar`}
                className="btn-ver paciente-modal-button"
              >
                Editar paciente
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
