import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/Turno.css";
import { apiGet } from "../utils/api";
import {
  estadosTurno,
  formatEstado,
  getTurnoPaciente,
  getTurnoProfesional,
  normalizeDate,
  normalizeEstado,
  normalizeTime,
  todayInputValue,
} from "../utils/turnos";

export default function ListadoTurnos() {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroProfesional, setFiltroProfesional] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [turnoDetalle, setTurnoDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const cargarTurnos = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");
      const [turnosData, profesionalesData] = await Promise.all([
        apiGet("/turnos"),
        apiGet("/profesionales"),
      ]);
      setTurnos(turnosData.filter((turno) => normalizeDate(turno.fecha) >= todayInputValue()));
      setProfesionales(
        [...profesionalesData].sort((a, b) =>
          getTurnoProfesional({ profesional: a }).localeCompare(getTurnoProfesional({ profesional: b }))
        )
      );
    } catch (error) {
      setLoadError(error.message || "No se pudieron cargar los turnos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarTurnos();
  }, [cargarTurnos]);

  useEffect(() => {
    if (!turnoDetalle) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") setTurnoDetalle(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [turnoDetalle]);

  const turnosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return turnos.filter((turno) => {
      const coincideEstado = filtroEstado === "todos" || normalizeEstado(turno.estado) === filtroEstado;
      if (!coincideEstado) return false;
      const coincideProfesional =
        filtroProfesional === "todos" || String(turno.profesional_id) === String(filtroProfesional);
      if (!coincideProfesional) return false;
      if (!termino) return true;

      const textoTurno = [
        getTurnoPaciente(turno),
        getTurnoProfesional(turno),
        turno.consultorio?.numero_consultorio,
        turno.especialidad?.nombre,
        turno.motivo_consulta,
        normalizeDate(turno.fecha),
        normalizeTime(turno.hora_inicio),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return textoTurno.includes(termino);
    });
  }, [busqueda, filtroEstado, filtroProfesional, turnos]);

  const editarTurno = (turno) => {
    navigate("/turno", { state: { editarTurnoId: turno.id } });
  };

  if (loading) return <p className="turno-loading">Cargando turnos...</p>;

  return (
    <div className="turno-page">
      <div className="turno-header">
        <div className="header-title">
          <h1>Listado de turnos</h1>
          <p>Consulta, filtra y abre los turnos registrados.</p>
        </div>
        <Link to="/turno" className="btn-nuevo">
          Volver al calendario
        </Link>
      </div>

      {loadError ? (
        <section className="turno-alert turno-alert-error">
          <p>{loadError}</p>
          <button type="button" onClick={cargarTurnos}>
            Reintentar
          </button>
        </section>
      ) : null}

      <section className="turno-list-page-panel">
        <div className="turno-toolbar turno-list-filters">
          <label className="turno-filter turno-search-filter">
            <span>Buscar turno</span>
            <input
              type="text"
              placeholder="Buscar por paciente, profesional, fecha o motivo..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </label>

          <label className="turno-filter">
            <span>Profesional</span>
            <select
              value={filtroProfesional}
              onChange={(event) => setFiltroProfesional(event.target.value)}
            >
              <option value="todos">Todos los profesionales</option>
              {profesionales.map((profesional) => (
                <option key={profesional.id} value={profesional.id}>
                  {getTurnoProfesional({ profesional })}
                </option>
              ))}
            </select>
          </label>

          <label className="turno-filter">
            <span>Estado</span>
            <select value={filtroEstado} onChange={(event) => setFiltroEstado(event.target.value)}>
              <option value="todos">Todos los estados</option>
              {estadosTurno.map((estado) => (
                <option key={estado} value={estado}>
                  {formatEstado(estado)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="turno-list">
          <div className="section-heading">
            <h2>Turnos</h2>
            <p>{turnosFiltrados.length} resultado(s) para los filtros actuales.</p>
          </div>

          {turnosFiltrados.length > 0 ? (
            turnosFiltrados.map((turno) => (
              <div key={turno.id} className="turno-list-item">
                <div>
                  <span className={`turno-status turno-status-${normalizeEstado(turno.estado)}`}>
                    {formatEstado(turno.estado)}
                  </span>
                  <button
                    type="button"
                    className="turno-patient-link"
                    onClick={() => setTurnoDetalle(turno)}
                  >
                    {getTurnoPaciente(turno)}
                  </button>
                  <p>{getTurnoProfesional(turno)}</p>
                </div>
                <div className="turno-list-time">
                  <strong>{normalizeTime(turno.hora_inicio)}</strong>
                  <span>
                    {new Date(`${normalizeDate(turno.fecha)}T00:00:00`).toLocaleDateString("es-AR")}
                  </span>
                  <button type="button" className="turno-list-edit" onClick={() => editarTurno(turno)}>
                    Editar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">No se encontraron turnos</div>
          )}
        </div>
      </section>

      {turnoDetalle ? (
        <div className="turno-modal-overlay" onClick={() => setTurnoDetalle(null)} role="presentation">
          <div
            className="turno-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="turno-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="turno-modal-close"
              onClick={() => setTurnoDetalle(null)}
              aria-label="Cerrar detalle del turno"
            >
              x
            </button>

            <div className="turno-modal-header">
              <div className="turno-modal-avatar">
                {getTurnoPaciente(turnoDetalle)
                  .split(" ")
                  .filter(Boolean)
                  .map((segmento) => segmento[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <span className={`turno-status turno-status-${normalizeEstado(turnoDetalle.estado)}`}>
                  {formatEstado(turnoDetalle.estado)}
                </span>
                <h2 id="turno-modal-title">{getTurnoPaciente(turnoDetalle)}</h2>
                <p>
                  {new Date(`${normalizeDate(turnoDetalle.fecha)}T00:00:00`).toLocaleDateString("es-AR")} -{" "}
                  {normalizeTime(turnoDetalle.hora_inicio)} a {normalizeTime(turnoDetalle.hora_fin)}
                </p>
              </div>
            </div>

            <div className="turno-modal-grid">
              <div className="turno-modal-item">
                <span className="label">Paciente</span>
                <span className="value">{getTurnoPaciente(turnoDetalle)}</span>
              </div>
              <div className="turno-modal-item">
                <span className="label">Profesional</span>
                <span className="value">{getTurnoProfesional(turnoDetalle)}</span>
              </div>
              <div className="turno-modal-item">
                <span className="label">Especialidad</span>
                <span className="value">{turnoDetalle.especialidad?.nombre || "Sin dato"}</span>
              </div>
              <div className="turno-modal-item">
                <span className="label">Consultorio</span>
                <span className="value">
                  {turnoDetalle.consultorio?.numero_consultorio
                    ? `Consultorio ${turnoDetalle.consultorio.numero_consultorio}`
                    : "Sin dato"}
                </span>
              </div>
              <div className="turno-modal-item">
                <span className="label">Fecha</span>
                <span className="value">
                  {new Date(`${normalizeDate(turnoDetalle.fecha)}T00:00:00`).toLocaleDateString("es-AR")}
                </span>
              </div>
              <div className="turno-modal-item">
                <span className="label">Horario</span>
                <span className="value">
                  {normalizeTime(turnoDetalle.hora_inicio)} a {normalizeTime(turnoDetalle.hora_fin)}
                </span>
              </div>
              <div className="turno-modal-item turno-modal-item-full">
                <span className="label">Motivo de consulta</span>
                <span className="value">{turnoDetalle.motivo_consulta || "Sin dato"}</span>
              </div>
            </div>

            <div className="turno-modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setTurnoDetalle(null)}>
                Cerrar
              </button>
              <button type="button" className="btn-primary" onClick={() => editarTurno(turnoDetalle)}>
                Editar turno
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
