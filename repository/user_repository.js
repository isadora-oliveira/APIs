const db = require('../config/database');

async function inserir(user) {
    const sql = 'INSERT INTO users(name, email, password_hash) VALUES ($1, $2, $3) RETURNING *';
    const values = [user.name, user.email, user.passwordHash];
    const result = await db.query(sql, values);
    return result.rows[0];
}

async function buscarPorEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(sql, [email]);
    return result.rows[0];
}

async function buscarPorId(id) {
    const sql = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(sql, [id]);
    return result.rows[0];
}

module.exports = {
    inserir,
    buscarPorEmail,
    buscarPorId
};
