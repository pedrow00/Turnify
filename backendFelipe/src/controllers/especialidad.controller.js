const {
  obtenerEspecialidadPorId,
  obtenerEspecialidades,
  crearEspecialidad,
  actualizarEspecialidad,
  eliminarEspecialidad
} = require('../services/especialidad.service');

const getEspecialidades = async (req, res) => {
  try {
    const rows = await obtenerEspecialidades();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEspecialidad = async (req, res) => {
  try {
    const row = await obtenerEspecialidadPorId(req.params.id);
    res.json(row);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const createEspecialidad = async (req, res) => {
  try {
    const nuevo = await crearEspecialidad(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateEspecialidad = async (req, res) => {
  try {
    const actualizado = await actualizarEspecialidad(req.params.id, req.body);
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteEspecialidad = async (req, res) => {
  try {
    await eliminarEspecialidad(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getEspecialidades,
  getEspecialidad,
  createEspecialidad,
  updateEspecialidad,
  deleteEspecialidad
};
