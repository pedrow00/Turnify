const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../utils/authMiddleware');
const {
  listar,
  crear,
  actualizarRol,
  actualizarPassword,
} = require('../controllers/usuario.controller');

// Gestion de usuarios: exclusivo de administradores. El alta publica ya no
// existe; la primera cuenta se crea con scripts/create-user.js.
router.use(requireAuth, requireRole(['admin']));

router.get('/', listar);
router.post('/', crear);
router.put('/:id', actualizarRol);
router.put('/:id/password', actualizarPassword);

module.exports = router;
