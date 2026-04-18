const express = require('express');
const router = express.Router();
const { verificarRol } = require('../middlewares/auth.middleware');

const {
    getConsultorios,
    createConsultorio
} = require('../controllers/consultorio.controller');

router.get('/',verificarRol(['secretaria', 'socio']) , getConsultorios);
router.post('/',verificarRol(['socio']) , createConsultorio);

module.exports = router;