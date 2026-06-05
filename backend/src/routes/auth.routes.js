const express = require('express');
const router = express.Router();
const { login, logout, me, register } = require('../controllers/usuario.controller');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);
router.post('/register', register);

module.exports = router;

//secretaria: secretaria@test.com - password: 123456
//profesional: pedrito@correo.com - password: 123456