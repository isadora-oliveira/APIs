const seriesService = require('../service/series_service');

async function listar(req, res) {
    try {
        const series = await seriesService.listar();
        res.json(series);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function inserir(req, res) {
    try {
        const serie = await seriesService.inserir(req.body);
        res.status(201).json(serie);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function buscarPorId(req, res) {
    try {
        const serie = await seriesService.buscarPorId(Number(req.params.id));
        res.json(serie);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function atualizar(req, res) {
    try {
        const serie = await seriesService.atualizar(Number(req.params.id), req.body);
        res.json(serie);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function deletar(req, res) {
    try {
        await seriesService.deletar(Number(req.params.id));
        res.status(200).json({ message: 'Série deletada com sucesso' });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

module.exports = {
    listar,
    inserir,
    buscarPorId,
    atualizar,
    deletar
};
