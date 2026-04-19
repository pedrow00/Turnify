const express = require('express');
const router = express.Router();
const { verificarRol } = require('../middlewares/auth.middleware');

const {
    getProfesionales,
    getProfesional, 
    createProfesional, 
    updateProfesional, 
    deleteProfesional
} = require('../controllers/profesional.controller');

router.get('/',verificarRol(['secretaria', 'socio']) ,getProfesionales);
router.get('/:id', verificarRol(['secretaria', 'socio']) , getProfesional);

router.post('/',verificarRol(['socio']) , createProfesional);

router.put('/:id',verificarRol(['socio']) , updateProfesional);

router.delete('/:id',verificarRol(['socio']) , deleteProfesional);

module.exports = router;