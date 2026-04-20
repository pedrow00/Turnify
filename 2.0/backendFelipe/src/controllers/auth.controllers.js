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

const registrarUsuario = async ({ email, password, rol_id }) => {

  console.log("ROL_ID:", rol_id, typeof rol_id);

  const rol = await pool.query(
    'SELECT id FROM roles WHERE id = $1',
    [Number(rol_id)]
  );

  if (rol.rows.length === 0) {
    throw new Error('Rol no válido');
  }

  const hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO usuarios (email, password_hash, rol_id)
     VALUES ($1, $2, $3)
     RETURNING id, email, rol_id`,
    [email, hash, Number(rol_id)]
  );

  return result.rows[0];
};


module.exports = { login, registrarUsuario };
