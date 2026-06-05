const express = require('express');
const router = express.Router();

const {
    getConsultorios,
    createConsultorio,
    getConsultorio,
    updateConsultorio,
    deleteConsultorio
} = require('../controllers/consultorio.controller');
const { requireRole, requireAuth } = require('../utils/authMiddleware');

router.get('/', requireAuth, requireRole(['secretaria', 'socio', 'admin']), getConsultorios);
router.get('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin']), getConsultorio);


router.post('/', requireAuth, requireRole(['secretaria', 'socio', 'admin']), createConsultorio);

router.put('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin']), updateConsultorio);

router.delete('/:id', requireAuth, requireRole(['secretaria', 'socio', 'admin']), deleteConsultorio);
module.exports = router;