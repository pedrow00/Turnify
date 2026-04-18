const pool = require('../config/db');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'Usuario no encontrado' });
  }

  const usuario = result.rows[0];
  const validPassword = await bcrypt.compare(password, usuario.password_hash);

  if (!validPassword) {
    return res.status(400).json({ error: 'Contraseña incorrecta' });
  }

  res.json({ id: usuario.id, rol: usuario.rol });
};

module.exports = { login };
