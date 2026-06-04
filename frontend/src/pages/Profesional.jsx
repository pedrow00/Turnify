import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Profesional.css";
import { formatHorario } from "../utils/horariosProfesionales";

export default function Profesional() {
  const [busqueda, setBusqueda] = useState("");
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("todas");
  const [profesionales, setProfesionales] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const cargarProfesionales = async () => {
      try {
        const [profesionalesResponse, especialidadesResponse] = await Promise.all([
          fetch(`${apiUrl}/profesionales`),
          fetch(`${apiUrl}/especialidades`),
        ]);

        if (!profesionalesResponse.ok || !especialidadesResponse.ok) {
          throw new Error("No se pudieron cargar los profesionales");
        }

        const [profesionalesData, especialidadesData] = await Promise.all([
          profesionalesResponse.json(),
          especialidadesResponse.json(),
        ]);

        setProfesionales(profesionalesData);
        setEspecialidades(especialidadesData);
      } catch {
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

  const getEspecialidadesProfesional = (prof) => {
    if (Array.isArray(prof.especialidades) && prof.especialidades.length > 0) {
      return prof.especialidades;
    }

    const especialidadNombre =
      prof.especialidad_nombre ||
      especialidades.find((especialidad) => String(especialidad.id) === String(prof.especialidad_id))
        ?.nombre;

    return especialidadNombre
      ? [{ id: prof.especialidad_id, nombre: especialidadNombre, matricula: prof.matricula, es_principal: true }]
      : [];
  };

  const getEspecialidadPrincipal = (prof) =>
    getEspecialidadesProfesional(prof).find((especialidad) => especialidad.es_principal) ||
    getEspecialidadesProfesional(prof)[0];

  const getEspecialidadesTexto = (prof) => {
    const especialidadesProfesional = getEspecialidadesProfesional(prof);
    if (especialidadesProfesional.length === 0) return "Sin especialidad";

    return especialidadesProfesional
      .map((especialidad) =>
        especialidad.es_principal ? `${especialidad.nombre} (principal)` : especialidad.nombre
      )
      .join(", ");
  };

  const profesionalesFiltrados = profesionales.filter((prof) => {
    const termino = busqueda.trim().toLowerCase();
    const coincideEspecialidad =
      especialidadSeleccionada === "todas" ||
      getEspecialidadesProfesional(prof).some(
        (especialidad) => String(especialidad.id) === String(especialidadSeleccionada)
      );

    if (!coincideEspecialidad) {
      return false;
    }

    if (!termino) {
      return true;
    }

    const nombre = String(prof.nombre ?? "").toLowerCase();
    const apellido = String(prof.apellido ?? "").toLowerCase();
    const cuil = String(prof.cuil ?? "").toLowerCase();
    const matricula = String(prof.matricula ?? "").toLowerCase();
    const especialidad = getEspecialidadesTexto(prof).toLowerCase();
    const nombreCompleto = `${nombre} ${apellido}`.trim();

    return (
      nombre.includes(termino) ||
      apellido.includes(termino) ||
      cuil.includes(termino) ||
      matricula.includes(termino) ||
      especialidad.includes(termino) ||
      nombreCompleto.includes(termino)
    );
  });

  const formatDireccion = (prof) => {
    const calleNumero = [prof.calle, prof.numero].filter(Boolean).join(" ");
    const pisoDepto = [prof.piso ? `Piso ${prof.piso}` : "", prof.departamento ? `Depto ${prof.departamento}` : ""]
      .filter(Boolean)
      .join(" ");
    const partes = [calleNumero, pisoDepto, prof.codigo_postal ? `CP ${prof.codigo_postal}` : ""]
      .filter(Boolean)
      .join(", ");

    return partes || "Sin dato";
  };

  const getIniciales = (prof) =>
    `${prof.nombre ?? ""} ${prof.apellido ?? ""}`
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("");

  const getHorariosActivos = (prof) =>
    Array.isArray(prof.horarios) ? prof.horarios.filter((horario) => horario.activo !== false) : [];

  const getConsultoriosTexto = (prof) => {
    if (!Array.isArray(prof.consultorios) || prof.consultorios.length === 0) {
      return "Sin consultorios asignados";
    }

    return prof.consultorios
      .map((consultorio) => `Consultorio ${consultorio.numero_consultorio}`)
      .join(", ");
  };

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
              placeholder="Buscar por CUIL, matricula, especialidad, nombre o apellido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="profesional-content">
          <aside className="profesional-sidebar">
            <div className="profesional-sidebar-header">
              <h2>Especialidades</h2>
              <p>Filtra el listado</p>
            </div>
            <button
              type="button"
              className={`especialidad-filter ${
                especialidadSeleccionada === "todas" ? "active" : ""
              }`}
              onClick={() => setEspecialidadSeleccionada("todas")}
            >
              <span>Todas</span>
              <strong>{profesionales.length}</strong>
            </button>
            {especialidades.map((especialidad) => {
              const total = profesionales.filter(
                (prof) =>
                  getEspecialidadesProfesional(prof).some(
                    (item) => String(item.id) === String(especialidad.id)
                  )
              ).length;

              return (
                <button
                  key={especialidad.id}
                  type="button"
                  className={`especialidad-filter ${
                    String(especialidadSeleccionada) === String(especialidad.id) ? "active" : ""
                  }`}
                  onClick={() => setEspecialidadSeleccionada(String(especialidad.id))}
                >
                  <span>{especialidad.nombre}</span>
                  <strong>{total}</strong>
                </button>
              );
            })}
          </aside>

          <div className="profesional-grid">
            {profesionalesFiltrados.length > 0 ? (
              profesionalesFiltrados.map((prof) => (
                <div key={prof.id} className="profesional-card">
                  <div className="profesional-header-card">
                    <div className="profesional-avatar">
                      {prof.foto_url ? (
                        <img src={prof.foto_url} alt={`Foto de ${prof.nombre} ${prof.apellido}`} />
                      ) : (
                        getIniciales(prof)
                      )}
                    </div>
                    <div className="profesional-nombre">
                      <h3>
                        {prof.nombre} {prof.apellido}
                      </h3>
                      <span className="profesional-code">CUIL: {prof.cuil || "Sin dato"}</span>
                      <span className="profesional-specialty">{getEspecialidadesTexto(prof)}</span>
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
                  <div className="detalle-item">
                    <span className="label">Matricula</span>
                    <span className="value">{getEspecialidadPrincipal(prof)?.matricula || "Sin dato"}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="label">Especialidades</span>
                    <span className="value">{getEspecialidadesTexto(prof)}</span>
                  </div>
                  <div className="detalle-item detalle-item-full">
                    <span className="label">Consultorios</span>
                    <span className="value">{getConsultoriosTexto(prof)}</span>
                  </div>
                  <div className="detalle-item detalle-item-full">
                    <span className="label">Horarios</span>
                    <span className="value">
                      {getHorariosActivos(prof).length > 0
                        ? `${getHorariosActivos(prof).length} rango(s) cargado(s)`
                        : "Sin horarios"}
                    </span>
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
                {profesionalSeleccionado.foto_url ? (
                  <img
                    src={profesionalSeleccionado.foto_url}
                    alt={`Foto de ${profesionalSeleccionado.nombre} ${profesionalSeleccionado.apellido}`}
                  />
                ) : (
                  getIniciales(profesionalSeleccionado)
                )}
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
                <span className="label">Matricula principal</span>
                <span className="value">{getEspecialidadPrincipal(profesionalSeleccionado)?.matricula || "Sin dato"}</span>
              </div>
              <div className="profesional-modal-item">
                <span className="label">Especialidades</span>
                <span className="value">{getEspecialidadesTexto(profesionalSeleccionado)}</span>
              </div>
              <div className="profesional-modal-item">
                <span className="label">Sexo</span>
                <span className="value">{profesionalSeleccionado.sexo || "Sin dato"}</span>
              </div>
              <div className="profesional-modal-item">
                <span className="label">Email</span>
                <span className="value">{profesionalSeleccionado.email || "Sin dato"}</span>
              </div>
              <div className="profesional-modal-item">
                <span className="label">Telefono</span>
                <span className="value">{profesionalSeleccionado.telefono || "Sin dato"}</span>
              </div>
              <div className="profesional-modal-item">
                <span className="label">Provincia</span>
                <span className="value">
                  {profesionalSeleccionado.provincia_nombre || "Sin dato"}
                </span>
              </div>
              <div className="profesional-modal-item">
                <span className="label">Localidad</span>
                <span className="value">
                  {profesionalSeleccionado.localidad_nombre || "Sin dato"}
                </span>
              </div>
              <div className="profesional-modal-item">
                <span className="label">Direccion</span>
                <span className="value">{formatDireccion(profesionalSeleccionado)}</span>
              </div>
              <div className="profesional-modal-item profesional-modal-item-full">
                <span className="label">Consultorios asignados</span>
                <span className="value">{getConsultoriosTexto(profesionalSeleccionado)}</span>
              </div>
              <div className="profesional-modal-item profesional-modal-item-full">
                <span className="label">Horarios disponibles</span>
                <div className="profesional-horarios-list">
                  {getHorariosActivos(profesionalSeleccionado).length > 0 ? (
                    getHorariosActivos(profesionalSeleccionado).map((horario, index) => (
                      <span key={`${horario.dia}-${horario.hora_inicio}-${index}`}>
                        {formatHorario(horario)}
                      </span>
                    ))
                  ) : (
                    <span>Sin horarios cargados</span>
                  )}
                </div>
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
