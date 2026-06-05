const pool = require('../config/db');
const bcrypt = require('bcrypt');

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

const crearUsuario = async ({ email, password, rol_id }) => {
  const rol = await pool.query('SELECT id FROM roles WHERE id = $1', [rol_id]);
  if (rol.rows.length === 0) throw new Error('Rol no válido');

  const password_hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO usuarios (email, password_hash, rol_id)
     VALUES ($1, $2, $3)
     RETURNING id, email, rol_id`,
    [email, password_hash, rol_id]
  );
  return result.rows[0];
};

module.exports = { buscarPorEmail, crearUsuario };