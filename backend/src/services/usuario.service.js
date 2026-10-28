const pool = require('../config/db');
const bcrypt = require('bcrypt');
const {
  normalizarDigitos,
  formatearCuil,
  nombreDesdeEmail,
} = require('../utils/identidad');

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
         u.nombre, u.apellido, u.nombre_usuario, u.cuil,
         p.nombre AS profesional_nombre, p.apellido AS profesional_apellido,
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

  switch (error.constraint) {
    case 'usuarios_profesional_id_unique':
      return validationError('Ese profesional ya tiene un usuario asignado');
    case 'usuarios_nombre_usuario_unique':
      return validationError('Ese nombre de usuario ya está en uso');
    case 'usuarios_cuil_unique':
      return validationError('Ya existe un usuario con ese CUIL');
    default:
      return validationError('Ya existe un usuario con ese email');
  }
};

const normalizarEmail = (email) => {
  const texto = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) {
    throw validationError('Email inválido');
  }
  return texto;
};

const normalizarNombre = (valor, etiqueta) => {
  const texto = String(valor || '').trim().replace(/\s+/g, ' ');

  if (texto.length < 2 || texto.length > 100) {
    throw validationError(`Ingresá ${etiqueta} (entre 2 y 100 caracteres)`);
  }
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/.test(texto)) {
    throw validationError(`${etiqueta} tiene caracteres no válidos`);
  }
  return texto;
};

const normalizarNombreUsuario = (valor) => {
  const texto = String(valor || '').trim().toLowerCase();

  if (!/^[a-z0-9._-]{3,30}$/.test(texto)) {
    throw validationError(
      'El nombre de usuario debe tener entre 3 y 30 caracteres (letras, números, punto, guion o guion bajo)'
    );
  }
  if (/^\d+$/.test(texto)) {
    throw validationError('El nombre de usuario no puede ser solo números');
  }
  return texto;
};

/**
 * El CUIL es el unico documento del dominio de usuarios. Se guarda como
 * digitos, sin puntos ni guiones, y no se calcula a partir de otro dato.
 */
const normalizarCuil = (cuil) => {
  const digitos = normalizarDigitos(cuil);

  if (!digitos) {
    throw validationError('Ingresá el CUIL');
  }
  if (digitos.length !== 11) {
    throw validationError('El CUIL debe tener 11 dígitos');
  }

  return digitos;
};

/**
 * Identidad para el listado. Usa los datos guardados; si faltan, los del
 * profesional vinculado y, como ultimo recurso, los deducidos del email.
 * El CUIL no se estima: si no esta cargado, se muestra vacio.
 */
const construirIdentidad = (usuario) => {
  const derivado = nombreDesdeEmail(usuario.email);

  const nombre = usuario.nombre || usuario.profesional_nombre || derivado.nombre;
  const apellido =
    usuario.apellido || usuario.profesional_apellido || derivado.apellido;

  return {
    nombre_completo: [nombre, apellido].filter(Boolean).join(' ') || '—',
    nombre_usuario:
      usuario.nombre_usuario ||
      String(usuario.email || '').split('@')[0].toLowerCase(),
    cuil: usuario.cuil ? formatearCuil(usuario.cuil) : '',
    nombre_derivado: !usuario.nombre && !usuario.profesional_nombre,
    usuario_derivado: !usuario.nombre_usuario,
  };
};

const buscarPorIdentificador = async (identificador) => {
  const texto = String(identificador || '').trim();
  if (!texto) return null;

  const digitos = normalizarDigitos(texto);
  const params = [texto];
  let condiciones =
    'lower(u.email) = lower($1) OR lower(u.nombre_usuario) = lower($1)';

  // Un email puede tener digitos; solo se busca por CUIL si el texto no
  // parece un email, para no mezclar identidades.
  if (!texto.includes('@') && digitos.length === 11) {
    params.push(digitos);
    condiciones += ' OR u.cuil = $2';
  }

  const result = await pool.query(
    `SELECT u.id, u.email, u.password_hash, u.rol_id, u.activo,
            u.nombre, u.apellido,
            p.nombre AS profesional_nombre, p.apellido AS profesional_apellido,
            r.nombre AS rol_nombre
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       LEFT JOIN profesionales p ON p.id = u.profesional_id
      WHERE ${condiciones}
      LIMIT 1`,
    params
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

const crearUsuario = async ({
  email,
  password,
  rol_id,
  profesional_id,
  nombre,
  apellido,
  nombre_usuario,
  cuil,
}) => {
  const rol = await obtenerRol(rol_id);
  const profesionalId = await resolverProfesional(rol, profesional_id);
  const identidad = {
    nombre: normalizarNombre(nombre, 'el nombre'),
    apellido: normalizarNombre(apellido, 'el apellido'),
    nombre_usuario: normalizarNombreUsuario(nombre_usuario),
    cuil: normalizarCuil(cuil),
  };
  const password_hash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO usuarios
        (email, password_hash, rol_id, profesional_id,
         nombre, apellido, nombre_usuario, cuil)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        normalizarEmail(email),
        password_hash,
        rol.id,
        profesionalId,
        identidad.nombre,
        identidad.apellido,
        identidad.nombre_usuario,
        identidad.cuil,
      ]
    );
    return buscarPorId(result.rows[0].id);
  } catch (error) {
    throw mapUniqueError(error);
  }
};

const actualizarDatos = async ({
  id,
  email,
  nombre,
  apellido,
  nombre_usuario,
  cuil,
}) => {
  const usuario = await buscarPorId(id);
  if (!usuario) throw validationError('El usuario no existe', 404);

  const datos = {
    email: normalizarEmail(email),
    nombre: normalizarNombre(nombre, 'el nombre'),
    apellido: normalizarNombre(apellido, 'el apellido'),
    nombre_usuario: normalizarNombreUsuario(nombre_usuario),
    cuil: normalizarCuil(cuil),
  };

  try {
    await pool.query(
      `UPDATE usuarios
          SET email = $1, nombre = $2, apellido = $3,
              nombre_usuario = $4, cuil = $5
        WHERE id = $6`,
      [
        datos.email,
        datos.nombre,
        datos.apellido,
        datos.nombre_usuario,
        datos.cuil,
        id,
      ]
    );
    return buscarPorId(id);
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
 * Cambio de contraseña propio: pide la actual para que una sesion abierta
 * no alcance para cambiarla.
 */
const actualizarPasswordPropia = async ({
  id,
  password_actual,
  password_nueva,
}) => {
  const result = await pool.query(
    'SELECT password_hash FROM usuarios WHERE id = $1',
    [id]
  );
  const usuario = result.rows[0];
  if (!usuario) throw validationError('El usuario no existe', 404);

  const valido = await bcrypt.compare(
    String(password_actual || ''),
    usuario.password_hash
  );
  if (!valido) throw validationError('La contraseña actual no es correcta');

  if (String(password_nueva || '').length < 8) {
    throw validationError('La nueva contraseña debe tener al menos 8 caracteres');
  }

  const password_hash = await bcrypt.hash(password_nueva, 10);
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
  buscarPorIdentificador,
  buscarPorId,
  listarUsuarios,
  crearUsuario,
  actualizarDatos,
  actualizarRol,
  actualizarPassword,
  actualizarPasswordPropia,
  actualizarEstado,
};
