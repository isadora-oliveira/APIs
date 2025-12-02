-- Criação do banco de dados (executar apenas uma vez)
-- CREATE DATABASE series_db;

-- Conectar ao banco series_db antes de executar os comandos abaixo

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de plataformas de streaming
CREATE TABLE IF NOT EXISTS streams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de séries
CREATE TABLE IF NOT EXISTS series (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    stream_id INTEGER NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
    seasons INTEGER NOT NULL,
    genre VARCHAR(100),
    synopsis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(title, stream_id)
);

-- Tabela de registros de temporadas assistidas por usuários
CREATE TABLE IF NOT EXISTS user_season_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, series_id, season_number)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_series_stream_id ON series(stream_id);
CREATE INDEX IF NOT EXISTS idx_user_season_records_user_id ON user_season_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_season_records_series_id ON user_season_records(series_id);
