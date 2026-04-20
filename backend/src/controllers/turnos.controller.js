const pool = require('../config/db');

const turnosService = require('../services/turno.service');

// GET todos
const obtenerTurnos = async (req, res) => {
  try {
    const data = await turnosService.getTurnos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET por ID
const obtenerTurnoPorId = async (req, res) => {
  try {
    const data = await turnosService.obtenerTurnoPorId(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// POST
const crearTurno = async (req, res) => {
  try {
    const data = await turnosService.crearTurno(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT
const actualizarTurno = async (req, res) => {
  try {
    const data = await turnosService.actualizarTurno(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const eliminarTurno = async (req, res) => {
  try {
    await turnosService.eliminarTurno(req.params.id);
    res.json({ mensaje: 'Turno eliminado' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  eliminarTurno
};