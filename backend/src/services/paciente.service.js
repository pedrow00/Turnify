const pool = require('../config/db');
const { getFriendlyDbError } = require('../utils/dbErrors');

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
  const { 
    nombre, apellido, dni, email, telefono, fecha_nacimiento, 
    provincia_id, provincia_nombre, localidad_id, localidad_nombre,
    calle, numero, codigo_postal, piso, dpto, observaciones
  } = data;

  try {
    const result = await pool.query(
      `INSERT INTO pacientes (
        nombre, apellido, dni, email, telefono, fecha_nacimiento,
        provincia_id, provincia_nombre, localidad_id, localidad_nombre,
        calle, numero, codigo_postal, piso, dpto, observaciones
      )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        nombre, apellido, dni, email, telefono, fecha_nacimiento,
        provincia_id, provincia_nombre, localidad_id, localidad_nombre,
        calle, numero, codigo_postal, piso, dpto, observaciones
      ]
    );

    return result.rows[0];
  } catch (error) {
    throw getFriendlyDbError(error, 'create');
  }
};

// PUT
const actualizarPaciente = async (id, data) => {
  const { 
    nombre, apellido, dni, email, telefono, fecha_nacimiento,
    provincia_id, provincia_nombre, localidad_id, localidad_nombre,
    calle, numero, codigo_postal, piso, dpto, observaciones
  } = data;

  try {
    const result = await pool.query(
      `UPDATE pacientes SET 
        nombre=$1, apellido=$2, dni=$3, email=$4, telefono=$5, fecha_nacimiento=$6,
        provincia_id=$7, provincia_nombre=$8, localidad_id=$9, localidad_nombre=$10,
        calle=$11, numero=$12, codigo_postal=$13, piso=$14, dpto=$15, observaciones=$16,
        fecha_modificacion=CURRENT_TIMESTAMP
       WHERE id=$17 RETURNING *`,
      [
        nombre, apellido, dni, email, telefono, fecha_nacimiento,
        provincia_id, provincia_nombre, localidad_id, localidad_nombre,
        calle, numero, codigo_postal, piso, dpto, observaciones,
        id
      ]
    );

    if (result.rows.length === 0) throw new Error('Paciente no encontrado');
    return result.rows[0];
  } catch (error) {
    throw getFriendlyDbError(error, 'update');
  }
};

// DELETE
const eliminarPaciente = async (id) => {
  const result = await pool.query('DELETE FROM pacientes WHERE id=$1 RETURNING *', [id]);
  if (result.rows.length === 0) throw new Error('Paciente no encontrado');
  return result.rows[0];
};

module.exports = { obtenerPacientes, obtenerPacientePorId, crearPaciente, actualizarPaciente, eliminarPaciente };
