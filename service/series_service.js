const seriesRepository = require('../repository/series_repository');
const streamRepository = require('../repository/stream_repository');

async function listar() {
    return await seriesRepository.listar();
}

async function inserir(serie) {
    // Validação: campos obrigatórios
    if (!serie.title || !serie.streamId || !serie.seasons || !serie.genre || !serie.synopsis) {
        const error = new Error('Título, ID do streaming, número de temporadas, gênero e sinopse são obrigatórios');
        error.status = 400;
        throw error;
    }

    // Regra de negócio: verificar se a série já existe
    const serieExistente = await seriesRepository.buscarPorTituloEStream(serie.title, serie.streamId);
    if (serieExistente) {
        const error = new Error('Série já existe');
        error.status = 409;
        throw error;
    }

    // Regra de negócio: verificar se o streaming existe
    const stream = await streamRepository.buscarPorId(serie.streamId);
    if (!stream) {
        const error = new Error('Streaming associado não encontrado');
        error.status = 404;
        throw error;
    }

    return await seriesRepository.inserir(serie);
}

async function buscarPorId(id) {
    const serie = await seriesRepository.buscarPorId(id);
    if (!serie) {
        const error = new Error('Serie não encontrada');
        error.status = 404;
        throw error;
    }
    return serie;
}

async function atualizar(id, serie) {
    // Verificar se a série existe
    const serieExistente = await seriesRepository.buscarPorId(id);
    if (!serieExistente) {
        const error = new Error('Serie não encontrada');
        error.status = 404;
        throw error;
    }

    // Regra de negócio: se foi fornecido um novo streamId, verificar se o streaming existe
    if (serie.streamId !== undefined) {
        const stream = await streamRepository.buscarPorId(serie.streamId);
        if (!stream) {
            const error = new Error('Streaming associado não encontrado');
            error.status = 404;
            throw error;
        }
    }

    // Manter valores antigos se não foram fornecidos
    const serieAtualizada = {
        title: serie.title !== undefined ? serie.title : serieExistente.title,
        streamId: serie.streamId !== undefined ? serie.streamId : serieExistente.streamId,
        seasons: serie.seasons !== undefined ? Number(serie.seasons) : serieExistente.seasons,
        genre: serie.genre !== undefined ? serie.genre : serieExistente.genre,
        synopsis: serie.synopsis !== undefined ? serie.synopsis : serieExistente.synopsis
    };

    return await seriesRepository.atualizar(id, serieAtualizada);
}

async function deletar(id) {
    const serie = await seriesRepository.buscarPorId(id);
    if (!serie) {
        const error = new Error('Serie não encontrada');
        error.status = 404;
        throw error;
    }
    return await seriesRepository.deletar(id);
}

module.exports = {
    listar,
    inserir,
    buscarPorId,
    atualizar,
    deletar
};
