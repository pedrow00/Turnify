const pool = require('../config/db');
const { getFriendlyDbError } = require('../utils/dbErrors');

const selectProfesionalesBase = `
  SELECT p.*, e.nombre AS especialidad_nombre,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', pe.especialidad_id,
            'nombre', esp.nombre,
            'matricula', pe.matricula,
            'es_principal', pe.es_principal
          )
          ORDER BY pe.es_principal DESC, esp.nombre
        )
        FROM profesional_especialidades pe
        JOIN especialidades esp ON esp.id = pe.especialidad_id
        WHERE pe.profesional_id = p.id
      ),
      CASE
        WHEN p.especialidad_id IS NULL THEN '[]'::json
        ELSE json_build_array(
          json_build_object(
            'id', p.especialidad_id,
            'nombre', e.nombre,
            'matricula', p.matricula,
            'es_principal', true
          )
        )
      END
    ) AS especialidades,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', c.id,
            'numero_consultorio', c.numero_consultorio,
            'piso', c.piso,
            'ubicacion', c.ubicacion,
            'activo', c.activo
          )
          ORDER BY c.numero_consultorio
        )
        FROM profesional_consultorios pc
        JOIN consultorios c ON c.id = pc.consultorio_id
        WHERE pc.profesional_id = p.id
      ),
      '[]'::json
    ) AS consultorios,
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

const validarIndisponibilidadProfesional = (data) => {
  const desde = data.indisponibilidad_desde || null;
  const hasta = data.indisponibilidad_hasta || null;
  const motivo = String(data.indisponibilidad_motivo || '').trim() || null;

  if (!desde && !hasta && !motivo) {
    return {
      indisponibilidad_desde: null,
      indisponibilidad_hasta: null,
      indisponibilidad_motivo: null,
    };
  }

  if (!desde || !hasta) {
    throw new Error('Debes indicar fecha de inicio y fin del periodo de indisponibilidad.');
  }

  if (desde > hasta) {
    throw new Error('La fecha de inicio de indisponibilidad debe ser anterior o igual a la fecha de fin.');
  }

  if (!motivo) {
    throw new Error('Indica el motivo de la indisponibilidad.');
  }

  return {
    indisponibilidad_desde: desde,
    indisponibilidad_hasta: hasta,
    indisponibilidad_motivo: motivo,
  };
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

const normalizarEspecialidadesProfesional = (data) => {
  const source = Array.isArray(data.especialidades) && data.especialidades.length > 0
    ? data.especialidades
    : data.especialidad_id
      ? [{ especialidad_id: data.especialidad_id, matricula: data.matricula, es_principal: true }]
      : [];

  const especialidades = source
    .map((item) => ({
      especialidad_id: Number(item.especialidad_id ?? item.id),
      matricula: String(item.matricula ?? '').trim(),
      es_principal: item.es_principal === true,
    }))
    .filter((item) => Number.isInteger(item.especialidad_id) && item.especialidad_id > 0);

  if (especialidades.length === 0) {
    throw new Error('Selecciona al menos una especialidad.');
  }

  const ids = new Set();
  for (const especialidad of especialidades) {
    if (ids.has(especialidad.especialidad_id)) {
      throw new Error('No se puede repetir la misma especialidad.');
    }
    ids.add(especialidad.especialidad_id);

    if (!/^[A-Za-z0-9 -]{3,50}$/.test(especialidad.matricula)) {
      throw new Error('Ingresa una matricula valida para cada especialidad.');
    }
  }

  const principales = especialidades.filter((item) => item.es_principal);
  if (principales.length !== 1) {
    throw new Error('Debe haber exactamente una especialidad con matricula principal.');
  }

  return especialidades;
};

const normalizarConsultorioIds = (consultorioIds = []) => {
  if (!Array.isArray(consultorioIds)) {
    throw new Error('Los consultorios deben enviarse como una lista de ids.');
  }

  return [...new Set(consultorioIds.map((id) => Number(id)))]
    .filter((id) => Number.isInteger(id) && id > 0);
};

const validarConsultoriosProfesional = async (client, especialidades, consultorioIds) => {
  if (consultorioIds.length === 0) {
    throw new Error('Selecciona al menos un consultorio para el profesional.');
  }

  const especialidadIds = especialidades.map((item) => item.especialidad_id);
  const result = await client.query(
    `SELECT c.id, c.numero_consultorio,
      COUNT(ce.especialidad_id) FILTER (WHERE ce.especialidad_id = ANY($2::int[])) AS coincidencias
     FROM consultorios c
     LEFT JOIN consultorio_especialidades ce ON ce.consultorio_id = c.id
     WHERE c.id = ANY($1::int[])
     GROUP BY c.id`,
    [consultorioIds, especialidadIds]
  );

  if (result.rows.length !== consultorioIds.length) {
    throw new Error('Uno o mas consultorios seleccionados no existen.');
  }

  const consultorioInvalido = result.rows.find((row) => Number(row.coincidencias) === 0);
  if (consultorioInvalido) {
    throw new Error(`El consultorio ${consultorioInvalido.numero_consultorio} no admite las especialidades seleccionadas.`);
  }
};

const guardarEspecialidadesProfesional = async (client, profesionalId, especialidades) => {
  await client.query('DELETE FROM profesional_especialidades WHERE profesional_id=$1', [profesionalId]);

  for (const especialidad of especialidades) {
    await client.query(
      `INSERT INTO profesional_especialidades
        (profesional_id, especialidad_id, matricula, es_principal)
       VALUES ($1,$2,$3,$4)`,
      [
        profesionalId,
        especialidad.especialidad_id,
        especialidad.matricula,
        especialidad.es_principal,
      ]
    );
  }
};

const guardarConsultoriosProfesional = async (client, profesionalId, consultorioIds) => {
  await client.query('DELETE FROM profesional_consultorios WHERE profesional_id=$1', [profesionalId]);

  for (const consultorioId of consultorioIds) {
    await client.query(
      `INSERT INTO profesional_consultorios (profesional_id, consultorio_id)
       VALUES ($1,$2)`,
      [profesionalId, consultorioId]
    );
  }
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
    nombre, apellido, sexo, cuil, email, telefono,
    calle, numero, codigo_postal, piso, departamento,
    provincia_nombre, localidad_nombre, foto_url, horarios = []
  } = data;
  const especialidades = normalizarEspecialidadesProfesional(data);
  const principal = especialidades.find((item) => item.es_principal);
  const consultorioIds = normalizarConsultorioIds(data.consultorio_ids);
  const indisponibilidad = validarIndisponibilidadProfesional(data);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await validarConsultoriosProfesional(client, especialidades, consultorioIds);

    const result = await client.query(
      `INSERT INTO profesionales (
        nombre, apellido, sexo, cuil, matricula, email, telefono,
        calle, numero, codigo_postal, piso, departamento,
        provincia_nombre, localidad_nombre, foto_url, especialidad_id,
        indisponibilidad_desde, indisponibilidad_hasta, indisponibilidad_motivo
      )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [
        nombre, apellido, sexo, cuil, principal.matricula, email, telefono,
        calle, numero, codigo_postal, piso, departamento,
        provincia_nombre, localidad_nombre, foto_url, principal.especialidad_id,
        indisponibilidad.indisponibilidad_desde,
        indisponibilidad.indisponibilidad_hasta,
        indisponibilidad.indisponibilidad_motivo,
      ]
    );

    await guardarEspecialidadesProfesional(client, result.rows[0].id, especialidades);
    await guardarConsultoriosProfesional(client, result.rows[0].id, consultorioIds);
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
    nombre, apellido, sexo, cuil, email, telefono,
    calle, numero, codigo_postal, piso, departamento,
    provincia_nombre, localidad_nombre, foto_url, horarios = []
  } = data;
  const especialidades = normalizarEspecialidadesProfesional(data);
  const principal = especialidades.find((item) => item.es_principal);
  const consultorioIds = normalizarConsultorioIds(data.consultorio_ids);
  const indisponibilidad = validarIndisponibilidadProfesional(data);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await validarConsultoriosProfesional(client, especialidades, consultorioIds);

    const result = await client.query(
      `UPDATE profesionales SET 
        nombre=$1, apellido=$2, sexo=$3, cuil=$4, matricula=$5, email=$6, telefono=$7,
        calle=$8, numero=$9, codigo_postal=$10, piso=$11, departamento=$12,
        provincia_nombre=$13, localidad_nombre=$14, foto_url=$15, especialidad_id=$16,
        indisponibilidad_desde=$17, indisponibilidad_hasta=$18, indisponibilidad_motivo=$19,
        fecha_modificacion=CURRENT_TIMESTAMP 
       WHERE id=$20 RETURNING *`,
      [
        nombre, apellido, sexo, cuil, principal.matricula, email, telefono,
        calle, numero, codigo_postal, piso, departamento,
        provincia_nombre, localidad_nombre, foto_url, principal.especialidad_id,
        indisponibilidad.indisponibilidad_desde,
        indisponibilidad.indisponibilidad_hasta,
        indisponibilidad.indisponibilidad_motivo,
        id
      ]
    );

    if (result.rows.length === 0) throw new Error('Profesional no encontrado');

    await guardarEspecialidadesProfesional(client, id, especialidades);
    await guardarConsultoriosProfesional(client, id, consultorioIds);
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
