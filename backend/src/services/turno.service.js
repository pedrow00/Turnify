const pool = require('../config/db');

const DURACION_TURNO_MINUTOS = 15;

const normalizeTime = (time) => String(time || '').slice(0, 5);

const toMinutes = (time) => {
  const [hours, minutes] = normalizeTime(time).split(':').map(Number);
  return hours * 60 + minutes;
};

const fromMinutes = (minutes) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mins = String(minutes % 60).padStart(2, '0');
  return `${hours}:${mins}`;
};

const getDiaSemana = (fecha) => {
  const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  return dias[new Date(`${fecha}T12:00:00`).getDay()];
};

const validarDatosTurno = async (data, turnoId = null) => {
  const {
    fecha,
    hora_inicio,
    paciente_id,
    profesional_id,
    especialidad_id,
    estado,
    motivo_consulta,
  } = data;

  if (
    !fecha ||
    !hora_inicio ||
    !paciente_id ||
    !profesional_id ||
    !especialidad_id ||
    !estado ||
    !String(motivo_consulta || '').trim()
  ) {
    throw new Error('Faltan datos obligatorios');
  }

  const fechaValida = await pool.query(
    `SELECT
      $1::date < CURRENT_DATE AS es_pasada,
      EXTRACT(ISODOW FROM $1::date) IN (6, 7) AS es_fin_de_semana`,
    [fecha]
  );

  if (fechaValida.rows[0].es_pasada) {
    throw new Error('No se pueden registrar turnos en fechas pasadas.');
  }

  if (fechaValida.rows[0].es_fin_de_semana) {
    throw new Error('No se pueden registrar turnos los sabados ni domingos.');
  }

  const horaInicio = normalizeTime(hora_inicio);
  const horaFin = fromMinutes(toMinutes(horaInicio) + DURACION_TURNO_MINUTOS);
  const diaSemana = getDiaSemana(fecha);

  const especialidadProfesional = await pool.query(
    `SELECT 1
     FROM profesional_especialidades
     WHERE profesional_id=$1 AND especialidad_id=$2
     UNION
     SELECT 1
     FROM profesionales
     WHERE id=$1 AND especialidad_id=$2
     LIMIT 1`,
    [profesional_id, especialidad_id]
  );

  if (especialidadProfesional.rows.length === 0) {
    throw new Error('El profesional no atiende la especialidad seleccionada.');
  }

  const indisponibilidadProfesional = await pool.query(
    `SELECT 1
     FROM profesionales
     WHERE id=$1
       AND indisponibilidad_desde IS NOT NULL
       AND indisponibilidad_hasta IS NOT NULL
       AND $2::date BETWEEN indisponibilidad_desde AND indisponibilidad_hasta
     LIMIT 1`,
    [profesional_id, fecha]
  );

  if (indisponibilidadProfesional.rows.length > 0) {
    throw new Error('El profesional no esta disponible en la fecha seleccionada.');
  }

  const horarioProfesional = await pool.query(
    `SELECT 1
     FROM horarios_profesionales
     WHERE profesional_id=$1
       AND activo IS NOT FALSE
       AND lower(dia)=$2
       AND hora_inicio <= $3::time
       AND hora_fin >= $4::time
     LIMIT 1`,
    [profesional_id, diaSemana, horaInicio, horaFin]
  );

  if (horarioProfesional.rows.length === 0) {
    throw new Error('El horario seleccionado no corresponde con los horarios definidos para el profesional.');
  }

  const excludeTurno = turnoId ? 'AND id <> $5' : '';

  const conflictoProfesional = await pool.query(
    `SELECT 1 FROM turnos
     WHERE fecha=$1
       AND estado <> 'cancelado'
       ${excludeTurno}
       AND profesional_id=$4
       AND hora_inicio < $3::time
       AND $2::time < hora_fin
     LIMIT 1`,
    turnoId
      ? [fecha, horaInicio, horaFin, profesional_id, turnoId]
      : [fecha, horaInicio, horaFin, profesional_id]
  );

  if (conflictoProfesional.rows.length > 0) {
    throw new Error('El profesional ya tiene un turno superpuesto en ese horario.');
  }

  const conflictoPaciente = await pool.query(
    `SELECT 1 FROM turnos
     WHERE fecha=$1
       AND estado <> 'cancelado'
       ${excludeTurno}
       AND paciente_id=$4
       AND hora_inicio < $3::time
       AND $2::time < hora_fin
     LIMIT 1`,
    turnoId
      ? [fecha, horaInicio, horaFin, paciente_id, turnoId]
      : [fecha, horaInicio, horaFin, paciente_id]
  );

  if (conflictoPaciente.rows.length > 0) {
    throw new Error('El paciente ya tiene un turno superpuesto en ese horario.');
  }

  const consultorioDisponible = await pool.query(
    `SELECT c.id
     FROM profesional_consultorios pc
     JOIN consultorios c ON c.id = pc.consultorio_id
     JOIN consultorio_especialidades ce
       ON ce.consultorio_id = c.id
      AND ce.especialidad_id = $4
     WHERE pc.profesional_id = $5
       AND c.activo IS NOT FALSE
       AND NOT EXISTS (
         SELECT 1
         FROM turnos t
         WHERE t.fecha=$1
           AND t.estado <> 'cancelado'
           ${turnoId ? 'AND t.id <> $6' : ''}
           AND t.consultorio_id=c.id
           AND t.hora_inicio < $3::time
           AND $2::time < t.hora_fin
       )
     ORDER BY c.numero_consultorio
     LIMIT 1`,
    turnoId
      ? [fecha, horaInicio, horaFin, especialidad_id, profesional_id, turnoId]
      : [fecha, horaInicio, horaFin, especialidad_id, profesional_id]
  );

  if (consultorioDisponible.rows.length === 0) {
    throw new Error('No hay consultorios asignados y disponibles para ese profesional, especialidad y horario.');
  }

  return {
    ...data,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    consultorio_id: consultorioDisponible.rows[0].id,
  };
};

// POST CREAR
const crearTurno = async (data) => {
  const {
    fecha,
    hora_inicio,
    hora_fin,
    paciente_id,
    profesional_id,
    consultorio_id,
    especialidad_id,
    estado,
    motivo_consulta,
  } = await validarDatosTurno(data);

  const result = await pool.query(
    `INSERT INTO turnos
    (fecha, hora_inicio, hora_fin, paciente_id, profesional_id, consultorio_id, especialidad_id, estado, motivo_consulta)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
    [fecha, hora_inicio, hora_fin, paciente_id, profesional_id, consultorio_id, especialidad_id, estado, motivo_consulta]
  );

  return result.rows[0];
};

// GET TODOS
const getTurnos = async () => {
  const result = await pool.query(`
    SELECT t.*,
      json_build_object('id', p.id,'nombre', p.nombre,'apellido', p.apellido) AS paciente,
      json_build_object('id', pr.id,'nombre', pr.nombre,'apellido', pr.apellido) AS profesional,
      json_build_object('id', c.id,'numero_consultorio', c.numero_consultorio) AS consultorio,
      json_build_object('id', e.id,'nombre', e.nombre) AS especialidad
    FROM turnos t
    LEFT JOIN pacientes p ON t.paciente_id = p.id
    LEFT JOIN profesionales pr ON t.profesional_id = pr.id
    LEFT JOIN consultorios c ON t.consultorio_id = c.id
    LEFT JOIN especialidades e ON t.especialidad_id = e.id
    WHERE t.fecha >= CURRENT_DATE
    ORDER BY t.fecha, t.hora_inicio
  `);

  return result.rows;
};

// GET por ID
const obtenerTurnoPorId = async (id) => {
  const result = await pool.query('SELECT * FROM turnos WHERE id = $1', [id]);
  if (result.rows.length === 0) throw new Error('Turno no encontrado');
  return result.rows[0];
};

// PUT
const actualizarTurno = async (id, data) => {
  const {
    fecha,
    hora_inicio,
    hora_fin,
    paciente_id,
    profesional_id,
    consultorio_id,
    especialidad_id,
    motivo_consulta,
    estado,
  } = await validarDatosTurno(data, id);

  const result = await pool.query(
    `UPDATE turnos SET
      fecha=$1,
      hora_inicio=$2,
      hora_fin=$3,
      paciente_id=$4,
      profesional_id=$5,
      consultorio_id=$6,
      especialidad_id=$7,
      motivo_consulta=$8,
      estado=$9,
      fecha_modificacion=CURRENT_TIMESTAMP
     WHERE id=$10 RETURNING *`,
    [fecha, hora_inicio, hora_fin, paciente_id, profesional_id, consultorio_id, especialidad_id, motivo_consulta, estado, id]
  );

  if (result.rows.length === 0) throw new Error('Turno no encontrado');
  return result.rows[0];
};

// DELETE
const eliminarTurno = async (id) => {
  const result = await pool.query(
    'DELETE FROM turnos WHERE id=$1 RETURNING *',
    [id]
  );
  if (result.rows.length === 0) throw new Error('Turno no encontrado');

  return result.rows[0];
};

module.exports = {
  crearTurno,
  getTurnos,
  obtenerTurnoPorId,
  actualizarTurno,
  eliminarTurno,
};
