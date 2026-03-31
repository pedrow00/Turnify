const express = require('express');
const router = express.Router();

const {
    getPacientes,
    createPaciente
} = require('../controllers/paciente.controller');

// GET
router.get('/', getPacientes);

// POST
router.post('/', createPaciente);

module.exports = router;