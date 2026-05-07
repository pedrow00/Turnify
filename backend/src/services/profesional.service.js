const pool = require('../config/db');
const { getFriendlyDbError } = require('../utils/dbErrors');

// GET todos
const obtenerProfesionales = async () => {
  const result = await pool.query(`
    SELECT p.*, e.nombre AS especialidad_nombre
    FROM profesionales p
    LEFT JOIN especialidades e ON p.especialidad_id = e.id
    ORDER BY p.apellido, p.nombre
  `);
  return result.rows;
};

// GET por ID
const obtenerProfesionalPorId = async (id) => {
  const result = await pool.query(`
    SELECT p.*, e.nombre AS especialidad_nombre
    FROM profesionales p
    LEFT JOIN especialidades e ON p.especialidad_id = e.id
    WHERE p.id=$1
  `, [id]);
  if (result.rows.length === 0) throw new Error('Profesional no encontrado');
  return result.rows[0];
};

// POST
const crearProfesional = async (data) => {
  const { 
    nombre, apellido, sexo, cuil, matricula, email, telefono,
    calle, numero, codigo_postal, piso, departamento,
    provincia_nombre, localidad_nombre, foto_url, especialidad_id
  } = data;

  try {
    const result = await pool.query(
      `INSERT INTO profesionales (
        nombre, apellido, sexo, cuil, matricula, email, telefono,
        calle, numero, codigo_postal, piso, departamento,
        provincia_nombre, localidad_nombre, foto_url, especialidad_id
      )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        nombre, apellido, sexo, cuil, matricula, email, telefono,
        calle, numero, codigo_postal, piso, departamento,
        provincia_nombre, localidad_nombre, foto_url, especialidad_id
      ]
    );

    return result.rows[0];
  } catch (error) {
    throw getFriendlyDbError(error, 'create');
  }
};

// PUT
const actualizarProfesional = async (id, data) => {
  const { 
    nombre, apellido, sexo, cuil, matricula, email, telefono,
    calle, numero, codigo_postal, piso, departamento,
    provincia_nombre, localidad_nombre, foto_url, especialidad_id
  } = data;

  try {
    const result = await pool.query(
      `UPDATE profesionales SET 
        nombre=$1, apellido=$2, sexo=$3, cuil=$4, matricula=$5, email=$6, telefono=$7,
        calle=$8, numero=$9, codigo_postal=$10, piso=$11, departamento=$12,
        provincia_nombre=$13, localidad_nombre=$14, foto_url=$15, especialidad_id=$16,
        fecha_modificacion=CURRENT_TIMESTAMP 
       WHERE id=$17 RETURNING *`,
      [
        nombre, apellido, sexo, cuil, matricula, email, telefono,
        calle, numero, codigo_postal, piso, departamento,
        provincia_nombre, localidad_nombre, foto_url, especialidad_id,
        id
      ]
    );

    if (result.rows.length === 0) throw new Error('Profesional no encontrado');
    return result.rows[0];
  } catch (error) {
    throw getFriendlyDbError(error, 'update');
  }
};

// DELETE
const eliminarProfesional = async (id) => {
  const result = await pool.query('DELETE FROM profesionales WHERE id=$1 RETURNING *', [id]);
  if (result.rows.length === 0) throw new Error('Profesional no encontrado');
};

module.exports = { obtenerProfesionales, obtenerProfesionalPorId, crearProfesional, actualizarProfesional, eliminarProfesional };
