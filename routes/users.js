const express = require('express');
const router = express.Router(); //criando o roteador do express
const bycrypt = require('bcrypt'); //importando o bycrypt para hashear senhas
const store = require('../data/store'); //importando o store para manipular os dados
const {generateToken, authRequired} = require('../middleware/auth');//importando o middleware de autenticação

//Rota para registrar um novo usuario 
router.post('/register', async (req, res) => {
    const {name, email, password } = req.body;

    //verificando se todos os campos foram preenchidos
    if(!name || !email || !password) 
        return res.status(400).json({error: 'Nome, email e senha são obrigatórios'});

    //verificando se o email já está em uso
    if(store.users.some(user => user.email === email)) 
        return res.status(409).json({error: 'Email já está em uso'});
    //hasheando a senha
    const passwordHash = await bycrypt.hash(password, 10);
    //criando o novo usuário
    const user = {
        id: store.userIdCounter++, name, email, passwordHash
    };
    //adicionando o usuário ao store
    store.users.push(user);

    //gerando o token de autenticação
    const token = generateToken(user);
    //retornando os dados do usuário e o token
    res.status(201).json({ id: user.id, name: user.name, email: user.email, token })
});

//Rota para login do usuário
router.post('/login', async (req, res) =>{
    //pegando email e senha do corpo da requisição
    const { email, password } = req.body;
    //verificando se todos os campos foram preenchidos
    if(!email || !password)
        return res.status(400).json({error: 'Email e senha são obrigatórios'});

    //procurando o usuário pelo email
    const user = store.users.find(user => user.email === email);
    //verificando se o usuário existe
    if(!user)
        return res.status(401).json({error: 'Email inválido'});

    //comparando a senha fornecida com o hash armazenado
    const isPasswordValid = await bycrypt.compare(password, user.passwordHash);
    //verificando se a senha é válida
    if(!isPasswordValid)
        return res.status(401).json({error: 'Senha inválida'});

    //gerando token de autenticação
    const token = generateToken(user);
    //retornando as informações do usuário e o token
    res.json({id: user.id, name: user.name, email: user.email, token});
});

//Rota para obter informações do usuário autenticado
router.get('/me', authRequired, (req, res) =>{
    const {id, name, email} = req.user;//pegando id, nome e email do usuário autenticado da requisição
    res.json({id, name, email});//retornando id, nome e email do usuário
});

module.exports = router;//exportando o roteador