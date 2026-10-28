const normalizarDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

const capitalizar = (texto) =>
  texto ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase() : '';

const formatearCuil = (cuil) => {
  const digitos = normalizarDigitos(cuil);
  if (digitos.length !== 11) return String(cuil ?? '');
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
};

const nombreDesdeEmail = (email) => {
  const local = String(email || '').split('@')[0] || '';
  const partes = local
    .split(/[._+-]+/)
    .map((parte) => parte.replace(/\d+/g, ''))
    .filter(Boolean)
    .map(capitalizar);

  return {
    nombre: partes[0] || '',
    apellido: partes.slice(1).join(' '),
  };
};

/**
 * Nombre para mostrar en el navbar: el guardado, el del profesional vinculado
 * o, como ultimo recurso, el deducido del email.
 */
const nombreVisible = (usuario = {}) => {
  const nombre = usuario.nombre || usuario.profesional_nombre;
  const apellido = usuario.apellido || usuario.profesional_apellido;

  if (nombre || apellido) {
    return [nombre, apellido].filter(Boolean).join(' ');
  }

  const derivado = nombreDesdeEmail(usuario.email);
  return [derivado.nombre, derivado.apellido].filter(Boolean).join(' ') || 'Usuario';
};

module.exports = {
  normalizarDigitos,
  formatearCuil,
  nombreDesdeEmail,
  nombreVisible,
};
