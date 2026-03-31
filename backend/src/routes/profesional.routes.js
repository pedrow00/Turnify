const express = require('express');
const router = express.Router();

const {getProfesionales,createProfesional, getProfesional} = require('../controllers/profesional.controller');

// GET
router.get('/', getProfesionales);
router.get('/:id', getProfesional)

// POST
router.post('/', createProfesional);

module.exports = router;