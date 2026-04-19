const {
  obtenerTurnoPorId,
  obtenerTurnos,
  crearTurno,
  actualizarTurno,
  eliminarTurno
} = require('../services/turnos.services');

const getTurnos = async (req, res) => {
  try {
    const turnos = await obtenerTurnos();
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTurno = async (req, res) => {
  try {
    const turno = await obtenerTurnoPorId(req.params.id);
    res.json(turno);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const createTurno = async (req, res) => {
  try {
    const nuevo = await crearTurno(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateTurno = async (req, res) => {
  try {
    const actualizado = await actualizarTurno(req.params.id, req.body);
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteTurno = async (req, res) => {
  try {
    await eliminarTurno(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getTurnos,
  getTurno,
  createTurno,
  updateTurno,
  deleteTurno
};
