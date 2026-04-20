const express = require('express');
const router = express.Router();

const { 
    getTurnos, 
    getTurno, 
    createTurno, 
    updateTurno, 
    deleteTurno
} = require('../controllers/turnos.controller');
const { verificarRol } = require('../middlewares/auth.middleware');

router.get('/',verificarRol(['secretaria', 'socio']) ,getTurnos)
router.get('/:id',verificarRol(['secretaria', 'socio']) , getTurno);

router.post('/',verificarRol(['secretaria', 'socio']) , createTurno);

router.put('/:id',verificarRol(['secretaria', 'socio']) , updateTurno);

router.delete('/:id',verificarRol(['secretaria', 'socio']) , deleteTurno);



module.exports = router;