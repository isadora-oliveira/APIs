//importando expressm, inicializando a aplicação e definindo a porta da aplicação
const express = require('express');
const app = express();
const port = 3000;

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
app.listen(port, () =>{
    console.log('Servidor rodando em http://localhost:' + port);
})

