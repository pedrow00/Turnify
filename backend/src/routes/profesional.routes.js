const express = require('express');
const router = express.Router();

const {getProfesionales,createProfesional} = require('../controllers/profesional.controller');

// GET
router.get('/', getProfesionales);

// POST
router.post('/', createProfesional);

module.exports = router;