const {
  obtenerPacientePorId,
  obtenerPacientes,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
} = require('../services/paciente.service');

// GET todos
const getPacientes = async (req, res) => {
  try {
    const pacientes = await obtenerPacientes();
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET por ID
const getPaciente = async (req, res) => {
  try {
    const paciente = await obtenerPacientePorId(req.params.id);
    res.json(paciente);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// POST
const createPaciente = async (req, res) => {
  try {
    const nuevo = await crearPaciente(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT
const updatePaciente = async (req, res) => {
  try {
    const actualizado = await actualizarPaciente(req.params.id, req.body);
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deletePaciente = async (req, res) => {
  try {
    await eliminarPaciente(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getPacientes,
  getPaciente,
  createPaciente,
  updatePaciente,
  deletePaciente
};
