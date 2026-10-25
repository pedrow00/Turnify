const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { login, logout, me, register } = require('../controllers/usuario.controller');
const { requireAuth, requireRole } = require('../utils/authMiddleware');

// Limita la fuerza bruta contra el login: 10 intentos por IP cada 15 minutos.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Demasiados intentos de inicio de sesión. Probá de nuevo en unos minutos.',
  },
});

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', me);

// El alta de usuarios ya no es pública: solo un administrador puede crear
// cuentas. Para la primera cuenta existe scripts/create-user.js.
router.post('/register', requireAuth, requireRole(['admin']), register);

module.exports = router;
