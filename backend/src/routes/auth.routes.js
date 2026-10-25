const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  login,
  logout,
  me,
  perfil,
  actualizarPasswordPropia,
} = require('../controllers/usuario.controller');
const { requireAuth } = require('../utils/authMiddleware');

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
router.get('/me', requireAuth, me);
router.get('/perfil', requireAuth, perfil);
router.put('/password', requireAuth, actualizarPasswordPropia);

module.exports = router;
