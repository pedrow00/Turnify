const express = require('express');
const router = express.Router();

const {
    getPacientes,
    createPaciente,
    getPaciente
} = require('../controllers/paciente.controller');

// GET
router.get('/', getPacientes);
router.get('/:id', getPaciente);

// POST
router.post('/', createPaciente);

module.exports = router;