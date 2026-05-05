import { useCallback, useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../styles/Turno.css";

const initialForm = {
  fecha: "",
  hora_inicio: "",
  hora_fin: "",
  paciente_id: "",
  profesional_id: "",
  consultorio_id: "",
  especialidad_id: "",
  estado: "confirmado",
  motivo_consulta: "",
};

const estadosTurno = ["confirmado", "pendiente", "cancelado", "finalizado"];
const duraciones = [15, 30, 45, 60, 90, 120];

const padTime = (value) => String(value).padStart(2, "0");

const normalizeTime = (time) => String(time || "").slice(0, 5);

const toMinutes = (time) => {
  const [hours, minutes] = normalizeTime(time).split(":").map(Number);
  return hours * 60 + minutes;
};

const fromMinutes = (minutes) => `${padTime(Math.floor(minutes / 60))}:${padTime(minutes % 60)}`;

const dateToInputValue = (date) => {
  if (!date) return "";
  const nextDate = new Date(date);
  return `${nextDate.getFullYear()}-${padTime(nextDate.getMonth() + 1)}-${padTime(nextDate.getDate())}`;
};

const normalizeDate = (date) => {
  if (!date) return "";
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.slice(0, 10);
  }
  return dateToInputValue(date);
};

const getNombreCompleto = (persona) =>
  `${persona?.nombre ?? ""} ${persona?.apellido ?? ""}`.trim() || "Sin nombre";

const getTurnoPaciente = (turno) =>
  turno.paciente ? getNombreCompleto(turno.paciente) : `Paciente #${turno.paciente_id}`;

const getTurnoProfesional = (turno) =>
  turno.profesional ? getNombreCompleto(turno.profesional) : `Profesional #${turno.profesional_id}`;

const sortByName = (items) =>
  [...items].sort((a, b) => getNombreCompleto(a).localeCompare(getNombreCompleto(b)));

const buildPayload = (form) => ({
  fecha: form.fecha,
  hora_inicio: form.hora_inicio,
  hora_fin: form.hora_fin,
  paciente_id: Number(form.paciente_id),
  profesional_id: Number(form.profesional_id),
  consultorio_id: Number(form.consultorio_id),
  especialidad_id: Number(form.especialidad_id),
  estado: form.estado,
  motivo_consulta: form.motivo_consulta.trim() || null,
});

export default function Turno() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [turnos, setTurnos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [duracion, setDuracion] = useState(60);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");
      const [turnosRes, pacientesRes, profesionalesRes, consultoriosRes, especialidadesRes] =
        await Promise.all([
          fetch(`${apiUrl}/turnos`),
          fetch(`${apiUrl}/pacientes`),
          fetch(`${apiUrl}/profesionales`),
          fetch(`${apiUrl}/consultorios`),
          fetch(`${apiUrl}/especialidades`),
        ]);

      const responses = [turnosRes, pacientesRes, profesionalesRes, consultoriosRes, especialidadesRes];
      if (responses.some((response) => !response.ok)) {
        throw new Error("No se pudieron cargar todos los datos necesarios para turnos.");
      }

      const [turnosData, pacientesData, profesionalesData, consultoriosData, especialidadesData] =
        await Promise.all(responses.map((response) => response.json()));

      setTurnos(turnosData);
      setPacientes(sortByName(pacientesData));
      setProfesionales(sortByName(profesionalesData));
      setConsultorios(consultoriosData);
      setEspecialidades(especialidadesData);
    } catch (error) {
      setLoadError(error.message || "No se pudieron cargar los turnos.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (!turnoSeleccionado) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setTurnoSeleccionado(null);
        setForm(initialForm);
        setErrors({});
        setSubmitError("");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [turnoSeleccionado]);

  const turnosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return turnos.filter((turno) => {
      const coincideEstado = filtroEstado === "todos" || turno.estado === filtroEstado;
      if (!coincideEstado) return false;

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
  }, [busqueda, filtroEstado, turnos]);

  const turnosDelDia = useMemo(
    () => turnos.filter((turno) => normalizeDate(turno.fecha) === form.fecha),
    [form.fecha, turnos]
  );

  const horariosOcupadosProfesional = useMemo(
    () =>
      turnosDelDia
        .filter(
          (turno) =>
            String(turno.profesional_id) === String(form.profesional_id) &&
            String(turno.id) !== String(turnoSeleccionado?.id)
        )
        .map((turno) => normalizeTime(turno.hora_inicio)),
    [form.profesional_id, turnoSeleccionado?.id, turnosDelDia]
  );

  const horariosOcupadosConsultorio = useMemo(
    () =>
      turnosDelDia
        .filter(
          (turno) =>
            String(turno.consultorio_id) === String(form.consultorio_id) &&
            String(turno.id) !== String(turnoSeleccionado?.id)
        )
        .map((turno) => normalizeTime(turno.hora_inicio)),
    [form.consultorio_id, turnoSeleccionado?.id, turnosDelDia]
  );

  const horariosDisponibles = useMemo(() => {
    const inicioJornada = 8 * 60;
    const finJornada = 20 * 60;
    const step = 15;
    const slots = [];

    for (let minutes = inicioJornada; minutes + Number(duracion) <= finJornada; minutes += step) {
      const inicio = fromMinutes(minutes);
      const fin = fromMinutes(minutes + Number(duracion));
      const ocupadoProfesional = horariosOcupadosProfesional.includes(inicio);
      const ocupadoConsultorio = horariosOcupadosConsultorio.includes(inicio);

      slots.push({
        inicio,
        fin,
        disponible: !ocupadoProfesional && !ocupadoConsultorio,
        motivo: ocupadoProfesional
          ? "Profesional ocupado"
          : ocupadoConsultorio
            ? "Consultorio ocupado"
            : "Disponible",
      });
    }

    return slots;
  }, [duracion, horariosOcupadosConsultorio, horariosOcupadosProfesional]);

  const calendarEvents = turnosFiltrados.map((turno) => ({
    id: String(turno.id),
    title: `${normalizeTime(turno.hora_inicio)} ${getTurnoPaciente(turno)}`,
    start: `${normalizeDate(turno.fecha)}T${normalizeTime(turno.hora_inicio)}:00`,
    end: `${normalizeDate(turno.fecha)}T${normalizeTime(turno.hora_fin)}:00`,
    className: `turno-event turno-event-${turno.estado || "confirmado"}`,
    extendedProps: { turno },
  }));

  const clearFieldError = (fieldName) => {
    if (!errors[fieldName]) return;
    setErrors((currentErrors) => ({ ...currentErrors, [fieldName]: "" }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    clearFieldError(name);
    setSubmitError("");
    setMensaje("");
  };

  const handleDuracionChange = (event) => {
    const nextDuracion = Number(event.target.value);
    setDuracion(nextDuracion);

    if (form.hora_inicio) {
      setForm((currentForm) => ({
        ...currentForm,
        hora_fin: fromMinutes(toMinutes(currentForm.hora_inicio) + nextDuracion),
      }));
    }
  };

  const seleccionarHorario = (slot) => {
    if (!slot.disponible) return;

    setForm((currentForm) => ({
      ...currentForm,
      hora_inicio: slot.inicio,
      hora_fin: slot.fin,
    }));
    clearFieldError("hora_inicio");
    clearFieldError("hora_fin");
    setSubmitError("");
  };

  const abrirNuevoTurno = (fecha = "") => {
    setTurnoSeleccionado(null);
    setForm({
      ...initialForm,
      fecha,
      hora_inicio: "",
      hora_fin: "",
    });
    setDuracion(60);
    setErrors({});
    setSubmitError("");
    setMensaje("");
  };

  const abrirEditarTurno = (turno) => {
    const inicio = normalizeTime(turno.hora_inicio);
    const fin = normalizeTime(turno.hora_fin);

    setTurnoSeleccionado(turno);
    setForm({
      fecha: normalizeDate(turno.fecha),
      hora_inicio: inicio,
      hora_fin: fin,
      paciente_id: String(turno.paciente_id ?? turno.paciente?.id ?? ""),
      profesional_id: String(turno.profesional_id ?? turno.profesional?.id ?? ""),
      consultorio_id: String(turno.consultorio_id ?? turno.consultorio?.id ?? ""),
      especialidad_id: String(turno.especialidad_id ?? turno.especialidad?.id ?? ""),
      estado: turno.estado || "confirmado",
      motivo_consulta: turno.motivo_consulta ?? "",
    });
    setDuracion(Math.max(15, toMinutes(fin) - toMinutes(inicio)));
    setErrors({});
    setSubmitError("");
    setMensaje("");
  };

  const cerrarPanel = () => {
    setTurnoSeleccionado(null);
    setForm(initialForm);
    setErrors({});
    setSubmitError("");
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.fecha) nuevosErrores.fecha = "Selecciona la fecha del turno.";
    if (!form.paciente_id) nuevosErrores.paciente_id = "Selecciona un paciente.";
    if (!form.profesional_id) nuevosErrores.profesional_id = "Selecciona un profesional.";
    if (!form.consultorio_id) nuevosErrores.consultorio_id = "Selecciona un consultorio.";
    if (!form.especialidad_id) nuevosErrores.especialidad_id = "Selecciona una especialidad.";
    if (!form.hora_inicio) nuevosErrores.hora_inicio = "Selecciona un horario disponible.";
    if (!form.hora_fin) nuevosErrores.hora_fin = "Indica la hora de finalizacion.";

    if (form.hora_inicio && form.hora_fin && toMinutes(form.hora_fin) <= toMinutes(form.hora_inicio)) {
      nuevosErrores.hora_fin = "La hora de finalizacion debe ser posterior al inicio.";
    }

    if (form.hora_inicio && horariosOcupadosProfesional.includes(form.hora_inicio)) {
      nuevosErrores.hora_inicio = "El profesional ya tiene un turno en ese horario.";
    }

    if (form.hora_inicio && horariosOcupadosConsultorio.includes(form.hora_inicio)) {
      nuevosErrores.hora_inicio = "El consultorio ya esta ocupado en ese horario.";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarTurno = async (event) => {
    event.preventDefault();

    if (!validarFormulario()) return;

    try {
      setGuardando(true);
      setSubmitError("");
      setMensaje("");

      const isEditing = Boolean(turnoSeleccionado?.id);
      const response = await fetch(
        isEditing ? `${apiUrl}/turnos/${turnoSeleccionado.id}` : `${apiUrl}/turnos`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(form)),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo guardar el turno.");
      }

      await cargarDatos();
      setMensaje(isEditing ? "Turno actualizado correctamente." : "Turno registrado correctamente.");
      abrirNuevoTurno();
    } catch (error) {
      setSubmitError(error.message || "No se pudo guardar el turno.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarTurno = async () => {
    if (!turnoSeleccionado?.id) return;
    const confirmar = window.confirm("Seguro que queres eliminar este turno?");
    if (!confirmar) return;

    try {
      setGuardando(true);
      setSubmitError("");
      const response = await fetch(`${apiUrl}/turnos/${turnoSeleccionado.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo eliminar el turno.");
      }

      await cargarDatos();
      setMensaje("Turno eliminado correctamente.");
      cerrarPanel();
    } catch (error) {
      setSubmitError(error.message || "No se pudo eliminar el turno.");
    } finally {
      setGuardando(false);
    }
  };

  const proximoTurno = turnos
    .filter((turno) => turno.estado !== "cancelado")
    .find(
      (turno) =>
        new Date(`${normalizeDate(turno.fecha)}T${normalizeTime(turno.hora_inicio)}:00`) >=
        new Date()
    );

  if (loading) return <p className="turno-loading">Cargando turnos...</p>;

  return (
    <div className="turno-page">
      <div className="turno-header">
        <div className="header-title">
          <h1>Turnos</h1>
          <p>Agenda, modifica y busca turnos con pacientes, profesionales y consultorios.</p>
        </div>
        <button type="button" className="btn-nuevo" onClick={() => abrirNuevoTurno()}>
          + Nuevo Turno
        </button>
      </div>

      {loadError ? (
        <section className="turno-alert turno-alert-error">
          <p>{loadError}</p>
          <button type="button" onClick={cargarDatos}>
            Reintentar
          </button>
        </section>
      ) : null}

      {mensaje ? <div className="turno-alert turno-alert-success">{mensaje}</div> : null}

      <div className="turno-summary-grid">
        <div className="turno-summary-card">
          <span>Total</span>
          <strong>{turnos.length}</strong>
          <p>Turnos registrados</p>
        </div>
        <div className="turno-summary-card">
          <span>Confirmados</span>
          <strong>{turnos.filter((turno) => turno.estado === "confirmado").length}</strong>
          <p>Listos para atender</p>
        </div>
        <div className="turno-summary-card">
          <span>Proximo</span>
          <strong>{proximoTurno ? normalizeTime(proximoTurno.hora_inicio) : "--:--"}</strong>
          <p>{proximoTurno ? getTurnoPaciente(proximoTurno) : "Sin proximos turnos"}</p>
        </div>
      </div>

      <div className="turno-layout">
        <section className="turno-calendar-panel">
          <div className="turno-toolbar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar por paciente, profesional, fecha o motivo..."
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
            </div>
            <select value={filtroEstado} onChange={(event) => setFiltroEstado(event.target.value)}>
              <option value="todos">Todos los estados</option>
              {estadosTurno.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div className="turno-calendar">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="es"
              height="auto"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              buttonText={{
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Dia",
              }}
              selectable
              nowIndicator
              events={calendarEvents}
              dateClick={(info) => abrirNuevoTurno(dateToInputValue(info.date))}
              eventClick={(info) => abrirEditarTurno(info.event.extendedProps.turno)}
            />
          </div>

          <div className="turno-list">
            <div className="section-heading">
              <h2>Listado de turnos</h2>
              <p>{turnosFiltrados.length} resultado(s) para los filtros actuales.</p>
            </div>
            {turnosFiltrados.length > 0 ? (
              turnosFiltrados.map((turno) => (
                <button
                  key={turno.id}
                  type="button"
                  className="turno-list-item"
                  onClick={() => abrirEditarTurno(turno)}
                >
                  <div>
                    <span className={`turno-status turno-status-${turno.estado || "confirmado"}`}>
                      {turno.estado || "confirmado"}
                    </span>
                    <h3>{getTurnoPaciente(turno)}</h3>
                    <p>{getTurnoProfesional(turno)}</p>
                  </div>
                  <div className="turno-list-time">
                    <strong>{normalizeTime(turno.hora_inicio)}</strong>
                    <span>
                      {new Date(`${normalizeDate(turno.fecha)}T00:00:00`).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="no-results">No se encontraron turnos</div>
            )}
          </div>
        </section>

        <aside className="turno-form-panel">
          <div className="section-heading">
            <span className="turno-form-badge">
              {turnoSeleccionado ? "Editar turno" : "Nuevo turno"}
            </span>
            <h2>{turnoSeleccionado ? "Actualizar agenda" : "Registrar turno"}</h2>
            <p>Completa los datos obligatorios y elegi un horario disponible.</p>
          </div>

          <form className="turno-form" onSubmit={guardarTurno}>
            <div className="field">
              <label htmlFor="fecha">Fecha</label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                value={form.fecha}
                onChange={handleChange}
                className={errors.fecha ? "input-error" : ""}
                disabled={guardando}
              />
              {errors.fecha ? <span className="field-error">{errors.fecha}</span> : null}
            </div>

            <div className="field">
              <label htmlFor="paciente_id">Paciente</label>
              <select
                id="paciente_id"
                name="paciente_id"
                value={form.paciente_id}
                onChange={handleChange}
                className={errors.paciente_id ? "input-error" : ""}
                disabled={guardando}
              >
                <option value="">Selecciona un paciente</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id}>
                    {getNombreCompleto(paciente)} - DNI {paciente.dni}
                  </option>
                ))}
              </select>
              {errors.paciente_id ? <span className="field-error">{errors.paciente_id}</span> : null}
            </div>

            <div className="field">
              <label htmlFor="profesional_id">Profesional</label>
              <select
                id="profesional_id"
                name="profesional_id"
                value={form.profesional_id}
                onChange={handleChange}
                className={errors.profesional_id ? "input-error" : ""}
                disabled={guardando}
              >
                <option value="">Selecciona un profesional</option>
                {profesionales.map((profesional) => (
                  <option key={profesional.id} value={profesional.id}>
                    {getNombreCompleto(profesional)}
                  </option>
                ))}
              </select>
              {errors.profesional_id ? (
                <span className="field-error">{errors.profesional_id}</span>
              ) : null}
            </div>

            <div className="turno-form-row">
              <div className="field">
                <label htmlFor="consultorio_id">Consultorio</label>
                <select
                  id="consultorio_id"
                  name="consultorio_id"
                  value={form.consultorio_id}
                  onChange={handleChange}
                  className={errors.consultorio_id ? "input-error" : ""}
                  disabled={guardando}
                >
                  <option value="">Selecciona</option>
                  {consultorios
                    .filter((consultorio) => consultorio.activo !== false)
                    .map((consultorio) => (
                      <option key={consultorio.id} value={consultorio.id}>
                        {consultorio.numero_consultorio} - Piso {consultorio.piso}
                      </option>
                    ))}
                </select>
                {errors.consultorio_id ? (
                  <span className="field-error">{errors.consultorio_id}</span>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="especialidad_id">Especialidad</label>
                <select
                  id="especialidad_id"
                  name="especialidad_id"
                  value={form.especialidad_id}
                  onChange={handleChange}
                  className={errors.especialidad_id ? "input-error" : ""}
                  disabled={guardando}
                >
                  <option value="">Selecciona</option>
                  {especialidades.map((especialidad) => (
                    <option key={especialidad.id} value={especialidad.id}>
                      {especialidad.nombre}
                    </option>
                  ))}
                </select>
                {errors.especialidad_id ? (
                  <span className="field-error">{errors.especialidad_id}</span>
                ) : null}
              </div>
            </div>

            <div className="field">
              <label htmlFor="duracion">Duracion</label>
              <select id="duracion" value={duracion} onChange={handleDuracionChange} disabled={guardando}>
                {duraciones.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutos
                  </option>
                ))}
              </select>
            </div>

            <div className="turno-slots">
              <span className="turno-slots-label">Horarios disponibles</span>
              <div className="turno-slots-grid">
                {horariosDisponibles.map((slot) => (
                  <button
                    key={slot.inicio}
                    type="button"
                    className={`turno-slot ${form.hora_inicio === slot.inicio ? "selected" : ""}`}
                    onClick={() => seleccionarHorario(slot)}
                    disabled={!slot.disponible || !form.fecha || !form.profesional_id || !form.consultorio_id}
                    title={slot.motivo}
                  >
                    {slot.inicio}
                  </button>
                ))}
              </div>
              {errors.hora_inicio ? <span className="field-error">{errors.hora_inicio}</span> : null}
            </div>

            <div className="turno-form-row">
              <div className="field">
                <label htmlFor="hora_inicio">Inicio</label>
                <input
                  id="hora_inicio"
                  name="hora_inicio"
                  type="time"
                  value={form.hora_inicio}
                  onChange={handleChange}
                  className={errors.hora_inicio ? "input-error" : ""}
                  disabled={guardando}
                />
              </div>
              <div className="field">
                <label htmlFor="hora_fin">Fin</label>
                <input
                  id="hora_fin"
                  name="hora_fin"
                  type="time"
                  value={form.hora_fin}
                  onChange={handleChange}
                  className={errors.hora_fin ? "input-error" : ""}
                  disabled={guardando}
                />
                {errors.hora_fin ? <span className="field-error">{errors.hora_fin}</span> : null}
              </div>
            </div>

            <div className="field">
              <label htmlFor="estado">Estado</label>
              <select id="estado" name="estado" value={form.estado} onChange={handleChange} disabled={guardando}>
                {estadosTurno.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="motivo_consulta">Motivo de consulta</label>
              <textarea
                id="motivo_consulta"
                name="motivo_consulta"
                value={form.motivo_consulta}
                onChange={handleChange}
                placeholder="Control, primera consulta, seguimiento..."
                disabled={guardando}
              />
            </div>

            {submitError ? <div className="submit-error">{submitError}</div> : null}

            <div className="turno-form-actions">
              <button type="submit" className="btn-primary" disabled={guardando}>
                {guardando ? "Guardando..." : turnoSeleccionado ? "Guardar cambios" : "Crear turno"}
              </button>
              {turnoSeleccionado ? (
                <button type="button" className="btn-danger" onClick={eliminarTurno} disabled={guardando}>
                  Eliminar
                </button>
              ) : null}
              <button type="button" className="btn-secondary" onClick={cerrarPanel} disabled={guardando}>
                Limpiar
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
