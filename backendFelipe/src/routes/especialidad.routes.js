const express = require('express');
const router = express.Router();
const { verificarRol } = require('../middlewares/auth.middleware');

const {
  getEspecialidades,
  getEspecialidad,
  createEspecialidad,
  updateEspecialidad,
  deleteEspecialidad
} = require('../controllers/especialidad.controller');

router.get('/', verificarRol(['secretaria', 'socio']), getEspecialidades);
router.get('/:id', verificarRol(['secretaria', 'socio']), getEspecialidad);

router.post('/', verificarRol(['secretaria']), createEspecialidad);

router.put('/:id', verificarRol(['secretaria']), updateEspecialidad);

router.delete('/:id', verificarRol(['secretaria']), deleteEspecialidad);

module.exports = router;
