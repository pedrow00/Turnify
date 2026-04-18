const pool = require('../config/db');

// GET todos
const obtenerPacientes = async () => {
  const result = await pool.query('SELECT * FROM pacientes ORDER BY apellido, nombre');
  return result.rows;
};

// GET por ID
const obtenerPacientePorId = async (id) => {
  const result = await pool.query('SELECT * FROM pacientes WHERE id = $1', [id]);
  if (result.rows.length === 0) throw new Error('Paciente no encontrado');
  return result.rows[0];
};

// POST
const crearPaciente = async (data) => {
  const { nombre, apellido, dni, email, telefono, fecha_nacimiento } = data;
  const result = await pool.query(
    `INSERT INTO pacientes (nombre, apellido, dni, email, telefono, fecha_nacimiento)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [nombre, apellido, dni, email, telefono, fecha_nacimiento]
  );
  return result.rows[0];
};

// PUT
const actualizarPaciente = async (id, data) => {
  const { nombre, apellido, dni, email, telefono, fecha_nacimiento } = data;
  const result = await pool.query(
    `UPDATE pacientes SET nombre=$1, apellido=$2, dni=$3, email=$4, telefono=$5, fecha_nacimiento=$6
     WHERE id=$7 RETURNING *`,
    [nombre, apellido, dni, email, telefono, fecha_nacimiento, id]
  );
  if (result.rows.length === 0) throw new Error('Paciente no encontrado');
  return result.rows[0];
};

// DELETE
const eliminarPaciente = async (id) => {
  const result = await pool.query('DELETE FROM pacientes WHERE id=$1 RETURNING *', [id]);
  if (result.rows.length === 0) throw new Error('Paciente no encontrado');
};

module.exports = {
  obtenerPacientes,
  obtenerPacientePorId,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
};