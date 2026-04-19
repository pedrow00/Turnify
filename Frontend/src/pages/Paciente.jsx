import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Paciente.css";

const pacientesData = [
  { id: 1, nombre: "Juan García", dni: "35.123.456", telefono: "351-123-4567", email: "juan.garcia@email.com", obraSocial: "OSDE", fechaNacimiento: "15/03/1985" },
  { id: 2, nombre: "María López", dni: "27.654.321", telefono: "351-234-5678", email: "maria.lopez@email.com", obraSocial: "Swiss Medical", fechaNacimiento: "22/07/1990" },
  { id: 3, nombre: "Carlos Rodríguez", dni: "40.987.654", telefono: "351-345-6789", email: "carlos.rodriguez@email.com", obraSocial: "Galeno", fechaNacimiento: "10/11/1978" },
  { id: 4, nombre: "Ana Martínez", dni: "33.456.789", telefono: "351-456-7890", email: "ana.martinez@email.com", obraSocial: "Medicus", fechaNacimiento: "05/02/1995" },
  { id: 5, nombre: "Pedro Sánchez", dni: "22.111.222", telefono: "351-567-8901", email: "pedro.sanchez@email.com", obraSocial: "OSDE", fechaNacimiento: "30/08/1982" },
  { id: 6, nombre: "Laura González", dni: "29.333.444", telefono: "351-678-9012", email: "laura.gonzalez@email.com", obraSocial: "Sancor", fechaNacimiento: "18/12/1988" },
];

export default function Paciente() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroDni, setFiltroDni] = useState("");

  const pacientesFiltrados = pacientesData.filter((pac) => {
    const coincideNombre = pac.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideDni = filtroDni === "" || pac.dni.includes(filtroDni);
    return coincideNombre && coincideDni;
  });

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
                  {pac.nombre.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="paciente-nombre">
                  <h3>{pac.nombre}</h3>
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
                  <span className="label">Obra Social</span>
                  <span className="value">{pac.obraSocial}</span>
                </div>
                <div className="detalle-item">
                  <span className="label">Nacimiento</span>
                  <span className="value">{pac.fechaNacimiento}</span>
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