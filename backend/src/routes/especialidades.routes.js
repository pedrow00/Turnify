const express = require('express');
const router = express.Router();

const {
  getEspecialidades,
  getEspecialidad,
  createEspecialidad,
  updateEspecialidad,
  deleteEspecialidad
} = require('../controllers/especialidades.controller')

router.get('/',getEspecialidades);
router.get('/:id', getEspecialidad);

router.post('/', createEspecialidad);

router.put('/:id', updateEspecialidad);

router.delete('/:id', deleteEspecialidad);

module.exports = router;
