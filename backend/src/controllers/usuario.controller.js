const bcrypt = require('bcrypt');
const { buscarPorEmail, crearUsuario } = require('../services/usuario.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const usuario = await buscarPorEmail(email);
    console.log("Usuario encontrado:", usuario);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valido = await bcrypt.compare(password, usuario.password_hash);
    console.log("Contraseña válida:", valido);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    req.session.user = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol_nombre.toLowerCase(),
    };

    res.json({
      id: usuario.id,
      email: usuario.email,
      rol: req.session.user.rol,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: error.message });
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
    const usuario = await crearUsuario({ email, password, rol_id });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { login, logout, me, register };