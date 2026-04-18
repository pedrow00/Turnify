const pool = require('../config/db');

const obtenerProfesionales = async () => {
  const result = await pool.query('SELECT * FROM profesionales ORDER BY apellido, nombre');
  return result.rows;
};

const obtenerProfesionalPorId = async (id) => {
  const result = await pool.query('SELECT * FROM profesionales WHERE id=$1', [id]);
  if (result.rows.length === 0) throw new Error('Profesional no encontrado');
  return result.rows[0];
};

const crearProfesional = async (data) => {
  const { nombre, apellido, matricula, especialidad_id } = data;
  const result = await pool.query(
    `INSERT INTO profesionales (nombre, apellido, matricula, especialidad_id)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [nombre, apellido, matricula, especialidad_id]
  );
  return result.rows[0];
};

const actualizarProfesional = async (id, data) => {
  const { nombre, apellido, matricula, especialidad_id } = data;
  const result = await pool.query(
    `UPDATE profesionales SET nombre=$1, apellido=$2, matricula=$3, especialidad_id=$4
     WHERE id=$5 RETURNING *`,
    [nombre, apellido, matricula, especialidad_id, id]
  );
  if (result.rows.length === 0) throw new Error('Profesional no encontrado');
  return result.rows[0];
};

const eliminarProfesional = async (id) => {
  const result = await pool.query('DELETE FROM profesionales WHERE id=$1 RETURNING *', [id]);
  if (result.rows.length === 0) throw new Error('Profesional no encontrado');
};

module.exports = {
  obtenerProfesionales,
  obtenerProfesionalPorId,
  crearProfesional,
  actualizarProfesional,
  eliminarProfesional
};