const express = require('express');
const router = express.Router();
const { login, logout, me, register } = require('../controllers/usuario.controller');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);
router.post('/register', register);

module.exports = router;