export const initialTurnoForm = {
  fecha: "",
  hora_inicio: "",
  hora_fin: "",
  paciente_id: "",
  profesional_id: "",
  especialidad_id: "",
  estado: "confirmado",
  motivo_consulta: "",
};

export const estadosTurno = ["confirmado", "pendiente", "cancelado", "finalizado"];
export const DURACION_TURNO_MINUTOS = 15;

const diasPorIndice = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const normalizeDia = (dia) =>
  String(dia || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const normalizeEstado = (estado) =>
  String(estado || "confirmado")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const formatEstado = (estado) => {
  const normalizedEstado = normalizeEstado(estado);
  return normalizedEstado.charAt(0).toUpperCase() + normalizedEstado.slice(1);
};

export const padTime = (value) => String(value).padStart(2, "0");

export const normalizeTime = (time) => String(time || "").slice(0, 5);

export const toMinutes = (time) => {
  const [hours, minutes] = normalizeTime(time).split(":").map(Number);
  return hours * 60 + minutes;
};

export const fromMinutes = (minutes) => `${padTime(Math.floor(minutes / 60))}:${padTime(minutes % 60)}`;

export const dateToInputValue = (date) => {
  if (!date) return "";
  const nextDate = new Date(date);
  return `${nextDate.getFullYear()}-${padTime(nextDate.getMonth() + 1)}-${padTime(nextDate.getDate())}`;
};

export const normalizeDate = (date) => {
  if (!date) return "";
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.slice(0, 10);
  }
  return dateToInputValue(date);
};

export const todayInputValue = () => dateToInputValue(new Date());

export const getDiaSemana = (dateValue) => {
  if (!dateValue) return "";
  return diasPorIndice[new Date(`${dateValue}T12:00:00`).getDay()];
};

export const isWeekend = (dateValue) => {
  const dia = normalizeDia(getDiaSemana(dateValue));
  return dia === "sabado" || dia === "domingo";
};

export const isPastDate = (dateValue) => Boolean(dateValue) && dateValue < todayInputValue();

export const rangesOverlap = (inicioA, finA, inicioB, finB) =>
  toMinutes(inicioA) < toMinutes(finB) && toMinutes(inicioB) < toMinutes(finA);

export const getNombreCompleto = (persona) =>
  `${persona?.nombre ?? ""} ${persona?.apellido ?? ""}`.trim() || "Sin nombre";

export const getTurnoPaciente = (turno) =>
  turno.paciente ? getNombreCompleto(turno.paciente) : `Paciente #${turno.paciente_id}`;

export const getTurnoProfesional = (turno) =>
  turno.profesional ? getNombreCompleto(turno.profesional) : `Profesional #${turno.profesional_id}`;

export const sortByName = (items) =>
  [...items].sort((a, b) => getNombreCompleto(a).localeCompare(getNombreCompleto(b)));

export const buildTurnoPayload = (form) => ({
  fecha: form.fecha,
  hora_inicio: form.hora_inicio,
  hora_fin: fromMinutes(toMinutes(form.hora_inicio) + DURACION_TURNO_MINUTOS),
  paciente_id: Number(form.paciente_id),
  profesional_id: Number(form.profesional_id),
  especialidad_id: Number(form.especialidad_id),
  estado: form.estado,
  motivo_consulta: form.motivo_consulta.trim() || null,
});
