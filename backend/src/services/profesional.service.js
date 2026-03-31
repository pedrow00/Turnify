const pool = require('../config/db');

const obtenerProfesionalPorId = async (id) => {
    const result = await pool.query(
        'SELECT * FROM profesionales WHERE id = $1',
        [id]
    );

    if (result.rows.length === 0) {
        throw new Error('Profesional no encontrado');
    }

    return result.rows[0];
};

module.exports = {
    obtenerProfesionalPorId
};