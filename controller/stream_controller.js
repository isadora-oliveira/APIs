const streamService = require('../service/stream_service');

async function listar(req, res) {
    try {
        const streams = await streamService.listar();
        res.json(streams);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function inserir(req, res) {
    try {
        const stream = await streamService.inserir(req.body);
        res.status(201).json(stream);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function buscarPorId(req, res) {
    try {
        const stream = await streamService.buscarPorId(Number(req.params.id));
        res.json(stream);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function atualizar(req, res) {
    try {
        const stream = await streamService.atualizar(Number(req.params.id), req.body);
        res.json(stream);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function deletar(req, res) {
    try {
        await streamService.deletar(Number(req.params.id));
        res.status(200).json({ message: 'Streaming deletado com sucesso' });
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
