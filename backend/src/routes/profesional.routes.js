const express = require('express');
const router = express.Router();

const {getProfesionales,
    getProfesional, 
    createProfesional, 
    updateProfesional, 
    deleteProfesional} = require('../controllers/profesional.controller');
const { requireRole, requireAuth } = require('../utils/authMiddleware');
// GET
router.get('/', requireAuth, requireRole(['secretaria', 'socio', 'admin']), getProfesionales);
router.get('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin']), getProfesional);
router.post('/', requireAuth, requireRole(['secretaria', 'socio', 'admin']), createProfesional);
router.put('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin']), updateProfesional);
router.delete('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin']), deleteProfesional);

module.exports = router;
