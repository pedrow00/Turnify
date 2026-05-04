const pool = require('../config/db');
const { getFriendlyDbError } = require('../utils/dbErrors');

// GET todos
const obtenerEspecialidades = async () => {
  const result = await pool.query('SELECT * FROM especialidades ORDER BY nombre');
  return result.rows;
};

// GET por ID
const obtenerEspecialidadPorId = async (id) => {
  const result = await pool.query('SELECT * FROM especialidades WHERE id=$1', [id]);
  if (result.rows.length === 0) throw new Error('Especialidad no encontrada');
  return result.rows[0];
};

// POST
const crearEspecialidad = async (data) => {
  const { nombre } = data;

  try {
    const result = await pool.query(
      `INSERT INTO especialidades (nombre)
       VALUES ($1) RETURNING *`,
      [nombre]
    );

    return result.rows[0];
  } catch (error) {
    throw getFriendlyDbError(error, 'create');
  }
};

// PUT
const actualizarEspecialidad = async (id, data) => {
  const { nombre } = data;

  try {
    const result = await pool.query(
      `UPDATE especialidades SET nombre=$1
       WHERE id=$2 RETURNING *`,
      [nombre, id]
    );

    if (result.rows.length === 0) throw new Error('Especialidad no encontrada');
    return result.rows[0];
  } catch (error) {
    throw getFriendlyDbError(error, 'update');
  }
};

// DELETE
const eliminarEspecialidad = async (id) => {
  const result = await pool.query('DELETE FROM especialidades WHERE id=$1 RETURNING *', [id]);
  if (result.rows.length === 0) throw new Error('Especialidad no encontrada');
};

module.exports = { obtenerEspecialidades, obtenerEspecialidadPorId, crearEspecialidad, actualizarEspecialidad, eliminarEspecialidad };
