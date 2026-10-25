const pool = require('../config/db');
const bcrypt = require('bcrypt');

const validationError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * Datos de usuario que se pueden devolver al cliente: nunca el hash.
 * Para los usuarios con rol profesional se trae la especialidad principal y
 * su matricula desde profesionales / profesional_especialidades.
 */
const selectUsuariosBase = `
  SELECT u.id, u.email, u.rol_id, r.nombre AS rol_nombre,
         u.profesional_id, u.activo, u.fecha_creacion, u.fecha_baja,
         p.nombre AS profesional_nombre, p.apellido AS profesional_apellido,
         p.cuil AS profesional_cuil,
         COALESCE(pe.nombre, e.nombre) AS especialidad_nombre,
         COALESCE(pe.matricula, p.matricula) AS matricula
    FROM usuarios u
    JOIN roles r ON r.id = u.rol_id
    LEFT JOIN profesionales p ON p.id = u.profesional_id
    LEFT JOIN LATERAL (
      SELECT esp.nombre, pe2.matricula
        FROM profesional_especialidades pe2
        JOIN especialidades esp ON esp.id = pe2.especialidad_id
       WHERE pe2.profesional_id = p.id
       ORDER BY pe2.es_principal DESC, esp.nombre
       LIMIT 1
    ) pe ON true
    LEFT JOIN especialidades e ON e.id = p.especialidad_id
`;

const mapUniqueError = (error) => {
  if (error.code !== '23505') return error;

  if (error.constraint === 'usuarios_profesional_id_unique') {
    return validationError('Ese profesional ya tiene un usuario asignado');
  }
  return validationError('Ya existe un usuario con ese email');
};

const capitalizar = (texto) =>
  texto ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase() : '';

const formatearDni = (dni) =>
  String(dni).replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');

/**
 * CUIL con el digito verificador que usa AFIP: prefijo (2) + DNI (8) + DV.
 */
const calcularCuil = (dni, prefijo = '20') => {
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const base = `${prefijo}${dni}`;
  const suma = base
    .split('')
    .reduce((total, digito, indice) => total + Number(digito) * pesos[indice], 0);
  const resto = suma % 11;
  const verificador = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;

  return `${prefijo}-${dni}-${verificador}`;
};

/**
 * Identidad para el listado:
 * - con profesional vinculado se usan nombre, apellido y CUIL reales;
 * - sin profesional se deducen nombre y apellido del email y se estima un
 *   DNI/CUIL estable a partir del id (solo para la demo).
 */
const construirIdentidad = (usuario) => {
  const local = String(usuario.email || '').split('@')[0] || '';
  const partes = local
    .split(/[._+-]+/)
    .map((parte) => parte.replace(/\d+/g, ''))
    .filter(Boolean);

  const nombre = usuario.profesional_nombre || capitalizar(partes[0]);
  const apellido =
    usuario.profesional_apellido || partes.slice(1).map(capitalizar).join(' ');
  const nombreCompleto = [nombre, apellido].filter(Boolean).join(' ') || '—';

  const cuilProfesional = String(usuario.profesional_cuil || '').replace(/\D/g, '');
  const identidadDerivada = cuilProfesional.length !== 11;

  const dni = identidadDerivada
    ? String(20000000 + ((Number(usuario.id) * 7919) % 25000000))
    : cuilProfesional.slice(2, 10);

  const cuil = identidadDerivada
    ? calcularCuil(dni)
    : `${cuilProfesional.slice(0, 2)}-${dni}-${cuilProfesional.slice(10)}`;

  return {
    nombre_completo: nombreCompleto,
    nombre_usuario: local.toLowerCase(),
    dni: formatearDni(dni),
    cuil,
    nombre_derivado: !usuario.profesional_id,
    identidad_derivada: identidadDerivada,
  };
};

const buscarPorEmail = async (email) => {
  const result = await pool.query(
    `SELECT u.id, u.email, u.password_hash, u.rol_id, u.activo, r.nombre AS rol_nombre
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE u.email = $1`,
    [email]
  );
  return result.rows[0] ?? null;
};

const buscarPorId = async (id) => {
  if (!Number.isInteger(Number(id))) return null;

  const result = await pool.query(`${selectUsuariosBase} WHERE u.id = $1`, [id]);
  if (result.rows.length === 0) return null;

  return { ...result.rows[0], ...construirIdentidad(result.rows[0]) };
};

const listarUsuarios = async () => {
  const result = await pool.query(`${selectUsuariosBase} ORDER BY u.email`);
  return result.rows.map((row) => ({ ...row, ...construirIdentidad(row) }));
};

const contarAdminsActivos = async () => {
  const result = await pool.query(
    `SELECT count(*)::int AS total
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE r.nombre = 'admin' AND u.activo = true`
  );
  return result.rows[0].total;
};

const obtenerRol = async (rol_id) => {
  const id = Number(rol_id);
  if (!Number.isInteger(id)) throw validationError('Rol no válido');

  const result = await pool.query('SELECT id, nombre FROM roles WHERE id = $1', [id]);
  if (result.rows.length === 0) throw validationError('Rol no válido');

  return result.rows[0];
};

/**
 * Solo los usuarios con rol profesional llevan un profesional asociado, que es
 * de donde salen la especialidad y la matricula. Para el resto se guarda NULL.
 */
const resolverProfesional = async (rol, profesional_id) => {
  if (rol.nombre !== 'profesional') return null;

  const id = Number(profesional_id);
  if (!Number.isInteger(id) || id <= 0) {
    throw validationError('Seleccioná el profesional asociado al usuario');
  }

  const result = await pool.query('SELECT id FROM profesionales WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    throw validationError('El profesional seleccionado no existe');
  }

  return result.rows[0].id;
};

const crearUsuario = async ({ email, password, rol_id, profesional_id }) => {
  const rol = await obtenerRol(rol_id);
  const profesionalId = await resolverProfesional(rol, profesional_id);
  const password_hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO usuarios (email, password_hash, rol_id, profesional_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [email, password_hash, rol.id, profesionalId]
    );
    return buscarPorId(result.rows[0].id);
  } catch (error) {
    throw mapUniqueError(error);
  }
};

const actualizarRol = async ({ id, rol_id, profesional_id, usuarioActualId }) => {
  const usuario = await buscarPorId(id);
  if (!usuario) throw validationError('El usuario no existe', 404);

  const rol = await obtenerRol(rol_id);

  // Un admin no puede quitarse su propio rol: se quedaria sin acceso a la
  // seccion y, si es el unico, sin forma de recuperarlo desde la interfaz.
  if (Number(id) === Number(usuarioActualId)) {
    throw validationError('No podés cambiar tu propio rol');
  }

  if (usuario.rol_nombre === 'admin' && usuario.activo && rol.nombre !== 'admin') {
    const admins = await contarAdminsActivos();
    if (admins <= 1) {
      throw validationError('No podés dejar el sistema sin administradores');
    }
  }

  const profesionalId = await resolverProfesional(rol, profesional_id);

  try {
    await pool.query(
      'UPDATE usuarios SET rol_id = $1, profesional_id = $2 WHERE id = $3',
      [rol.id, profesionalId, id]
    );
    return buscarPorId(id);
  } catch (error) {
    throw mapUniqueError(error);
  }
};

const actualizarPassword = async ({ id, password }) => {
  const usuario = await buscarPorId(id);
  if (!usuario) throw validationError('El usuario no existe', 404);

  if (String(password || '').length < 8) {
    throw validationError('La contraseña debe tener al menos 8 caracteres');
  }

  const password_hash = await bcrypt.hash(password, 10);
  await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [
    password_hash,
    id,
  ]);
};

/**
 * Baja logica: no se borra la fila para no romper turnos ni historial.
 * Se puede revertir con activo = true.
 */
const actualizarEstado = async ({ id, activo, usuarioActualId }) => {
  const usuario = await buscarPorId(id);
  if (!usuario) throw validationError('El usuario no existe', 404);

  if (typeof activo !== 'boolean') throw validationError('Estado no válido');

  if (!activo) {
    if (Number(id) === Number(usuarioActualId)) {
      throw validationError('No podés desactivar tu propio usuario');
    }

    if (usuario.rol_nombre === 'admin' && usuario.activo) {
      const admins = await contarAdminsActivos();
      if (admins <= 1) {
        throw validationError('No podés dejar el sistema sin administradores');
      }
    }
  }

  await pool.query(
    'UPDATE usuarios SET activo = $1, fecha_baja = $2 WHERE id = $3',
    [activo, activo ? null : new Date(), id]
  );

  return buscarPorId(id);
};

module.exports = {
  buscarPorEmail,
  buscarPorId,
  listarUsuarios,
  crearUsuario,
  actualizarRol,
  actualizarPassword,
  actualizarEstado,
};
