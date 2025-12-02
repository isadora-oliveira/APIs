const db = require('../config/database');

async function inserir(record) {
    const sql = 'INSERT INTO user_season_records(user_id, series_id, season_number, status) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [record.userId, record.seriesId, record.seasonNumber, record.status];
    const result = await db.query(sql, values);
    return result.rows[0];
}

async function buscarPorUsuarioESerieETemporada(userId, seriesId, seasonNumber) {
    const sql = 'SELECT * FROM user_season_records WHERE user_id = $1 AND series_id = $2 AND season_number = $3';
    const result = await db.query(sql, [userId, seriesId, seasonNumber]);
    return result.rows[0];
}

async function listarPorUsuario(userId) {
    const sql = `
        SELECT usr.id, usr.user_id, usr.series_id, usr.season_number, usr.status,
               s.title as series_title, st.name as stream_name
        FROM user_season_records usr
        INNER JOIN series s ON usr.series_id = s.id
        INNER JOIN streams st ON s.stream_id = st.id
        WHERE usr.user_id = $1
        ORDER BY usr.id
    `;
    const result = await db.query(sql, [userId]);
    return result.rows;
}

async function listarPorUsuarioESerie(userId, seriesId) {
    const sql = 'SELECT * FROM user_season_records WHERE user_id = $1 AND series_id = $2 ORDER BY season_number';
    const result = await db.query(sql, [userId, seriesId]);
    return result.rows;
}

async function buscarPorId(id) {
    const sql = 'SELECT * FROM user_season_records WHERE id = $1';
    const result = await db.query(sql, [id]);
    return result.rows[0];
}

async function deletar(id) {
    const sql = 'DELETE FROM user_season_records WHERE id = $1 RETURNING *';
    const result = await db.query(sql, [id]);
    return result.rows[0];
}

async function buscarSeriesAssistidasPorUsuario(userId) {
    const sql = `
        SELECT DISTINCT s.id, s.title, s.stream_id, s.seasons, s.genre, s.synopsis,
               st.name as stream_name
        FROM user_season_records usr
        INNER JOIN series s ON usr.series_id = s.id
        INNER JOIN streams st ON s.stream_id = st.id
        WHERE usr.user_id = $1
        ORDER BY s.id
    `;
    const result = await db.query(sql, [userId]);
    return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        streamId: row.stream_id,
        seasons: row.seasons,
        genre: row.genre,
        synopsis: row.synopsis,
        streamName: row.stream_name
    }));
}

module.exports = {
    inserir,
    buscarPorUsuarioESerieETemporada,
    listarPorUsuario,
    listarPorUsuarioESerie,
    buscarPorId,
    deletar,
    buscarSeriesAssistidasPorUsuario
};
