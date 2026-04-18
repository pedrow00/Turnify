const express = require('express');
const router = express.Router();
const { verificarRol } = require('../middlewares/auth.middleware');

const {getProfesionales,createProfesional, getProfesional} = require('../controllers/profesional.controller');

router.get('/',verificarRol(['secretaria', 'socio']) ,getProfesionales);
router.get('/:id', getProfesional)

router.post('/',verificarRol(['socio']) , createProfesional);

module.exports = router;