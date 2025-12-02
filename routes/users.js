const express = require('express');
const router = express.Router();
const userController = require('../controller/user_controller');
const { authRequired } = require('../middleware/auth');

// Rota para registrar um novo usuario
router.post('/register', userController.registrar);

// Rota para login do usuário
router.post('/login', userController.login);

// Rota para obter informações do usuário autenticado
router.get('/me', authRequired, userController.obterDadosUsuario);

module.exports = router;