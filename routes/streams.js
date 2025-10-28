const express = require('express');
const router = express.Router();
const store = require('../data/store');

//Rota para criar uma nova plataforma de straming
router.post('/', (req, res) => {
    const {name, description} = req.body;
    //verificando o nome foi preenchido (obrigatório)
    if(!name)
        return res.status(400).json({error: 'Nome do Streaming é obrigatório'});
    //verificando se o nome já está em uso
    if(store.streams.some(s => s.name === name))
        return res.status(409).json({error: 'Nome do Streaming já está em uso'});

    //criando o novo streaming
    const stream = {
        id: store.streamIdCounter++, name, description: description || ''
    };
    //adicionando o streaming ao store
    store.streams.push(stream);
    //retornando o straming criado
    res.status(201).json(stream);
});

//Rota para listar todas as plataformas de streaming
router.get('/', (req, res) =>{ 
    res.json(store.streams);//retornando o array de streams
});

//Rota para obter informações de um streaming pelo ID
router.get('/:id', (req, res) =>{
    //verificando se o streaming existe
    const stream = store.streams.find(s => s.id === Number(req.params.id));
    //se não existir, retornando erro 404
    if(!stream)
        return res.status(404).json({error: 'Streaming não encontrado'});
    //retornando o streaming encontrado
    res.json(stream);
});

//Rota para atualizar um streaming pelo ID
router.put('/:id', (req, res) =>{
    //verificando se o streaming existe
    const stream = store.streams.find(s => s.id === Number(req.params.id));
    //se não existir, retornando erro 404
    if(!stream)
        return res.status(404).json({error: 'Streaming não encontrado'});

    //atualizando os dados do streaming
    const {name, description} = req.body;
    
    //verificando se o nome não está em uso por outro streaming    
    if(name && store.streams.some(s => s.name === name && Number(s.id) !== Number(stream.id)))
        return res.status(409).json({error: 'Nome do Streaming já está em uso'});
    //atualizando os campos apenas se foram fornecidos 
    if (name !== undefined) stream.name = name;
    if (description !== undefined) stream.description = description;
    //retornando o streaming atualizado
    res.json(stream);
});

//Rota para deletar um streaming pelo ID
router.delete('/:id', (req, res) =>{
    const idStream = store.streams.findIndex(s => s.id === Number(req.params.id));
    //se não existir, retornando erro 404
    if(idStream === -1)
        return res.status(404).json({error: 'Streaming não encontrado'});

    //removendo o streaming do store
    store.streams.splice(idStream, 1);
    //retornando mensagem de sucesso
    res.status(200).json({message: 'Streaming deletado com sucesso'});
});

module.exports = router;