const express = require('express');
const router = express.Router();

const { login, registrarUsuario } = require('../controllers/auth.controllers');

router.post('/login', login);
router.post('/register', registrarUsuario);

module.exports = router;
