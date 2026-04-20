const express = require('express');
const router = express.Router();

const {
    getConsultorios,
    createConsultorio,
    getConsultorio,
    updateConsultorio,
    deleteConsultorio
} = require('../controllers/consultorio.controller');

router.get('/', getConsultorios);
router.post('/', createConsultorio);

router.get('/:id', getConsultorio);

router.put('/:id', updateConsultorio);

router.delete('/:id', deleteConsultorio);
module.exports = router;