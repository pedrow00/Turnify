const pool = require('../config/db');
const { getFriendlyDbError } = require('../utils/dbErrors');

const consultorioConEspecialidadesQuery = `
  SELECT
    c.*,
    COALESCE(
      json_agg(
        json_build_object('id', e.id, 'nombre', e.nombre)
        ORDER BY e.nombre
      ) FILTER (WHERE e.id IS NOT NULL),
      '[]'::json
    ) AS especialidades
  FROM consultorios c
  LEFT JOIN consultorio_especialidades ce ON ce.consultorio_id = c.id
  LEFT JOIN especialidades e ON e.id = ce.especialidad_id
`;

const normalizarEspecialidadIds = (data) => {
  const ids = data.especialidad_ids ?? data.especialidades_ids ?? [];

  if (!Array.isArray(ids)) {
    throw new Error('Las especialidades deben enviarse como una lista de ids.');
  }

  return [...new Set(ids.map((id) => Number(id)))]
    .filter((id) => Number.isInteger(id) && id > 0);
};

const insertarEspecialidadesConsultorio = async (client, consultorioId, especialidadIds) => {
  if (especialidadIds.length === 0) return;

  const values = especialidadIds
    .map((_, index) => `($1, $${index + 2})`)
    .join(', ');

  await client.query(
    `INSERT INTO consultorio_especialidades (consultorio_id, especialidad_id)
     VALUES ${values}`,
    [consultorioId, ...especialidadIds]
  );
};

// GET todos
const obtenerConsultorios = async () => {
  const result = await pool.query(`
    ${consultorioConEspecialidadesQuery}
    GROUP BY c.id
    ORDER BY c.numero_consultorio
  `);
  return result.rows;
};

// GET por ID
const obtenerConsultorioPorId = async (id) => {
  const result = await pool.query(`
    ${consultorioConEspecialidadesQuery}
    WHERE c.id=$1
    GROUP BY c.id
  `, [id]);
  if (result.rows.length === 0) throw new Error('Consultorio no encontrado');
  return result.rows[0];
};

// POST
const crearConsultorio = async (data) => {
  const { numero_consultorio, piso, ubicacion, activo } = data;
  const especialidadIds = normalizarEspecialidadIds(data);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO consultorios (numero_consultorio, piso, ubicacion, activo)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [numero_consultorio, piso, ubicacion, activo]
    );

    await insertarEspecialidadesConsultorio(client, result.rows[0].id, especialidadIds);
    await client.query('COMMIT');

    return obtenerConsultorioPorId(result.rows[0].id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw getFriendlyDbError(error, 'create');
  } finally {
    client.release();
  }
};

// PUT
const actualizarConsultorio = async (id, data) => {
  const { numero_consultorio, piso, ubicacion, activo } = data;
  const especialidadIds = normalizarEspecialidadIds(data);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE consultorios SET 
        numero_consultorio=$1, 
        piso=$2, 
        ubicacion=$3, 
        activo=COALESCE($4, activo)
       WHERE id=$5 RETURNING *`,
      [numero_consultorio, piso, ubicacion, activo, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Consultorio no encontrado');
    }

    await client.query('DELETE FROM consultorio_especialidades WHERE consultorio_id=$1', [id]);
    await insertarEspecialidadesConsultorio(client, id, especialidadIds);
    await client.query('COMMIT');

    return obtenerConsultorioPorId(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw getFriendlyDbError(error, 'update');
  } finally {
    client.release();
  }
};

// DELETE
const eliminarConsultorio = async (id) => {
  const result = await pool.query('DELETE FROM consultorios WHERE id=$1 RETURNING *', [id]);
  if (result.rows.length === 0) throw new Error('Consultorio no encontrado');
};

module.exports = { obtenerConsultorios, obtenerConsultorioPorId, crearConsultorio, actualizarConsultorio, eliminarConsultorio };
