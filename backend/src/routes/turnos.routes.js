const express = require('express');
const router = express.Router();

const {crearTurno, obtenerTurnoPorId, 
    obtenerTurnos, actualizarTurno, eliminarTurno} = require('../controllers/turnos.controller');

//POST
router.post('/', crearTurno);
router.get('/', obtenerTurnos);
router.get('/:id', obtenerTurnoPorId);
router.put('/:id', actualizarTurno);
router.delete('/:id', eliminarTurno);

module.exports = router;
