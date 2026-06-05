export const ROLES = {
  ADMIN: "admin",
  SOCIO: "socio",
  SECRETARIA: "secretaria",
  PROFESIONAL: "profesional",
};

export const PERMISSIONS = {
  turno: [ROLES.ADMIN, ROLES.SOCIO, ROLES.SECRETARIA, ROLES.PROFESIONAL],
  paciente: [ROLES.ADMIN, ROLES.SOCIO, ROLES.SECRETARIA, ROLES.PROFESIONAL],
  pacienteWrite: [ROLES.ADMIN, ROLES.SOCIO, ROLES.SECRETARIA],
  profesional: [ROLES.SECRETARIA, ROLES.SOCIO],
  consultorio: [ROLES.ADMIN, ROLES.SOCIO, ROLES.SECRETARIA],
};

export const NAV_ITEMS = [
  {
    to: "/turno",
    label: "Turnos",
    permission: "turno",
    isActive: (path) => path === "/turno",
  },
  {
    to: "/paciente",
    label: "Pacientes",
    permission: "paciente",
    isActive: (path) => path.startsWith("/paciente"),
  },
  {
    to: "/profesional",
    label: "Profesionales",
    permission: "profesional",
    isActive: (path) => path.startsWith("/profesional"),
  },
  {
    to: "/consultorio",
    label: "Consultorios",
    permission: "consultorio",
    isActive: (path) => path.startsWith("/consultorio"),
  },
];

export const FEATURE_ITEMS = [
  {
    to: "/turno",
    icon: "📆",
    title: "Administrar Turnos",
    description: "Creá, modificá y cancelá turnos de forma sencilla.",
    permission: "turno",
  },
  {
    to: "/paciente",
    icon: "👥",
    title: "Gestionar Pacientes",
    description: "Registrá y consultá el historial de tus pacientes.",
    permission: "paciente",
  },
  {
    to: "/profesional",
    icon: "🩺",
    title: "Control de Profesionales",
    description: "Organizá la agenda de tus profesionales médicos.",
    permission: "profesional",
  },
  {
    to: "/consultorio",
    icon: "🏥",
    title: "Consultorios",
    description: "Administrá los consultorios disponibles.",
    permission: "consultorio",
  },
];

export function canAccess(rol, permission) {
  if (!rol || !permission) return false;
  return PERMISSIONS[permission]?.includes(rol) ?? false;
}