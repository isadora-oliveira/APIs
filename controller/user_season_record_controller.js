const userSeasonRecordService = require('../service/user_season_record_service');

async function criarRegistro(req, res) {
    try {
        const userId = req.user.id;
        const seriesId = Number(req.params.id);
        const record = await userSeasonRecordService.criarRegistro(userId, seriesId, req.body);
        res.status(201).json(record);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function listarRegistrosPorSerie(req, res) {
    try {
        const userId = req.user.id;
        const seriesId = Number(req.params.id);
        const records = await userSeasonRecordService.listarRegistrosPorSerie(userId, seriesId);
        res.json(records);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function deletarRegistro(req, res) {
    try {
        const userId = req.user.id;
        const recordId = Number(req.params.recordId);
        await userSeasonRecordService.deletarRegistro(userId, recordId);
        res.status(200).json({ message: 'Registro deletado com sucesso' });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function listarSeriesAssistidas(req, res) {
    try {
        const userId = req.user.id;
        const series = await userSeasonRecordService.listarSeriesAssistidas(userId);
        res.json(series);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

module.exports = {
    criarRegistro,
    listarRegistrosPorSerie,
    deletarRegistro,
    listarSeriesAssistidas
};
