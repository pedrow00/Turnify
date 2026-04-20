import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Profesional.css";

const profesionalesData = [
  { id: 1, nombre: "Dr. Juan Pérez", especialidad: "Cardiología", telefono: "351-123-4567", email: "juan.perez@turnify.com", foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan" },
  { id: 2, nombre: "Dra. María González", especialidad: "Pediatría", telefono: "351-234-5678", email: "maria.gonzalez@turnify.com", foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" },
  { id: 3, nombre: "Dr. Carlos López", especialidad: "Dermatología", telefono: "351-345-6789", email: "carlos.lopez@turnify.com", foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" },
  { id: 4, nombre: "Dra. Ana Rodríguez", especialidad: "Ginecología", telefono: "351-456-7890", email: "ana.rodriguez@turnify.com", foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" },
  { id: 5, nombre: "Dr. Pedro Martínez", especialidad: "Cardiología", telefono: "351-567-8901", email: "pedro.martinez@turnify.com", foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro" },
  { id: 6, nombre: "Dra. Laura Sánchez", especialidad: "Oftalmología", telefono: "351-678-9012", email: "laura.sanchez@turnify.com", foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laura" },
];

const especialidades = ["Todas", "Cardiología", "Pediatría", "Dermatología", "Ginecología", "Oftalmología", "Neurología", "Ortopedia"];

export default function Profesional() {
  const [busqueda, setBusqueda] = useState("");
  const [especialidadFilter, setEspecialidadFilter] = useState("Todas");

  const profesionalesFiltrados = profesionalesData.filter((prof) => {
    const coincideNombre = prof.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEspecialidad = especialidadFilter === "Todas" || prof.especialidad === especialidadFilter;
    return coincideNombre && coincideEspecialidad;
  });

  return (
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
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select
            value={especialidadFilter}
            onChange={(e) => setEspecialidadFilter(e.target.value)}
          >
            {especialidades.map((esp) => (
              <option key={esp} value={esp}>
                {esp === "Todas" ? "Todas las especialidades" : esp}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="profesional-grid">
        {profesionalesFiltrados.length > 0 ? (
          profesionalesFiltrados.map((prof) => (
            <div key={prof.id} className="profesional-card">
              <div className="profesional-header-card">
                <div className="profesional-avatar">
                  <img src={prof.foto} alt={prof.nombre} />
                </div>
                <div className="profesional-nombre">
                  <h3>{prof.nombre}</h3>
                  <span className="especialidad-badge">{prof.especialidad}</span>
                </div>
              </div>
              <div className="profesional-detalles">
                <div className="detalle-item">
                  <span className="label">Teléfono</span>
                  <span className="value">{prof.telefono}</span>
                </div>
                <div className="detalle-item">
                  <span className="label">Email</span>
                  <span className="value">{prof.email}</span>
                </div>
              </div>
              <div className="profesional-actions">
                <button className="btn-ver">Ver detalle</button>
                <button className="btn-editar">Editar</button>
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
  );
}