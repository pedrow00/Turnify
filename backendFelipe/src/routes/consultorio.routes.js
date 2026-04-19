const express = require('express');
const router = express.Router();
const { verificarRol } = require('../middlewares/auth.middleware');

const {
    getConsultorios,
    getConsultorio,
    createConsultorio,
    updateConsultorio,
    deleteConsultorio
} = require('../controllers/consultorio.controller');

router.get('/',verificarRol(['secretaria', 'socio']) , getConsultorios);
router.get('/:id',verificarRol(['secretaria', 'socio']) , getConsultorio);

router.post('/',verificarRol(['socio']) , createConsultorio);

router.put('/:id',verificarRol(['socio']) , updateConsultorio);

router.delete('/:id',verificarRol(['socio']) , deleteConsultorio);


module.exports = router;