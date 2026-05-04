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
  const { 
    nombre, apellido, sexo, cuil, email, telefono,
    calle, numero, codigo_postal, piso, departamento,
    provincia_nombre, localidad_nombre, foto_url
  } = data;

  const result = await pool.query(
    `INSERT INTO profesionales (
      nombre, apellido, sexo, cuil, email, telefono,
      calle, numero, codigo_postal, piso, departamento,
      provincia_nombre, localidad_nombre, foto_url
    )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [
      nombre, apellido, sexo, cuil, email, telefono,
      calle, numero, codigo_postal, piso, departamento,
      provincia_nombre, localidad_nombre, foto_url
    ]
  );

  return result.rows[0];
};

// PUT
const actualizarProfesional = async (id, data) => {
  const { 
    nombre, apellido, sexo, cuil, email, telefono,
    calle, numero, codigo_postal, piso, departamento,
    provincia_nombre, localidad_nombre, foto_url
  } = data;

  const result = await pool.query(
    `UPDATE profesionales SET 
      nombre=$1, apellido=$2, sexo=$3, cuil=$4, email=$5, telefono=$6,
      calle=$7, numero=$8, codigo_postal=$9, piso=$10, departamento=$11,
      provincia_nombre=$12, localidad_nombre=$13, foto_url=$14,
      fecha_modificacion=CURRENT_TIMESTAMP 
     WHERE id=$15 RETURNING *`,
    [
      nombre, apellido, sexo, cuil, email, telefono,
      calle, numero, codigo_postal, piso, departamento,
      provincia_nombre, localidad_nombre, foto_url,
      id
    ]
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