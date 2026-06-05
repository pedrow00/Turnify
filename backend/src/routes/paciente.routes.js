const express = require('express');
const router = express.Router();

const {
    getPacientes,
    createPaciente,
    getPaciente,
    updatePaciente,
    deletePaciente
} = require('../controllers/paciente.controller');
const { requireRole, requireAuth } = require('../utils/authMiddleware');

// GET
router.get('/', requireAuth, requireRole(['secretaria', 'socio', 'admin', 'profesional']), getPacientes);
router.get('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin', 'profesional']), getPaciente);
// POST
router.post('/', requireAuth, requireRole(['secretaria', 'socio', 'admin']), createPaciente);
//PUT
router.put('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin']), updatePaciente);
//DELETE
router.delete('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin']), deletePaciente);

module.exports = router;