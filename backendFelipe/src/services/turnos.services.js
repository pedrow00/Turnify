const pool = require('../config/db');

const obtenerTurnos = async () => {
  const result = await pool.query(`
    SELECT t.*,
      json_build_object('id', p.id, 'nombre', p.nombre, 'apellido', p.apellido) AS paciente,
      json_build_object('id', pr.id, 'nombre', pr.nombre, 'apellido', pr.apellido) AS profesional,
      json_build_object('id', c.id, 'numero_consultorio', c.numero_consultorio) AS consultorio,
      json_build_object('id', e.id, 'nombre', e.nombre) AS especialidad
    FROM turnos t
    LEFT JOIN pacientes p ON t.paciente_id = p.id
    LEFT JOIN profesionales pr ON t.profesional_id = pr.id
    LEFT JOIN consultorios c ON t.consultorio_id = c.id
    LEFT JOIN especialidades e ON t.especialidad_id = e.id
    ORDER BY t.fecha, t.hora_inicio
  `);
  return result.rows;
};

const obtenerTurnoPorId = async (id) => {
  const result = await pool.query('SELECT * FROM turnos WHERE id=$1', [id]);
  if (result.rows.length === 0) throw new Error('Turno no encontrado');
  return result.rows[0];
};

const crearTurno = async (data) => {
  const { fecha, hora_inicio, hora_fin, paciente_id, profesional_id, consultorio_id, especialidad_id, motivo_consulta } = data;
  const result = await pool.query(
    `INSERT INTO turnos (fecha, hora_inicio, hora_fin, paciente_id, profesional_id, consultorio_id, especialidad_id, motivo_consulta)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [fecha, hora_inicio, hora_fin, paciente_id, profesional_id, consultorio_id, especialidad_id, motivo_consulta]
  );
  return result.rows[0];
};

const actualizarTurno = async (id, data) => {
  const { fecha, hora_inicio, hora_fin, paciente_id, profesional_id, consultorio_id, especialidad_id, motivo_consulta } = data;
  const result = await pool.query(
    `UPDATE turnos SET fecha=$1, hora_inicio=$2, hora_fin=$3, paciente_id=$4, profesional_id=$5, consultorio_id=$6, especialidad_id=$7, motivo_consulta=$8
     WHERE id=$9 RETURNING *`,
    [fecha, hora_inicio, hora_fin, paciente_id, profesional_id, consultorio_id, especialidad_id, motivo_consulta, id]
  );
  if (result.rows.length === 0) throw new Error('Turno no encontrado');
  return result.rows[0];
};

const eliminarTurno = async (id) => {
  const result = await pool.query('DELETE FROM turnos WHERE id=$1 RETURNING *', [id]);
  if (result.rows.length === 0) throw new Error('Turno no encontrado');
};

module.exports = {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  eliminarTurno
};