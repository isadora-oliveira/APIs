const userSeasonRecordRepository = require('../repository/user_season_record_repository');
const seriesRepository = require('../repository/series_repository');

async function criarRegistro(userId, seriesId, record) {
    // Validação: campos obrigatórios
    if (!record.seasonNumber || !record.status) {
        const error = new Error('Número da temporada e status são obrigatórios');
        error.status = 400;
        throw error;
    }

    // Regra de negócio: verificar se a série existe
    const serie = await seriesRepository.buscarPorId(seriesId);
    if (!serie) {
        const error = new Error('Serie não encontrada');
        error.status = 404;
        throw error;
    }

    // Regra de negócio: validar número da temporada
    const seasonNum = Number(record.seasonNumber);
    if (seasonNum < 1 || seasonNum > serie.seasons) {
        const error = new Error(`Número da temporada inválido. Deve estar entre 1 e ${serie.seasons}`);
        error.status = 400;
        throw error;
    }

    // Regra de negócio: prevenir registros duplicados
    const existingRecord = await userSeasonRecordRepository.buscarPorUsuarioESerieETemporada(userId, seriesId, seasonNum);
    if (existingRecord) {
        const error = new Error('Registro para essa série e temporada já existe');
        error.status = 409;
        throw error;
    }

    return await userSeasonRecordRepository.inserir({
        userId,
        seriesId,
        seasonNumber: seasonNum,
        status: record.status
    });
}

async function listarRegistrosPorSerie(userId, seriesId) {
    // Verificar se a série existe
    const serie = await seriesRepository.buscarPorId(seriesId);
    if (!serie) {
        const error = new Error('Serie não encontrada');
        error.status = 404;
        throw error;
    }

    return await userSeasonRecordRepository.listarPorUsuarioESerie(userId, seriesId);
}

async function deletarRegistro(userId, recordId) {
    // Verificar se o registro existe
    const record = await userSeasonRecordRepository.buscarPorId(recordId);
    if (!record) {
        const error = new Error('Registro não encontrado');
        error.status = 404;
        throw error;
    }

    // Regra de negócio: verificar se o registro pertence ao usuário
    if (record.user_id !== userId) {
        const error = new Error('Registro não encontrado');
        error.status = 404;
        throw error;
    }

    return await userSeasonRecordRepository.deletar(recordId);
}

async function listarSeriesAssistidas(userId) {
    return await userSeasonRecordRepository.buscarSeriesAssistidasPorUsuario(userId);
}

module.exports = {
    criarRegistro,
    listarRegistrosPorSerie,
    deletarRegistro,
    listarSeriesAssistidas
};
