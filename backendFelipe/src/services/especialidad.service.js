const pool = require('../config/db');

const obtenerEspecialidades = async () => {
  const result = await pool.query(
    'SELECT * FROM especialidades ORDER BY nombre'
  );
  return result.rows;
};

const obtenerEspecialidadPorId = async (id) => {
  const result = await pool.query('SELECT * FROM especialidades WHERE id = $1', [
    id
  ]);
  if (result.rows.length === 0) throw new Error('Especialidad no encontrada');
  return result.rows[0];
};

const crearEspecialidad = async (data) => {
  const { nombre, descripcion, activa } = data;
  const result = await pool.query(
    `INSERT INTO especialidades (nombre, descripcion, activa)
     VALUES ($1, $2, COALESCE($3, TRUE))
     RETURNING *`,
    [nombre, descripcion ?? null, activa ?? null]
  );
  return result.rows[0];
};

const actualizarEspecialidad = async (id, data) => {
  const { nombre, descripcion, activa } = data;
  const result = await pool.query(
    `UPDATE especialidades SET nombre=$1, descripcion=$2, activa=$3
     WHERE id=$4 RETURNING *`,
    [nombre, descripcion ?? null, activa, id]
  );
  if (result.rows.length === 0) throw new Error('Especialidad no encontrada');
  return result.rows[0];
};

const eliminarEspecialidad = async (id) => {
  const result = await pool.query(
    'DELETE FROM especialidades WHERE id = $1 RETURNING *',
    [id]
  );
  if (result.rows.length === 0) throw new Error('Especialidad no encontrada');
};

module.exports = {
  obtenerEspecialidades,
  obtenerEspecialidadPorId,
  crearEspecialidad,
  actualizarEspecialidad,
  eliminarEspecialidad
};
