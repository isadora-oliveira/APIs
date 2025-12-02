const db = require('../config/database');

async function listar() {
    const sql = 'SELECT * FROM streams ORDER BY id';
    const result = await db.query(sql);
    return result.rows;
}

async function inserir(stream) {
    const sql = 'INSERT INTO streams(name, description) VALUES ($1, $2) RETURNING *';
    const values = [stream.name, stream.description || ''];
    const result = await db.query(sql, values);
    return result.rows[0];
}

async function buscarPorId(id) {
    const sql = 'SELECT * FROM streams WHERE id = $1';
    const result = await db.query(sql, [id]);
    return result.rows[0];
}

async function buscarPorNome(name) {
    const sql = 'SELECT * FROM streams WHERE name = $1';
    const result = await db.query(sql, [name]);
    return result.rows[0];
}

async function atualizar(id, stream) {
    const sql = 'UPDATE streams SET name = $1, description = $2 WHERE id = $3 RETURNING *';
    const values = [stream.name, stream.description, id];
    const result = await db.query(sql, values);
    return result.rows[0];
}

async function deletar(id) {
    const sql = 'DELETE FROM streams WHERE id = $1 RETURNING *';
    const result = await db.query(sql, [id]);
    return result.rows[0];
}

module.exports = {
    listar,
    inserir,
    buscarPorId,
    buscarPorNome,
    atualizar,
    deletar
};
