const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth.controllers');
const { verificarRol } = require('../middlewares/auth.middleware');

router.post('/login', login);

module.exports = router;
