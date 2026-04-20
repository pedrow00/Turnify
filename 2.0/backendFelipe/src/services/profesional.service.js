const pool = require('../config/db');

// GET todos
const obtenerProfesionales = async () => {
  const result = await pool.query('SELECT * FROM profesionales ORDER BY apellido, nombre');
  return result.rows;
};

// GET por ID
const obtenerProfesionalPorId = async (id) => {
  const result = await pool.query('SELECT * FROM profesionales WHERE id=$1', [id]);
  if (result.rows.length === 0) throw new Error('Profesional no encontrado');
  return result.rows[0];
};

// POST
const crearProfesional = async (data) => {
  const { nombre, apellido, cuil, email, telefono } = data;

  const result = await pool.query(
    `INSERT INTO profesionales (nombre, apellido, cuil, email, telefono)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [nombre, apellido, cuil, email, telefono]
  );

  return result.rows[0];
};

// PUT
const actualizarProfesional = async (id, data) => {
  const { nombre, apellido, cuil, email, telefono } = data;

  const result = await pool.query(
    `UPDATE profesionales SET nombre=$1, apellido=$2, cuil=$3, email=$4, telefono=$5,
     fecha_modificacion=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *`,
    [nombre, apellido, cuil, email, telefono, id]
  );

  if (result.rows.length === 0) throw new Error('Profesional no encontrado');
  return result.rows[0];
};

// DELETE
const eliminarProfesional = async (id) => {
  const result = await pool.query('DELETE FROM profesionales WHERE id=$1 RETURNING *', [id]);
  if (result.rows.length === 0) throw new Error('Profesional no encontrado');
};

module.exports = { obtenerProfesionales, obtenerProfesionalPorId, crearProfesional, actualizarProfesional, eliminarProfesional };