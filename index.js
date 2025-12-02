// Carregando variáveis de ambiente
require('dotenv').config();

// Importando express, inicializando a aplicação e definindo a porta da aplicação
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

//configurando o express para trabalhar com JSON
app.use(express.json());

//importando as rotas
const usersRouter = require('./routes/users');
const streamsRouter = require('./routes/streams');
const seriesRouter = require('./routes/series');

//carregando as rotas na aplicação
app.use('/users', usersRouter);
app.use('/streams', streamsRouter);
app.use('/series', seriesRouter);

//mensagem de confirmação de funcionamento da API na raiz
app.get('/', (req, res) =>{
    res.json({ok: true, message: 'API de Séries e Streams funcionando!'});
});

//captura erros da aplicação e retorna json com status e mensagem de erro
app.use((err, req, res, next) =>{
    console.error(err);
    res.status(err.status || 500).json({error: err.message || 'Erro interno do servidor'});
})

//iniciando o servidor na porta definida
const server = app.listen(port, () =>{
    console.log('Servidor rodando em http://localhost:' + port);
});

server.on('error', (err) => {
    console.error('❌ Erro ao iniciar o servidor:', err);
    process.exit(1);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
    console.error('❌ Exceção não capturada:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada não tratada:', reason);
    process.exit(1);
});

