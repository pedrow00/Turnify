const { listarRoles } = require('../services/rol.service');
const { logger } = require('../utils/logger');

const listar = async (req, res) => {
  try {
    res.json(await listarRoles());
  } catch (error) {
    logger.error('Error al listar roles', { message: error.message });
    res.status(500).json({ error: 'No se pudieron obtener los roles' });
  }
};

module.exports = { listar };
