const bcrypt = require('bcrypt');
const { buscarPorEmail, crearUsuario } = require('../services/usuario.service');
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
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const usuario = await buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Se regenera el ID de sesión al autenticar para evitar fijación de sesión
    // (que un atacante reuse un ID que le haya hecho llegar a la víctima).
    await regenerateSession(req);

    req.session.user = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol_nombre.toLowerCase(),
    };

    await saveSession(req);

    res.json({
      id: usuario.id,
      email: usuario.email,
      rol: req.session.user.rol,
    });
  } catch (error) {
    // No se loguea el email ni el hash: solo el motivo tecnico.
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

const register = async (req, res) => {
  try {
    const { email, password, rol_id } = req.body;
    const emailNormalizado = String(email || '').trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (String(password || '').length < 8) {
      return res
        .status(400)
        .json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const usuario = await crearUsuario({
      email: emailNormalizado,
      password,
      rol_id,
    });
    res.status(201).json(usuario);
  } catch (error) {
    // Los errores de validacion del servicio no tienen codigo de Postgres;
    // los de base se loguean y no se devuelven al cliente.
    if (error.code) {
      logger.error('Error al crear usuario', { message: error.message });
      return res.status(500).json({ error: 'No se pudo crear el usuario' });
    }
    res.status(400).json({ error: error.message });
  }
};

module.exports = { login, logout, me, register };
