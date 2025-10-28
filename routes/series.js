const express = require('express');
const router = express.Router();
const store = require('../data/store');
const {authRequired} = require('../middleware/auth');

//Rota para criar uma nova série
router.post('/', (req, res) =>{
    const {title, streamId, seasons, genre, synopsis} = req.body; //pegando os dados do corpo da requisição
    //verificando se os campos obrigatórios foram preenchidos
    if(!title || !streamId || !seasons || !genre || !synopsis)
        return res.status(400).json({error: "Título, ID do streaming, número de temporadas, gênero e sinopse são obrigatórios"});
    //verificando se a serie ja existe
    if(store.series.some(s => s.title === title && s.streamId === streamId))
        return res.status(409).json({error: 'Série já existe'});

    //verificando se o streaming existe
    const stream = store.streams.find(s => s.id === streamId);
    if(!stream)
        return res.status(404).json({error: 'Streaming associado não encontrado'});
    //criando a nova série
    const serie = {
        id: store.seriesIdCounter++, 
        title, 
        streamId, 
        seasons: Number(seasons), 
        genre: genre || '', 
        synopsis: synopsis || ''
    };
    //adicionando a série ao store
    store.series.push(serie);
    //retornando a série criada
    res.status(201).json(serie);
});

//Rota para listar todas as serires
router.get('/', (req, res) =>{
    //percorrendo o array de séries e retornando as infos basicas e o straming associado
    const seriesList = store.series.map(serie => {
        const stream = store.streams.find(st => st.id === serie.streamId);
        return { ...serie, streamName: stream ? stream.name : null};//adicionando o nome do streaming associado se existir
    });
    res.json(seriesList);//retornando o array de séries
});

//Rota para obter informações de uma série pelo ID
router.get('/:id', (req, res) =>{
    //procurando a série pelo ID
    const serie = store.series.find(s => s.id === Number(req.params.id));
    //se não existir, retornando erro 404
    if(!serie)
        return res.status(404).json({error: 'Serie não encontrada'});
    //retornando todos os dados da série encontrada
    const stream = store.streams.find(st => st.id === serie.streamId);//procurando o streaming associado
    res.json({...serie, streamName: stream ? stream.name : null}); //adicionando o nome do streaming associado se existir
});

//Rota para atualizar uma série pelo ID
router.put('/:id', (req, res) =>{
    //procurando a série pelo ID
    const serie = store.series.find(s => s.id === Number(req.params.id));
    //se não existir, retornando erro 404
    if(!serie)
        return res.status(404).json({error: 'Serie não encontrada'});
    //atualizando os dados da série
    const {title, streamId, seasons, genre, synopsis} = req.body;

    //se foi fornecido um novo streamId, verificando se o streaming existe
    if(streamId !== undefined){
        //verificando se o streaming existe
        const stream = store.streams.find(s => s.id === streamId);
        //se não existir, retornando erro 404
        if(!stream)
            return res.status(404).json({error: 'Streaming associado não encontrado'});
        serie.streamId = streamId;
    }

    //atualizando os campos apenas se foram fornecidos
    if (title !== undefined) serie.title = title;
    if (seasons !== undefined) serie.seasons = Number(seasons);
    if (genre !== undefined) serie.genre = genre;
    if (synopsis !== undefined) serie.synopsis = synopsis;
    //retornando a série atualizada
    res.json(serie);
});

//Rota para deletar uma série pelo ID
router.delete('/:id', (req, res) =>{
    //procurando o índice da série pelo ID
    const idSerie = store.series.findIndex(s => s.id === Number(req.params.id));

    //se não existir, retornando erro 404
    if(idSerie === -1)
        return res.status(404).json({error: 'Serie não encontrada'});

    //removendo a serie do store
    store.series.splice(idSerie, 1);
    res.status(200).json({ message: 'Série deletada com sucesso' });//optando por retornar 200 ao invés de 204 para confirmar a deleção ao usuario
});


/* Registros específicos de temporada por usuários autenticados 
    POST /series/my-watch - criar registro de todas as series assistidas pelo usuário autenticado
    GET /series/:id/records - criar um registro de temporada assistida para o usuário autenticado
    GET /series/:id/records - obter o registro de temporadas assistidas do usuário autenticado 
    DELETE /series/:id/records - deletar o registro de temporadas assistidas do usuário autenticado 
*/


//Rota para criar um registro de temporada assistida para o usuário autenticado
router.post('/:id/records', authRequired, (req, res) =>{
    const userId = req.user.id;//pegando o id do usuário autenticado
    const seriesId = req.params.id;//pegando o id da série dos parâmetros da requisição
    const {seasonNumber, status} = req.body;//pegando o número da temporada e o status do corpo da requisição

    //verificando se os campos obrigatórios foram preenchidos
    const serie = store.series.find(s => Number(s.id) === Number(seriesId));
    if(!serie)
        return res.status(404).json({error: 'Serie não encontrada'});
    //verificando se o número da temporada e status foram fornecidos
    if(!seasonNumber || !status)
        return res.status(400).json({error: 'Número da temporada e status são obrigatórios'});
    //verificando se o número da temporada é válido
    const seasonNum = Number(seasonNumber);
    if(seasonNum < 1 || seasonNum > serie.seasons)
        return res.status(400).json({error: 'Número da temporada inválido. Deve estar entre 1 e ' + serie.seasons});
    //previnindo registros duplicados para a mesma série e temporada pelo mesmo usuário
    const existingRecord = store.userSeasonRecords.find(r => r.userId === userId && Number(r.seriesId) === Number(seriesId) && r.seasonNumber === seasonNum);//verificando se já existe um registro para a mesma série e temporada
    if(existingRecord)
        return res.status(409).json({error: 'Registro para essa série e temporada já existe'});

    //criando o novo registro de temporada assistida
    const record = {
        id: store.userSeasonRecords.length + 1, //gerando um ID simples baseado no tamanho do array
        userId,
        seriesId,
        seasonNumber: seasonNum,
        status
    };
    //adicionando o registro ao store
    store.userSeasonRecords.push(record);
    //retornando o registro criado
    res.status(201).json(record);
});


//Rota para obter o registro de temporadas assistidas do usuário autenticado para uma série específica
router.get('/:id/records', authRequired, (req, res) =>{
    const seriesId = req.params.id;//pegando o id da série dos parâmetros da requisição
    const userId = req.user.id;//pegando o id do usuário autenticado
    const series = store.series.find(s => Number(s.id) === Number(seriesId));
    //verificando se a série existe
    if(!series)
        return res.status(404).json({error: 'Serie não encontrada'});

    //filtrando os registros do usuário para a série específica
    const records = store.userSeasonRecords.filter(r => Number(r.userId) === Number(userId) && Number(r.seriesId) === Number(seriesId));
    res.json(records);//retornando os registros encontrados
});

//Rota para deletar o registro de temporadas assistidas do usuário autenticado para uma série específica
router.delete('/:id/records/:recordId', authRequired, (req, res) =>{
    const recordId = req.params.recordId;//pegando o id do registro dos parâmetros da requisição
    const userId = req.user.id;//pegando o id do usuário autenticado
    const recordIndex = store.userSeasonRecords.findIndex(r => Number(r.id) === Number(recordId) && Number(r.userId) === Number(userId)); //procurando o índice do registro pelo ID e usuário

    //se não existir, retornando erro 404
    if(recordIndex === -1) {
        console.log('Tentativa de deletar registro inexistente:', recordId, 'para userId:', userId);
        return res.status(404).json({error: 'Registro não encontrado'});
    }

    //validando se é um registro valido e corresponde ao usuário
    const record = store.userSeasonRecords[recordIndex];
    if(!record || Number(record.id) !== Number(recordId) || Number(record.userId) !== Number(userId)) {
        console.log('Registro não corresponde ao usuário ou id:', record);
        return res.status(404).json({error: 'Registro não encontrado'});
    }

    //removendo o registro do store
    store.userSeasonRecords.splice(recordIndex, 1);
    res.status(200).json({ message: 'Registro deletado com sucesso' });//optando por retornar 200 ao invés de 204 para confirmar a deleção ao usuario
});

module.exports = router;
