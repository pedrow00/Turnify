const express = require('express');
const router = express.Router();

const {
    getPacientes,
    createPaciente,
    getPaciente,
    updatePaciente,
    deletePaciente
} = require('../controllers/paciente.controller');

// GET
router.get('/', getPacientes);
router.get('/:id', getPaciente);
// POST
router.post('/', createPaciente);
//PUT
router.put('/:id', updatePaciente);
//DELETE
router.delete('/:id', deletePaciente);

module.exports = router;