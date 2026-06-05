const express = require('express');
const router = express.Router();

const {
  getEspecialidades,
  getEspecialidad,
  createEspecialidad,
  updateEspecialidad,
  deleteEspecialidad
} = require('../controllers/especialidades.controller')
const { requireRole, requireAuth } = require('../utils/authMiddleware');

router.get('/', requireAuth, requireRole(['secretaria', 'socio', 'admin']), getEspecialidades);
router.get('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin']), getEspecialidad);

router.post('/', requireAuth, requireRole(['secretaria', 'socio', 'admin']), createEspecialidad);

router.put('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin']), updateEspecialidad);

router.delete('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin']), deleteEspecialidad);

module.exports = router;
