const { Pool } = require('pg');

// Configuração do pool de conexões com PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'series_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20, // máximo de conexões no pool
    idleTimeoutMillis: 30000, // tempo máximo que uma conexão pode ficar ociosa
    connectionTimeoutMillis: 2000, // tempo máximo para obter uma conexão
});

// Testando a conexão
pool.on('connect', () => {
    console.log('Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
    console.error('Erro inesperado no cliente do banco de dados', err);
    // Removido o process.exit para não derrubar o servidor
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    connect: () => pool.connect(),
    pool
};
