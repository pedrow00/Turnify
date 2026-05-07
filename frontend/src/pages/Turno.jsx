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
const DURACION_TURNO_MINUTOS = 15;
const diasPorIndice = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

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

const todayInputValue = () => dateToInputValue(new Date());

const getDiaSemana = (dateValue) => {
  if (!dateValue) return "";
  return diasPorIndice[new Date(`${dateValue}T12:00:00`).getDay()];
};

const isWeekend = (dateValue) => {
  const dia = getDiaSemana(dateValue);
  return dia === "sabado" || dia === "domingo";
};

const isPastDate = (dateValue) => Boolean(dateValue) && dateValue < todayInputValue();

const rangesOverlap = (inicioA, finA, inicioB, finB) =>
  toMinutes(inicioA) < toMinutes(finB) && toMinutes(inicioB) < toMinutes(finA);

const openDatePicker = (event) => {
  try {
    event.currentTarget.showPicker?.();
  } catch {
    // El navegador puede bloquear showPicker fuera de una accion directa del usuario.
  }
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
  hora_fin: fromMinutes(toMinutes(form.hora_inicio) + DURACION_TURNO_MINUTOS),
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

      setTurnos(turnosData.filter((turno) => normalizeDate(turno.fecha) >= todayInputValue()));
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

  const fechaHabilitada = Boolean(form.fecha) && !isPastDate(form.fecha) && !isWeekend(form.fecha);
  const pacienteHabilitado = fechaHabilitada && Boolean(form.paciente_id);
  const especialidadHabilitada = pacienteHabilitado && Boolean(form.especialidad_id);
  const profesionalHabilitado = especialidadHabilitada && Boolean(form.profesional_id);
  const consultorioHabilitado = profesionalHabilitado && Boolean(form.consultorio_id);
  const horarioHabilitado = consultorioHabilitado && Boolean(form.hora_inicio);
  const estadoHabilitado = horarioHabilitado && Boolean(form.estado);
  const puedeGuardar = estadoHabilitado && Boolean(form.motivo_consulta.trim()) && !guardando;

  const profesionalesFiltrados = useMemo(
    () =>
      profesionales.filter(
        (profesional) => String(profesional.especialidad_id) === String(form.especialidad_id)
      ),
    [form.especialidad_id, profesionales]
  );

  const consultoriosFiltrados = useMemo(
    () =>
      consultorios.filter((consultorio) => {
        if (consultorio.activo === false) return false;
        if (!form.especialidad_id) return false;
        if (!Array.isArray(consultorio.especialidades)) return true;

        return consultorio.especialidades.some(
          (especialidad) => String(especialidad.id) === String(form.especialidad_id)
        );
      }),
    [consultorios, form.especialidad_id]
  );

  const profesionalSeleccionado = useMemo(
    () => profesionales.find((profesional) => String(profesional.id) === String(form.profesional_id)),
    [form.profesional_id, profesionales]
  );

  const horariosLaboralesProfesional = useMemo(() => {
    if (!form.fecha || !profesionalSeleccionado?.horarios?.length) return [];

    const diaSemana = getDiaSemana(form.fecha);

    return profesionalSeleccionado.horarios.filter(
      (horario) => horario.activo !== false && String(horario.dia).toLowerCase() === diaSemana
    );
  }, [form.fecha, profesionalSeleccionado]);

  const turnosOcupadosProfesional = useMemo(
    () =>
      turnosDelDia
        .filter(
          (turno) =>
            String(turno.profesional_id) === String(form.profesional_id) &&
            turno.estado !== "cancelado" &&
            String(turno.id) !== String(turnoSeleccionado?.id)
        ),
    [form.profesional_id, turnoSeleccionado?.id, turnosDelDia]
  );

  const turnosOcupadosPaciente = useMemo(
    () =>
      turnosDelDia.filter(
        (turno) =>
          String(turno.paciente_id) === String(form.paciente_id) &&
          turno.estado !== "cancelado" &&
          String(turno.id) !== String(turnoSeleccionado?.id)
      ),
    [form.paciente_id, turnoSeleccionado?.id, turnosDelDia]
  );

  const turnosOcupadosConsultorio = useMemo(
    () =>
      turnosDelDia
        .filter(
          (turno) =>
            String(turno.consultorio_id) === String(form.consultorio_id) &&
            turno.estado !== "cancelado" &&
            String(turno.id) !== String(turnoSeleccionado?.id)
        ),
    [form.consultorio_id, turnoSeleccionado?.id, turnosDelDia]
  );

  const horariosDisponibles = useMemo(() => {
    const step = 15;
    const slots = [];

    if (!form.fecha || isWeekend(form.fecha) || isPastDate(form.fecha)) return slots;

    for (const horario of horariosLaboralesProfesional) {
      const inicioJornada = toMinutes(horario.hora_inicio);
      const finJornada = toMinutes(horario.hora_fin);

      for (
        let minutes = inicioJornada;
        minutes + DURACION_TURNO_MINUTOS <= finJornada;
        minutes += step
      ) {
        const inicio = fromMinutes(minutes);
        const fin = fromMinutes(minutes + DURACION_TURNO_MINUTOS);
        const ocupadoProfesional = turnosOcupadosProfesional.some((turno) =>
          rangesOverlap(inicio, fin, normalizeTime(turno.hora_inicio), normalizeTime(turno.hora_fin))
        );
        const ocupadoPaciente = turnosOcupadosPaciente.some((turno) =>
          rangesOverlap(inicio, fin, normalizeTime(turno.hora_inicio), normalizeTime(turno.hora_fin))
        );
        const ocupadoConsultorio = turnosOcupadosConsultorio.some((turno) =>
          rangesOverlap(inicio, fin, normalizeTime(turno.hora_inicio), normalizeTime(turno.hora_fin))
        );

        slots.push({
          inicio,
          fin,
          disponible: !ocupadoProfesional && !ocupadoPaciente && !ocupadoConsultorio,
          motivo: ocupadoProfesional
            ? "Profesional ocupado"
            : ocupadoPaciente
              ? "Paciente ocupado"
              : ocupadoConsultorio
                ? "Consultorio ocupado"
                : "Disponible",
        });
      }
    }

    return slots;
  }, [
    form.fecha,
    horariosLaboralesProfesional,
    turnosOcupadosConsultorio,
    turnosOcupadosPaciente,
    turnosOcupadosProfesional,
  ]);

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
    setForm((currentForm) => {
      const nextForm = { ...currentForm, [name]: value };

      if (name === "hora_inicio" && value) {
        nextForm.hora_fin = fromMinutes(toMinutes(value) + DURACION_TURNO_MINUTOS);
      }

      if (name === "fecha") {
        nextForm.paciente_id = "";
        nextForm.especialidad_id = "";
        nextForm.profesional_id = "";
        nextForm.consultorio_id = "";
        nextForm.hora_inicio = "";
        nextForm.hora_fin = "";
      }

      if (name === "paciente_id") {
        nextForm.especialidad_id = "";
        nextForm.profesional_id = "";
        nextForm.consultorio_id = "";
        nextForm.hora_inicio = "";
        nextForm.hora_fin = "";
      }

      if (name === "especialidad_id") {
        nextForm.profesional_id = "";
        nextForm.consultorio_id = "";
        nextForm.hora_inicio = "";
        nextForm.hora_fin = "";
      }

      if (name === "profesional_id") {
        nextForm.consultorio_id = "";
        nextForm.hora_inicio = "";
        nextForm.hora_fin = "";
      }

      if (name === "consultorio_id") {
        nextForm.hora_inicio = "";
        nextForm.hora_fin = "";
      }

      return nextForm;
    });
    clearFieldError(name);
    setSubmitError("");
    setMensaje("");
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
    if (form.fecha && isPastDate(form.fecha)) {
      nuevosErrores.fecha = "No se pueden elegir fechas pasadas.";
    }
    if (form.fecha && isWeekend(form.fecha)) {
      nuevosErrores.fecha = "No se pueden elegir sabados ni domingos.";
    }
    if (!form.paciente_id) nuevosErrores.paciente_id = "Selecciona un paciente.";
    if (!form.profesional_id) nuevosErrores.profesional_id = "Selecciona un profesional.";
    if (!form.consultorio_id) nuevosErrores.consultorio_id = "Selecciona un consultorio.";
    if (!form.especialidad_id) nuevosErrores.especialidad_id = "Selecciona una especialidad.";
    if (!form.hora_inicio) nuevosErrores.hora_inicio = "Selecciona un horario disponible.";
    if (!form.hora_fin) nuevosErrores.hora_fin = "El fin se calcula automaticamente.";
    if (!form.motivo_consulta.trim()) nuevosErrores.motivo_consulta = "Indica el motivo de consulta.";

    if (form.hora_inicio) {
      const finCalculado = fromMinutes(toMinutes(form.hora_inicio) + DURACION_TURNO_MINUTOS);
      if (form.hora_fin !== finCalculado) {
        nuevosErrores.hora_fin = "La duracion del turno debe ser de 15 minutos.";
      }
    }

    if (form.fecha && form.profesional_id && horariosLaboralesProfesional.length === 0) {
      nuevosErrores.hora_inicio = "El profesional no atiende en esa fecha.";
    }

    if (form.hora_inicio) {
      const slotSeleccionado = horariosDisponibles.find((slot) => slot.inicio === form.hora_inicio);

      if (!slotSeleccionado) {
        nuevosErrores.hora_inicio = "Selecciona un horario dentro de la agenda del profesional.";
      } else if (!slotSeleccionado.disponible) {
        nuevosErrores.hora_inicio = slotSeleccionado.motivo;
      }
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
              hiddenDays={[0, 6]}
              events={calendarEvents}
              dateClick={(info) => {
                const fecha = dateToInputValue(info.date);
                if (isWeekend(fecha) || isPastDate(fecha)) return;
                abrirNuevoTurno(fecha);
              }}
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
                min={todayInputValue()}
                value={form.fecha}
                onChange={handleChange}
                onClick={openDatePicker}
                onFocus={openDatePicker}
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
                disabled={guardando || !fechaHabilitada}
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
              <label htmlFor="especialidad_id">Especialidad</label>
              <select
                id="especialidad_id"
                name="especialidad_id"
                value={form.especialidad_id}
                onChange={handleChange}
                className={errors.especialidad_id ? "input-error" : ""}
                disabled={guardando || !pacienteHabilitado}
              >
                <option value="">Selecciona una especialidad</option>
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

            <div className="field">
              <label htmlFor="profesional_id">Profesional</label>
              <select
                id="profesional_id"
                name="profesional_id"
                value={form.profesional_id}
                onChange={handleChange}
                className={errors.profesional_id ? "input-error" : ""}
                disabled={guardando || !especialidadHabilitada}
              >
                <option value="">Selecciona un profesional</option>
                {profesionalesFiltrados.map((profesional) => (
                  <option key={profesional.id} value={profesional.id}>
                    {getNombreCompleto(profesional)}
                  </option>
                ))}
              </select>
              {errors.profesional_id ? (
                <span className="field-error">{errors.profesional_id}</span>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="consultorio_id">Consultorio</label>
              <select
                id="consultorio_id"
                name="consultorio_id"
                value={form.consultorio_id}
                onChange={handleChange}
                className={errors.consultorio_id ? "input-error" : ""}
                disabled={guardando || !profesionalHabilitado}
              >
                <option value="">Selecciona un consultorio</option>
                {consultoriosFiltrados.map((consultorio) => (
                  <option key={consultorio.id} value={consultorio.id}>
                    {consultorio.numero_consultorio} - Piso {consultorio.piso}
                  </option>
                ))}
              </select>
              {errors.consultorio_id ? (
                <span className="field-error">{errors.consultorio_id}</span>
              ) : null}
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
                    disabled={
                      !slot.disponible ||
                      !form.fecha ||
                      !form.profesional_id ||
                      !form.paciente_id ||
                      !form.especialidad_id ||
                      !form.consultorio_id
                    }
                    title={slot.motivo}
                  >
                    {slot.inicio}
                  </button>
                ))}
              </div>
              {errors.hora_inicio ? <span className="field-error">{errors.hora_inicio}</span> : null}
            </div>

            <div className="field">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                name="estado"
                value={form.estado}
                onChange={handleChange}
                disabled={guardando || !horarioHabilitado}
              >
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
                className={errors.motivo_consulta ? "input-error" : ""}
                disabled={guardando || !estadoHabilitado}
              />
              {errors.motivo_consulta ? (
                <span className="field-error">{errors.motivo_consulta}</span>
              ) : null}
            </div>

            {submitError ? <div className="submit-error">{submitError}</div> : null}

            <div className="turno-form-actions">
              <button type="submit" className="btn-primary" disabled={!puedeGuardar}>
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
