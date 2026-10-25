const PESOS_CUIL = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

const normalizarDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

const capitalizar = (texto) =>
  texto ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase() : '';

const formatearDni = (dni) => {
  const digitos = normalizarDigitos(dni);
  if (digitos.length === 8) {
    return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5)}`;
  }
  if (digitos.length === 7) {
    return `${digitos.slice(0, 1)}.${digitos.slice(1, 4)}.${digitos.slice(4)}`;
  }
  return digitos;
};

const formatearCuil = (cuil) => {
  const digitos = normalizarDigitos(cuil);
  if (digitos.length !== 11) return String(cuil ?? '');
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
};

/**
 * CUIL con el digito verificador que usa AFIP: prefijo (2) + DNI (8) + DV.
 */
const calcularCuil = (dni, prefijo = '20') => {
  const baseDni = normalizarDigitos(dni).padStart(8, '0');
  const base = `${prefijo}${baseDni}`;
  const suma = base
    .split('')
    .reduce((total, digito, indice) => total + Number(digito) * PESOS_CUIL[indice], 0);
  const resto = suma % 11;
  const verificador = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;

  return `${prefijo}-${baseDni}-${verificador}`;
};

const dniDesdeCuil = (cuil) => {
  const digitos = normalizarDigitos(cuil);
  if (digitos.length !== 11) return '';
  return digitos.slice(2, 10).replace(/^0+(?=\d)/, '');
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
  capitalizar,
  formatearDni,
  formatearCuil,
  calcularCuil,
  dniDesdeCuil,
  nombreDesdeEmail,
  nombreVisible,
};
