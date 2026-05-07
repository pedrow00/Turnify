const pool = require('../config/db');
const { getFriendlyDbError } = require('../utils/dbErrors');

const selectProfesionalesBase = `
  SELECT p.*, e.nombre AS especialidad_nombre,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', hp.id,
            'dia', hp.dia,
            'hora_inicio', hp.hora_inicio,
            'hora_fin', hp.hora_fin,
            'activo', hp.activo
          )
          ORDER BY
            CASE lower(hp.dia)
              WHEN 'lunes' THEN 1
              WHEN 'martes' THEN 2
              WHEN 'miercoles' THEN 3
              WHEN 'miércoles' THEN 3
              WHEN 'jueves' THEN 4
              WHEN 'viernes' THEN 5
              WHEN 'sabado' THEN 6
              WHEN 'sábado' THEN 6
              WHEN 'domingo' THEN 7
              ELSE 8
            END,
            hp.hora_inicio
        )
        FROM horarios_profesionales hp
        WHERE hp.profesional_id = p.id
      ),
      '[]'::json
    ) AS horarios
  FROM profesionales p
  LEFT JOIN especialidades e ON p.especialidad_id = e.id
`;

const toMinutes = (time) => {
  const [hours, minutes] = String(time || '').slice(0, 5).split(':').map(Number);
  return hours * 60 + minutes;
};

const validarHorariosProfesional = (horarios = []) => {
  const horariosValidos = horarios.filter(
    (horario) => horario?.dia && horario?.hora_inicio && horario?.hora_fin
  );

  for (const horario of horariosValidos) {
    if (toMinutes(horario.hora_fin) <= toMinutes(horario.hora_inicio)) {
      throw new Error('La hora de fin debe ser posterior a la hora de inicio.');
    }
  }

  for (let i = 0; i < horariosValidos.length; i += 1) {
    for (let j = i + 1; j < horariosValidos.length; j += 1) {
      const horarioA = horariosValidos[i];
      const horarioB = horariosValidos[j];

      if (String(horarioA.dia).toLowerCase() !== String(horarioB.dia).toLowerCase()) {
        continue;
      }

      const inicioA = toMinutes(horarioA.hora_inicio);
      const finA = toMinutes(horarioA.hora_fin);
      const inicioB = toMinutes(horarioB.hora_inicio);
      const finB = toMinutes(horarioB.hora_fin);

      if (inicioA < finB && inicioB < finA) {
        throw new Error('Hay horarios superpuestos para el mismo dia.');
      }
    }
  }

  return horariosValidos;
};

const guardarHorariosProfesional = async (client, profesionalId, horarios = []) => {
  const horariosValidos = validarHorariosProfesional(horarios);

  await client.query('DELETE FROM horarios_profesionales WHERE profesional_id=$1', [profesionalId]);

  for (const horario of horariosValidos) {
    await client.query(
      `INSERT INTO horarios_profesionales
        (profesional_id, dia, hora_inicio, hora_fin, activo)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        profesionalId,
        horario.dia,
        horario.hora_inicio,
        horario.hora_fin,
        horario.activo ?? true,
      ]
    );
  }
};

// GET todos
const obtenerProfesionales = async () => {
  const result = await pool.query(`
    ${selectProfesionalesBase}
    ORDER BY p.apellido, p.nombre
  `);
  return result.rows;
};

// GET por ID
const obtenerProfesionalPorId = async (id) => {
  const result = await pool.query(`
    ${selectProfesionalesBase}
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
    provincia_nombre, localidad_nombre, foto_url, especialidad_id, horarios = []
  } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
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

    await guardarHorariosProfesional(client, result.rows[0].id, horarios);
    await client.query('COMMIT');

    return obtenerProfesionalPorId(result.rows[0].id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw getFriendlyDbError(error, 'create');
  } finally {
    client.release();
  }
};

// PUT
const actualizarProfesional = async (id, data) => {
  const { 
    nombre, apellido, sexo, cuil, matricula, email, telefono,
    calle, numero, codigo_postal, piso, departamento,
    provincia_nombre, localidad_nombre, foto_url, especialidad_id, horarios = []
  } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
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

    await guardarHorariosProfesional(client, id, horarios);
    await client.query('COMMIT');

    return obtenerProfesionalPorId(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw getFriendlyDbError(error, 'update');
  } finally {
    client.release();
  }
};

// DELETE
const eliminarProfesional = async (id) => {
  const result = await pool.query('DELETE FROM profesionales WHERE id=$1 RETURNING *', [id]);
  if (result.rows.length === 0) throw new Error('Profesional no encontrado');
};

module.exports = { obtenerProfesionales, obtenerProfesionalPorId, crearProfesional, actualizarProfesional, eliminarProfesional };
