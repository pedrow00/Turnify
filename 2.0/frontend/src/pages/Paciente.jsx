import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Paciente.css";

export default function Paciente() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroDni, setFiltroDni] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const response = await fetch(`${apiUrl}/pacientes`);
        const data = await response.json();
        setPacientes(data);
      } catch (err) {
        setError("Error al cargar pacientes");
      } finally {
        setLoading(false);
      }
    };

    cargarPacientes();
  }, [apiUrl]);

  const pacientesFiltrados = pacientes.filter((pac) => {
    const nombreCompleto = `${pac.nombre ?? ""} ${pac.apellido ?? ""}`.trim();
    const coincideNombre = nombreCompleto.toLowerCase().includes(busqueda.toLowerCase());
    const coincideDni = filtroDni === "" || pac.dni.includes(filtroDni);
    return coincideNombre && coincideDni;
  });

  if (loading) return <p>Cargando pacientes...</p>;
  if (error) return <p>{error}</p>;


  return (
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
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="search-box">
          <span className="search-icon">🆔</span>
          <input
            type="text"
            placeholder="Buscar por DNI..."
            value={filtroDni}
            onChange={(e) => setFiltroDni(e.target.value)}
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
                  <h3>{pac.nombre} {pac.apellido}</h3>
                  <span className="dni">DNI: {pac.dni}</span>
                </div>
              </div>
              <div className="paciente-detalles">
                <div className="detalle-item">
                  <span className="label">Teléfono</span>
                  <span className="value">{pac.telefono}</span>
                </div>
                <div className="detalle-item">
                  <span className="label">Email</span>
                  <span className="value">{pac.email}</span>
                </div>
                <div className="detalle-item">
                  <span className="label">Provincia</span>
                  <span className="value">{pac.provincia_nombre || "Sin dato"}</span>
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
                <button className="btn-ver">Ver historial</button>
                <button className="btn-editar">Editar</button>
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
  );
}
