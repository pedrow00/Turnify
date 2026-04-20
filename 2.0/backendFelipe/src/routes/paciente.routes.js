const express = require('express');
const router = express.Router();
const { verificarRol } = require('../middlewares/auth.middleware');

const {
    getPacientes,
    createPaciente,
    getPaciente,
    updatePaciente,
    deletePaciente
} = require('../controllers/paciente.controller');


router.get('/',verificarRol(['secretaria', 'socio']) ,getPacientes);
router.get('/:id', verificarRol(['secretaria', 'socio']) , getPaciente);

router.post('/',verificarRol(['secretaria']) , createPaciente);

router.put('/:id',verificarRol(['secretaria']) , updatePaciente);

router.delete('/:id',verificarRol(['secretaria']) , deletePaciente);


module.exports = router;