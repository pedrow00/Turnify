const pool = require('../config/db');

//OBTENER UN PACIENTE POR UN ID JEJE!
const obtenerPacientePorId = async (id) => {
    const result = await pool.query(
        'SELECT * FROM pacientes WHERE id = $1',
        [id]
    );

    if (result.rows.length === 0) {
        throw new Error('Paciente no encontrado');
    }

    return result.rows[0];
};

module.exports = {
    obtenerPacientePorId
};