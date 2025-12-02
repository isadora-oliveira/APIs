const express = require('express');
const router = express.Router();
const streamController = require('../controller/stream_controller');

// Rota para criar uma nova plataforma de streaming
router.post('/', streamController.inserir);

// Rota para listar todas as plataformas de streaming
router.get('/', streamController.listar);

// Rota para obter informações de um streaming pelo ID
router.get('/:id', streamController.buscarPorId);

// Rota para atualizar um streaming pelo ID
router.put('/:id', streamController.atualizar);

// Rota para deletar um streaming pelo ID
router.delete('/:id', streamController.deletar);

module.exports = router;