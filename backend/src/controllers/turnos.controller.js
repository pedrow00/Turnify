const pool = require('../config/db');

const crearTurno = async (req, res) => {
  try {
    const {
      fecha,
      hora_inicio,
      hora_fin,
      paciente_id,
      profesional_id,
      consultorio_id,
      especialidad_id,
      motivo_consulta
    } = req.body;

    // 🔴 Validación básica
    if (!fecha || !hora_inicio || !hora_fin || !paciente_id || !profesional_id || !consultorio_id || !especialidad_id) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // 🔴 Verificar conflicto profesional
    const conflictoProfesional = await pool.query(
      `SELECT * FROM turnos 
       WHERE fecha = $1 
       AND hora_inicio = $2 
       AND profesional_id = $3`,
      [fecha, hora_inicio, profesional_id]
    );

    if (conflictoProfesional.rows.length > 0) {
      return res.status(400).json({ error: 'El profesional ya tiene un turno en ese horario' });
    }

    // 🔴 Verificar conflicto consultorio
    const conflictoConsultorio = await pool.query(
      `SELECT * FROM turnos 
       WHERE fecha = $1 
       AND hora_inicio = $2 
       AND consultorio_id = $3`,
      [fecha, hora_inicio, consultorio_id]
    );

    if (conflictoConsultorio.rows.length > 0) {
      return res.status(400).json({ error: 'El consultorio ya está ocupado en ese horario' });
    }

    // 🔴 Insertar turno
    const nuevoTurno = await pool.query(
      `INSERT INTO turnos 
      (fecha, hora_inicio, hora_fin, paciente_id, profesional_id, consultorio_id, especialidad_id, motivo_consulta)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [fecha, hora_inicio, hora_fin, paciente_id, profesional_id, consultorio_id, especialidad_id, motivo_consulta]
    );

    res.status(201).json(nuevoTurno.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear turno' });
  }
};

// GET TURNOS 
const getTurnos = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                t.*,

                json_build_object(
                    'id', p.id,
                    'nombre', p.nombre,
                    'apellido', p.apellido
                ) AS paciente,

                json_build_object(
                    'id', pr.id,
                    'nombre', pr.nombre,
                    'apellido', pr.apellido
                ) AS profesional,

                json_build_object(
                    'id', c.id,
                    'numero_consultorio', c.numero_consultorio
                ) AS consultorio,

                json_build_object(
                    'id', e.id,
                    'nombre', e.nombre
                ) AS especialidad

            FROM turnos t

            LEFT JOIN pacientes p ON t.paciente_id = p.id
            LEFT JOIN profesionales pr ON t.profesional_id = pr.id
            LEFT JOIN consultorios c ON t.consultorio_id = c.id
            LEFT JOIN especialidades e ON t.especialidad_id = e.id

            ORDER BY t.fecha, t.hora_inicio;
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
  crearTurno,
  getTurnos
};