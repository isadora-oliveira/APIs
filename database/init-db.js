require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function initDatabase() {
    try {
        console.log('Iniciando criação das tabelas...');
        
        // Lendo o arquivo SQL
        const sqlPath = path.join(__dirname, 'init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Executando o SQL
        await db.query(sql);
        
        console.log('Tabelas criadas com sucesso!');
        console.log('Estrutura do banco de dados:');
        console.log('   - users (usuários)');
        console.log('   - streams (plataformas de streaming)');
        console.log('   - series (séries)');
        console.log('   - user_season_records (registros de temporadas assistidas)');
        
        process.exit(0);
    } catch (error) {
        console.error('Erro ao criar tabelas:', error.message);
        process.exit(1);
    }
}

initDatabase();
