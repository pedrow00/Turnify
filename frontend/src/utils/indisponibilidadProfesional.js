import { todayInputValue } from "./turnos";

export const normalizeFechaIndisponibilidad = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

export const estaProfesionalIndisponible = (profesional, fecha) => {
  const desde = normalizeFechaIndisponibilidad(profesional?.indisponibilidad_desde);
  const hasta = normalizeFechaIndisponibilidad(profesional?.indisponibilidad_hasta);
  const fechaNorm = normalizeFechaIndisponibilidad(fecha);

  if (!desde || !hasta || !fechaNorm) {
    return false;
  }

  return fechaNorm >= desde && fechaNorm <= hasta;
};

export const getEstadoActividadProfesional = (profesional, fecha = todayInputValue()) => {
  const indisponible = estaProfesionalIndisponible(profesional, fecha);

  return {
    activo: !indisponible,
    etiqueta: indisponible ? "Inactivo" : "Activo",
    motivo: indisponible ? profesional?.indisponibilidad_motivo || null : null,
  };
};

export const getIndisponibilidadError = ({ desde, hasta, motivo }) => {
  const desdeNorm = normalizeFechaIndisponibilidad(desde);
  const hastaNorm = normalizeFechaIndisponibilidad(hasta);
  const motivoNorm = String(motivo || "").trim();

  if (!desdeNorm && !hastaNorm && !motivoNorm) {
    return null;
  }

  if (!desdeNorm || !hastaNorm) {
    return "Indica la fecha de inicio y fin del periodo de indisponibilidad.";
  }

  if (desdeNorm > hastaNorm) {
    return "La fecha de inicio debe ser anterior o igual a la fecha de fin.";
  }

  if (!motivoNorm) {
    return "Indica el motivo de la indisponibilidad.";
  }

  if (motivoNorm.length < 3) {
    return "El motivo debe tener al menos 3 caracteres.";
  }

  return null;
};

export const prepararIndisponibilidadPayload = ({ desde, hasta, motivo }) => {
  const desdeNorm = normalizeFechaIndisponibilidad(desde);
  const hastaNorm = normalizeFechaIndisponibilidad(hasta);
  const motivoNorm = String(motivo || "").trim();

  if (!desdeNorm && !hastaNorm && !motivoNorm) {
    return {
      indisponibilidad_desde: null,
      indisponibilidad_hasta: null,
      indisponibilidad_motivo: null,
    };
  }

  return {
    indisponibilidad_desde: desdeNorm,
    indisponibilidad_hasta: hastaNorm,
    indisponibilidad_motivo: motivoNorm,
  };
};
