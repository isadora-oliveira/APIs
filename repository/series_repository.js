const db = require('../config/database');

async function listar() {
    const sql = `
        SELECT s.id, s.title, s.stream_id, s.seasons, s.genre, s.synopsis,
               st.name as stream_name
        FROM series s
        INNER JOIN streams st ON s.stream_id = st.id
        ORDER BY s.id
    `;
    const result = await db.query(sql);
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

async function inserir(serie) {
    const sql = 'INSERT INTO series(title, stream_id, seasons, genre, synopsis) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [serie.title, serie.streamId, serie.seasons, serie.genre || '', serie.synopsis || ''];
    const result = await db.query(sql, values);
    return result.rows[0];
}

async function buscarPorId(id) {
    const sql = `
        SELECT s.id, s.title, s.stream_id, s.seasons, s.genre, s.synopsis,
               st.name as stream_name
        FROM series s
        INNER JOIN streams st ON s.stream_id = st.id
        WHERE s.id = $1
    `;
    const result = await db.query(sql, [id]);
    if (result.rows[0]) {
        const row = result.rows[0];
        return {
            id: row.id,
            title: row.title,
            streamId: row.stream_id,
            seasons: row.seasons,
            genre: row.genre,
            synopsis: row.synopsis,
            streamName: row.stream_name
        };
    }
    return undefined;
}

async function buscarPorTituloEStream(title, streamId) {
    const sql = 'SELECT * FROM series WHERE title = $1 AND stream_id = $2';
    const result = await db.query(sql, [title, streamId]);
    return result.rows[0];
}

async function atualizar(id, serie) {
    const sql = 'UPDATE series SET title = $1, stream_id = $2, seasons = $3, genre = $4, synopsis = $5 WHERE id = $6 RETURNING *';
    const values = [serie.title, serie.streamId, serie.seasons, serie.genre, serie.synopsis, id];
    const result = await db.query(sql, values);
    return result.rows[0];
}

async function deletar(id) {
    const sql = 'DELETE FROM series WHERE id = $1 RETURNING *';
    const result = await db.query(sql, [id]);
    return result.rows[0];
}

module.exports = {
    listar,
    inserir,
    buscarPorId,
    buscarPorTituloEStream,
    atualizar,
    deletar
};
