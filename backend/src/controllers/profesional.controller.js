const pool = require('../config/db');

// GET PROFESINALES CON SUS HORARIOS
const getProfesionales = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'dia', h.dia,
                            'hora_inicio', h.hora_inicio,
                            'hora_fin', h.hora_fin
                        )
                    ) FILTER (WHERE h.id IS NOT NULL),
                    '[]'
                ) AS horarios
            FROM profesionales p
            LEFT JOIN horarios_profesionales h
                ON p.id = h.profesional_id
            GROUP BY p.id
            ORDER BY p.id;
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// POST
const createProfesional = async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            cuil,
            email,
            telefono,
            horarios
        } = req.body;

        // 1. Crear profesional
        const result = await pool.query(
            `INSERT INTO profesionales 
            (nombre, apellido, cuil, email, telefono)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [nombre, apellido, cuil, email, telefono]
        );

        const profesional = result.rows[0]; 

        // 2. Insertar horarios
        if (horarios && horarios.length > 0) {
            for (let h of horarios) {
                await pool.query(
                    `INSERT INTO horarios_profesionales 
                    (profesional_id, dia, hora_inicio, hora_fin)
                    VALUES ($1, $2, $3, $4)`,
                    [profesional.id, h.dia, h.hora_inicio, h.hora_fin]
                );
            }
        }

        // 3. RESPUESTA AL FINAL
        res.status(201).json(profesional);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

//Buscar 1 profesional por ID
const { obtenerProfesionalPorId } = require('../services/profesional.service');
const getProfesional = async (req, res) => {
    try {
        const profesional = await obtenerProfesionalPorId(req.params.id);
        res.json(profesional);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

module.exports = {
    getProfesionales,
    createProfesional,
    getProfesional
};