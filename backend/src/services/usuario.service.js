const pool = require('../config/db');
const bcrypt = require('bcrypt');

const validationError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const buscarPorEmail = async (email) => {
  const result = await pool.query(
    `SELECT u.id, u.email, u.password_hash, u.rol_id, r.nombre AS rol_nombre
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE u.email = $1`,
    [email]
  );
  return result.rows[0] ?? null;
};

const buscarPorId = async (id) => {
  if (!Number.isInteger(Number(id))) return null;

  const result = await pool.query(
    `SELECT u.id, u.email, u.rol_id, r.nombre AS rol_nombre, u.fecha_creacion
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
};

const listarUsuarios = async () => {
  const result = await pool.query(
    `SELECT u.id, u.email, u.rol_id, r.nombre AS rol_nombre, u.fecha_creacion
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     ORDER BY u.email`
  );
  return result.rows;
};

const contarAdmins = async () => {
  const result = await pool.query(
    `SELECT count(*)::int AS total
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE r.nombre = 'admin'`
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

const crearUsuario = async ({ email, password, rol_id }) => {
  const rol = await obtenerRol(rol_id);
  const password_hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO usuarios (email, password_hash, rol_id)
       VALUES ($1, $2, $3)
       RETURNING id, email, rol_id, fecha_creacion`,
      [email, password_hash, rol.id]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw validationError('Ya existe un usuario con ese email');
    }
    throw error;
  }
};

const actualizarRol = async ({ id, rol_id, usuarioActualId }) => {
  const usuario = await buscarPorId(id);
  if (!usuario) throw validationError('El usuario no existe', 404);

  const rol = await obtenerRol(rol_id);

  // Un admin no puede quitarse su propio rol: se quedaria sin acceso a la
  // seccion y, si es el unico, sin forma de recuperarlo desde la interfaz.
  if (Number(id) === Number(usuarioActualId)) {
    throw validationError('No podés cambiar tu propio rol');
  }

  if (usuario.rol_nombre === 'admin' && rol.nombre !== 'admin') {
    const admins = await contarAdmins();
    if (admins <= 1) {
      throw validationError('No podés dejar el sistema sin administradores');
    }
  }

  const result = await pool.query(
    `UPDATE usuarios SET rol_id = $1 WHERE id = $2
     RETURNING id, email, rol_id, fecha_creacion`,
    [rol.id, id]
  );

  return { ...result.rows[0], rol_nombre: rol.nombre };
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

module.exports = {
  buscarPorEmail,
  buscarPorId,
  listarUsuarios,
  crearUsuario,
  actualizarRol,
  actualizarPassword,
};
