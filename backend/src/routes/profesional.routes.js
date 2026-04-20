const express = require('express');
const router = express.Router();

const {getProfesionales,
    getProfesional, 
    createProfesional, 
    updateProfesional, 
    deleteProfesional} = require('../controllers/profesional.controller');

// GET
router.get('/', getProfesionales);
router.get('/:id', getProfesional);
router.post('/', createProfesional);
router.put('/:id', updateProfesional);
router.delete('/:id', deleteProfesional);

module.exports = router;
