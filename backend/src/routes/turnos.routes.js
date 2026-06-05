const express = require('express');
const router = express.Router();

const {crearTurno, obtenerTurnoPorId, 
    obtenerTurnos, actualizarTurno, eliminarTurno} = require('../controllers/turnos.controller');
const { requireRole, requireAuth } = require('../utils/authMiddleware');
//POST
router.post('/', requireAuth, requireRole(['secretaria', 'socio', 'admin', 'profesional']), crearTurno);
router.get('/', requireAuth, requireRole(['secretaria', 'socio', 'admin', 'profesional']), obtenerTurnos);
router.get('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin', 'profesional']), obtenerTurnoPorId);
router.put('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin', 'profesional']), actualizarTurno);
router.delete('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin', 'profesional']), eliminarTurno);

module.exports = router;
