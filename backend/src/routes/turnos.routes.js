const express = require('express');
const router = express.Router();

const {crearTurno, getTurnos} = require('../controllers/turnos.controller');
const { route } = require('./consultorio.routes');

//GET
router.get('/', getTurnos)

//POST
router.post('/', crearTurno);

module.exports = router;