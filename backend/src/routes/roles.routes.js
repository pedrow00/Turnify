const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../utils/authMiddleware');
const { listar } = require('../controllers/rol.controller');

// Solo un admin necesita el catalogo de roles (alta de usuarios y filtros).
router.get('/', requireAuth, requireRole(['admin']), listar);

module.exports = router;
