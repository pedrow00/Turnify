const pool = require('../config/db');

// GET TODOS (con especialidades + horarios)
const getConsultorios = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.id,
                c.numero_consultorio,
                c.piso,
                c.ubicacion,

                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', e.id,
                            'nombre', e.nombre
                        )
                    ) FILTER (WHERE e.id IS NOT NULL), 
                    '[]'
                ) AS especialidades,

                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', h.id,
                            'hora_inicio', h.hora_inicio,
                            'hora_fin', h.hora_fin
                        )
                    ) FILTER (WHERE h.id IS NOT NULL),
                    '[]'
                ) AS horarios

            FROM consultorios c
            LEFT JOIN consultorio_especialidades ce 
                ON c.id = ce.consultorio_id
            LEFT JOIN especialidades e 
                ON ce.especialidad_id = e.id
            LEFT JOIN horarios_consultorios h 
                ON c.id = h.consultorio_id

            GROUP BY c.id
            ORDER BY c.id;
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


// POST (crear consultorio completo)
const createConsultorio = async (req, res) => {
    try {
        const {
            numero_consultorio,
            piso,
            ubicacion,
            especialidades,
            horarios
        } = req.body;

        const result = await pool.query(
            `INSERT INTO consultorios (numero_consultorio, piso, ubicacion)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [numero_consultorio, piso, ubicacion]
        );

        const consultorio = result.rows[0];

        // especialidades
        if (especialidades && especialidades.length > 0) {
            for (let esp of especialidades) {
                await pool.query(
                    `INSERT INTO consultorio_especialidades 
                     (consultorio_id, especialidad_id)
                     VALUES ($1, $2)`,
                    [consultorio.id, esp]
                );
            }
        }

        // horarios
        if (horarios && horarios.length > 0) {
            for (let h of horarios) {
                await pool.query(
                    `INSERT INTO horarios_consultorios 
                     (consultorio_id, hora_inicio, hora_fin)
                     VALUES ($1, $2, $3)`,
                    [consultorio.id, h.hora_inicio, h.hora_fin]
                );
            }
        }

        res.status(201).json(consultorio);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    getConsultorios,
    createConsultorio
};