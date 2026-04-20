const {
  obtenerProfesionalPorId,
  obtenerProfesionales,
  crearProfesional,
  actualizarProfesional,
  eliminarProfesional
} = require('../services/profesional.service');

const getProfesionales = async (req, res) => {
  try {
    const profesionales = await obtenerProfesionales();
    res.json(profesionales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProfesional = async (req, res) => {
  try {
    const profesional = await obtenerProfesionalPorId(req.params.id);
    res.json(profesional);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const createProfesional = async (req, res) => {
  try {
    const nuevo = await crearProfesional(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateProfesional = async (req, res) => {
  try {
    const actualizado = await actualizarProfesional(req.params.id, req.body);
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteProfesional = async (req, res) => {
  try {
    await eliminarProfesional(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getProfesionales,
  getProfesional,
  createProfesional,
  updateProfesional,
  deleteProfesional
};
