const pool = require('../config/db');

const obtenerConsultorios = async () => {
  const result = await pool.query('SELECT * FROM consultorios ORDER BY numero_consultorio');
  return result.rows;
};

const obtenerConsultorioPorId = async (id) => {
  const result = await pool.query('SELECT * FROM consultorios WHERE id=$1', [id]);
  if (result.rows.length === 0) throw new Error('Consultorio no encontrado');
  return result.rows[0];
};

const crearConsultorio = async (data) => {
  const { numero_consultorio } = data;
  const result = await pool.query(
    `INSERT INTO consultorios (numero_consultorio) VALUES ($1) RETURNING *`,
    [numero_consultorio]
  );
  return result.rows[0];
};

const actualizarConsultorio = async (id, data) => {
  const { numero_consultorio } = data;
  const result = await pool.query(
    `UPDATE consultorios SET numero_consultorio=$1 WHERE id=$2 RETURNING *`,
    [numero_consultorio, id]
  );
  if (result.rows.length === 0) throw new Error('Consultorio no encontrado');
  return result.rows[0];
};

const eliminarConsultorio = async (id) => {
  const result = await pool.query('DELETE FROM consultorios WHERE id=$1 RETURNING *', [id]);
  if (result.rows.length === 0) throw new Error('Consultorio no encontrado');
};

module.exports = {
  obtenerConsultorios,
  obtenerConsultorioPorId,
  crearConsultorio,
  actualizarConsultorio,
  eliminarConsultorio
};