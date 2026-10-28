const bcrypt = require('bcrypt');
const usuarioService = require('../services/usuario.service');
const { nombreVisible } = require('../utils/identidad');
const { logger } = require('../utils/logger');

const regenerateSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });

const saveSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });

const login = async (req, res) => {
  try {
    const { identificador, password } = req.body;
    if (!identificador || !password) {
      return res
        .status(400)
        .json({ error: 'Usuario, email o CUIL y contraseña requeridos' });
    }

    const usuario = await usuarioService.buscarPorIdentificador(identificador);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // La baja es logica: el usuario sigue existiendo pero no puede entrar.
    // Se valida despues de la contraseña para no revelar que cuentas existen.
    if (!usuario.activo) {
      return res
        .status(403)
        .json({ error: 'Tu cuenta está desactivada. Contactá a un administrador.' });
    }

    // Se regenera el ID de sesión al autenticar para evitar fijación de sesión
    // (que un atacante reuse un ID que le haya hecho llegar a la víctima).
    await regenerateSession(req);

    req.session.user = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol_nombre.toLowerCase(),
      nombre_completo: nombreVisible(usuario),
    };

    await saveSession(req);

    res.json(req.session.user);
  } catch (error) {
    // No se loguea el identificador ni el hash: solo el motivo tecnico.
    logger.error('Error en login', { message: error.message });
    res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'No se pudo cerrar sesión' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Sesión cerrada' });
  });
};

const me = (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  res.json(req.session.user);
};

/**
 * Perfil propio: mismos datos que el listado pero solo del usuario logueado,
 * sin exponer el hash de la contrasena.
 */
const perfil = async (req, res) => {
  try {
    const usuario = await usuarioService.buscarPorId(req.session.user.id);
    if (!usuario) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }
    res.json(usuario);
  } catch (error) {
    logger.error('Error al obtener el perfil', { message: error.message });
    res.status(500).json({ error: 'No se pudo obtener el perfil' });
  }
};

const listar = async (req, res) => {
  try {
    res.json(await usuarioService.listarUsuarios());
  } catch (error) {
    logger.error('Error al listar usuarios', { message: error.message });
    res.status(500).json({ error: 'No se pudieron obtener los usuarios' });
  }
};

const crear = async (req, res) => {
  try {
    const {
      email,
      password,
      rol_id,
      profesional_id,
      nombre,
      apellido,
      nombre_usuario,
      cuil,
    } = req.body;

    if (String(password || '').length < 8) {
      return res
        .status(400)
        .json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const usuario = await usuarioService.crearUsuario({
      email,
      password,
      rol_id,
      profesional_id,
      nombre,
      apellido,
      nombre_usuario,
      cuil,
    });
    res.status(201).json(usuario);
  } catch (error) {
    // Los errores de validacion del servicio no tienen codigo de Postgres;
    // los de base se loguean y no se devuelven al cliente.
    if (error.code) {
      logger.error('Error al crear usuario', { message: error.message });
      return res.status(500).json({ error: 'No se pudo crear el usuario' });
    }
    res.status(error.status || 400).json({ error: error.message });
  }
};

const actualizarDatos = async (req, res) => {
  try {
    const { email, nombre, apellido, nombre_usuario, cuil } = req.body;
    const usuario = await usuarioService.actualizarDatos({
      id: req.params.id,
      email,
      nombre,
      apellido,
      nombre_usuario,
      cuil,
    });
    res.json(usuario);
  } catch (error) {
    if (error.code) {
      logger.error('Error al actualizar datos de usuario', { message: error.message });
      return res.status(500).json({ error: 'No se pudieron actualizar los datos' });
    }
    res.status(error.status || 400).json({ error: error.message });
  }
};

const actualizarRol = async (req, res) => {
  try {
    const usuario = await usuarioService.actualizarRol({
      id: req.params.id,
      rol_id: req.body.rol_id,
      profesional_id: req.body.profesional_id,
      usuarioActualId: req.session.user.id,
    });
    res.json(usuario);
  } catch (error) {
    if (error.code) {
      logger.error('Error al actualizar rol', { message: error.message });
      return res.status(500).json({ error: 'No se pudo actualizar el rol' });
    }
    res.status(error.status || 400).json({ error: error.message });
  }
};

const actualizarPassword = async (req, res) => {
  try {
    await usuarioService.actualizarPassword({
      id: req.params.id,
      password: req.body.password,
    });
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    if (error.code) {
      logger.error('Error al actualizar contraseña', { message: error.message });
      return res.status(500).json({ error: 'No se pudo actualizar la contraseña' });
    }
    res.status(error.status || 400).json({ error: error.message });
  }
};

const actualizarPasswordPropia = async (req, res) => {
  try {
    await usuarioService.actualizarPasswordPropia({
      id: req.session.user.id,
      password_actual: req.body.password_actual,
      password_nueva: req.body.password_nueva,
    });
    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    if (error.code) {
      logger.error('Error al cambiar contraseña propia', { message: error.message });
      return res.status(500).json({ error: 'No se pudo actualizar la contraseña' });
    }
    res.status(error.status || 400).json({ error: error.message });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const usuario = await usuarioService.actualizarEstado({
      id: req.params.id,
      activo: req.body.activo,
      usuarioActualId: req.session.user.id,
    });
    res.json(usuario);
  } catch (error) {
    if (error.code) {
      logger.error('Error al actualizar estado', { message: error.message });
      return res.status(500).json({ error: 'No se pudo actualizar el estado' });
    }
    res.status(error.status || 400).json({ error: error.message });
  }
};

module.exports = {
  login,
  logout,
  me,
  perfil,
  listar,
  crear,
  actualizarDatos,
  actualizarRol,
  actualizarPassword,
  actualizarPasswordPropia,
  actualizarEstado,
};
