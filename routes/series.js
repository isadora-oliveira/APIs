const express = require('express');
const router = express.Router();
const seriesController = require('../controller/series_controller');
const userSeasonRecordController = require('../controller/user_season_record_controller');
const { authRequired } = require('../middleware/auth');

// CRUD de Séries

// Rota para criar uma nova série
router.post('/', seriesController.inserir);

// Rota para listar todas as séries
router.get('/', seriesController.listar);

// Rota para listar séries assistidas pelo usuário autenticado
// IMPORTANTE: Esta rota deve vir ANTES de '/:id' para não ser capturada pelo parâmetro :id
router.get('/my-watch', authRequired, userSeasonRecordController.listarSeriesAssistidas);

// Rota para obter informações de uma série pelo ID
router.get('/:id', seriesController.buscarPorId);

// Rota para atualizar uma série pelo ID
router.put('/:id', seriesController.atualizar);

// Rota para deletar uma série pelo ID
router.delete('/:id', seriesController.deletar);

// Registros de temporadas assistidas por usuários autenticados

// Rota para criar um registro de temporada assistida para o usuário autenticado
router.post('/:id/records', authRequired, userSeasonRecordController.criarRegistro);

// Rota para obter o registro de temporadas assistidas do usuário autenticado para uma série específica
router.get('/:id/records', authRequired, userSeasonRecordController.listarRegistrosPorSerie);

// Rota para deletar o registro de temporadas assistidas do usuário autenticado
router.delete('/:id/records/:recordId', authRequired, userSeasonRecordController.deletarRegistro);

module.exports = router;
