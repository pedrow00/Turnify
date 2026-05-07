export const diasSemana = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

export const crearHorarioVacio = () => ({
  dia: "lunes",
  hora_inicio: "08:00",
  hora_fin: "12:00",
  activo: true,
});

export const normalizeTime = (time) => String(time || "").slice(0, 5);

export const toMinutes = (time) => {
  const [hours, minutes] = normalizeTime(time).split(":").map(Number);
  return hours * 60 + minutes;
};

export const formatDia = (dia) => {
  if (!dia) return "Sin dia";
  return dia.charAt(0).toUpperCase() + dia.slice(1);
};

export const formatHorario = (horario) =>
  `${formatDia(horario.dia)} de ${normalizeTime(horario.hora_inicio)} a ${normalizeTime(
    horario.hora_fin
  )}`;

export const prepararHorariosPayload = (horarios) =>
  horarios
    .filter((horario) => horario.dia && horario.hora_inicio && horario.hora_fin)
    .map((horario) => ({
      dia: horario.dia,
      hora_inicio: normalizeTime(horario.hora_inicio),
      hora_fin: normalizeTime(horario.hora_fin),
      activo: horario.activo !== false,
    }));

export const normalizarHorariosDesdeApi = (horarios = []) =>
  horarios.map((horario) => ({
    dia: horario.dia || "lunes",
    hora_inicio: normalizeTime(horario.hora_inicio),
    hora_fin: normalizeTime(horario.hora_fin),
    activo: horario.activo !== false,
  }));

export const getHorariosError = (horarios = []) => {
  if (horarios.length === 0) {
    return "Carga al menos un horario de atencion.";
  }

  const horarioInvalido = horarios.find(
    (horario) =>
      !horario.dia ||
      !horario.hora_inicio ||
      !horario.hora_fin ||
      toMinutes(horario.hora_fin) <= toMinutes(horario.hora_inicio)
  );

  if (horarioInvalido) {
    return "Revisa los horarios: la hora de fin debe ser posterior al inicio.";
  }

  for (let i = 0; i < horarios.length; i += 1) {
    for (let j = i + 1; j < horarios.length; j += 1) {
      const horarioA = horarios[i];
      const horarioB = horarios[j];

      if (horarioA.dia !== horarioB.dia) {
        continue;
      }

      if (
        toMinutes(horarioA.hora_inicio) < toMinutes(horarioB.hora_fin) &&
        toMinutes(horarioB.hora_inicio) < toMinutes(horarioA.hora_fin)
      ) {
        return "Hay horarios superpuestos para el mismo dia.";
      }
    }
  }

  return "";
};
