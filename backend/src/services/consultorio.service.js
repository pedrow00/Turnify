const pool = require('../config/db');
const { getFriendlyDbError } = require('../utils/dbErrors');

// GET todos
const obtenerConsultorios = async () => {
  const result = await pool.query('SELECT * FROM consultorios ORDER BY numero_consultorio');
  return result.rows;
};

// GET por ID
const obtenerConsultorioPorId = async (id) => {
  const result = await pool.query('SELECT * FROM consultorios WHERE id=$1', [id]);
  if (result.rows.length === 0) throw new Error('Consultorio no encontrado');
  return result.rows[0];
};

// POST
const crearConsultorio = async (data) => {
  const { numero_consultorio, piso, ubicacion, activo } = data;

  try {
    const result = await pool.query(
      `INSERT INTO consultorios (numero_consultorio, piso, ubicacion, activo)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [numero_consultorio, piso, ubicacion, activo]
    );

    return result.rows[0];
  } catch (error) {
    throw getFriendlyDbError(error, 'create');
  }
};

// PUT
const actualizarConsultorio = async (id, data) => {
  const { numero_consultorio, piso, ubicacion, activo } = data;

  try {
    const result = await pool.query(
      `UPDATE consultorios SET 
        numero_consultorio=$1, 
        piso=$2, 
        ubicacion=$3, 
        activo=COALESCE($4, activo)
       WHERE id=$5 RETURNING *`,
      [numero_consultorio, piso, ubicacion, activo, id]
    );

    if (result.rows.length === 0) throw new Error('Consultorio no encontrado');
    return result.rows[0];
  } catch (error) {
    throw getFriendlyDbError(error, 'update');
  }
};

// DELETE
const eliminarConsultorio = async (id) => {
  const result = await pool.query('DELETE FROM consultorios WHERE id=$1 RETURNING *', [id]);
  if (result.rows.length === 0) throw new Error('Consultorio no encontrado');
};

module.exports = { obtenerConsultorios, obtenerConsultorioPorId, crearConsultorio, actualizarConsultorio, eliminarConsultorio };
