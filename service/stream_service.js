const streamRepository = require('../repository/stream_repository');

async function listar() {
    return await streamRepository.listar();
}

async function inserir(stream) {
    // Validação: nome é obrigatório
    if (!stream.name) {
        const error = new Error('Nome do Streaming é obrigatório');
        error.status = 400;
        throw error;
    }

    // Regra de negócio: verificar se o nome já está em uso
    const streamExistente = await streamRepository.buscarPorNome(stream.name);
    if (streamExistente) {
        const error = new Error('Nome do Streaming já está em uso');
        error.status = 409;
        throw error;
    }

    return await streamRepository.inserir(stream);
}

async function buscarPorId(id) {
    const stream = await streamRepository.buscarPorId(id);
    if (!stream) {
        const error = new Error('Streaming não encontrado');
        error.status = 404;
        throw error;
    }
    return stream;
}

async function atualizar(id, stream) {
    // Verificar se o streaming existe
    const streamExistente = await streamRepository.buscarPorId(id);
    if (!streamExistente) {
        const error = new Error('Streaming não encontrado');
        error.status = 404;
        throw error;
    }

    // Regra de negócio: se mudou o nome, verificar se não está em uso por outro
    if (stream.name && stream.name !== streamExistente.name) {
        const streamComMesmoNome = await streamRepository.buscarPorNome(stream.name);
        if (streamComMesmoNome && streamComMesmoNome.id !== id) {
            const error = new Error('Nome do Streaming já está em uso');
            error.status = 409;
            throw error;
        }
    }

    // Manter valores antigos se não foram fornecidos
    const streamAtualizado = {
        name: stream.name !== undefined ? stream.name : streamExistente.name,
        description: stream.description !== undefined ? stream.description : streamExistente.description
    };

    return await streamRepository.atualizar(id, streamAtualizado);
}

async function deletar(id) {
    const stream = await streamRepository.buscarPorId(id);
    if (!stream) {
        const error = new Error('Streaming não encontrado');
        error.status = 404;
        throw error;
    }
    return await streamRepository.deletar(id);
}

module.exports = {
    listar,
    inserir,
    buscarPorId,
    atualizar,
    deletar
};
