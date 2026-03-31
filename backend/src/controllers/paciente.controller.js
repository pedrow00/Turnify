const pool = require('../config/db');

// GET
const getPacientes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pacientes');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// POST
const createPaciente = async (req, res) => {
    try {
        console.log(req.body);

        const {
            nombre,
            apellido,
            dni,
            email,
            telefono,
            fecha_nacimiento
        } = req.body;

        const result = await pool.query(
            `INSERT INTO pacientes 
            (nombre, apellido, dni, email, telefono, fecha_nacimiento, provincia_id, localidad_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [nombre, apellido, dni, email, telefono, fecha_nacimiento, '14', '14028']
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
//GET POR ID DE UN PACIENTE
const { obtenerPacientePorId } = require('../services/paciente.service')
const getPaciente = async (req, res) => {
    try {
        const paciente = await obtenerPacientePorId(req.params.id);
        res.json(paciente);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

// 👇 ESTO ES CLAVE
module.exports = {
    getPacientes,
    createPaciente,
    getPaciente
};