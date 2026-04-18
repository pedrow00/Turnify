const express = require('express');
const router = express.Router();

const {crearTurno, getTurnos} = require('../controllers/turnos.controller');
const { route } = require('./consultorio.routes');
const { verificarRol } = require('../middlewares/auth.middleware');

//GET
router.get('/',verificarRol(['secretaria', 'socio']) ,getTurnos)

//POST
router.post('/',verificarRol(['secretaria', 'socio']) , crearTurno);

module.exports = router;