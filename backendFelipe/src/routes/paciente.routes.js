const express = require('express');
const router = express.Router();
const { verificarRol } = require('../middlewares/auth.middleware');

const {
    getPacientes,
    createPaciente,
    getPaciente
} = require('../controllers/paciente.controller');


router.get('/',verificarRol(['secretaria', 'socio']) ,getPacientes);
router.get('/:id', getPaciente);

router.post('/',verificarRol(['secretaria', 'socio']) , createPaciente);


module.exports = router;