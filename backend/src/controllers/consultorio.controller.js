const {
  obtenerConsultorioPorId,
  obtenerConsultorios,
  crearConsultorio,
  actualizarConsultorio,
  eliminarConsultorio
} = require('../services/consultorio.service');
const { logger } = require('../utils/logger');

const getConsultorios = async (req, res) => {
  try {
    const consultorios = await obtenerConsultorios();
    res.json(consultorios);
  } catch (error) {
    logger.error('login fallido', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const getConsultorio = async (req, res) => {
  try {
    const consultorio = await obtenerConsultorioPorId(req.params.id);
    res.json(consultorio);
  } catch (error) {
    logger.error('login fallido', { error: error.message });
    res.status(404).json({ error: error.message });
  }
};

const createConsultorio = async (req, res) => {
  try {
    const nuevo = await crearConsultorio(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    logger.error('login fallido', { error: error.message });
    res.status(400).json({ error: error.message });
  }
};

const updateConsultorio = async (req, res) => {
  try {
    const actualizado = await actualizarConsultorio(req.params.id, req.body);
    res.json(actualizado);
  } catch (error) {
    logger.error('login fallido', { error: error.message });
    res.status(400).json({ error: error.message });
  }
};

const deleteConsultorio = async (req, res) => {
  try {
    await eliminarConsultorio(req.params.id);
    res.status(204).send();
  } catch (error) {
    logger.error('login fallido', { error: error.message });
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getConsultorios,
  getConsultorio,
  createConsultorio,
  updateConsultorio,
  deleteConsultorio
};
