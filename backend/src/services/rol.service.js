const pool = require('../config/db');

const listarRoles = async () => {
  const result = await pool.query('SELECT id, nombre FROM roles ORDER BY id');
  return result.rows;
};

module.exports = { listarRoles };
