const jwt = require('jsonwebtoken'); //importando a biblioteca jsonwebtoken para manipulação de tokens JWT
const store = require('../data/store'); 

//chave secreta para assinar os tokens JWT (em produção, se usa uma variável de ambiente)
const SECRET = 'DEV-SECRET-123';

//função para gerar um token JWT para um usuário
function generateToken(user){
    //gerando e retornando o token assinado com o id e email do usuário
    return jwt.sign({id: user.id, email: user.email}, SECRET, {expiresIn: '8h'});
}

function authRequired(req, res, next){
    const auth = req.headers.authorization; //pegando o cabeçalho Authorization
    //verificando se o cabeçalho Authorization foi fornecido
    if(!auth || !auth.startsWith('Bearer'))
        return res.status(401).json({error: 'Token de autenticação não fornecido'});

    const token = auth.split(' ')[1];//extraindo o token do cabeçalho

    //verificando e decodificando o token
    try{
        const payload = jwt.verify(token, SECRET);
        //procurando o usuário no store pelo id do payload do token
        const user = store.users.find(u => u.id === payload.id);
        //verificando se o usuário existe
        if(!user)
            return res.status(401).json({error: 'Usuário não encontrado'});
        req.user = user; //adicionando o usuário autenticado à requisição
        next(); //chamando a próxima rota
    }catch(err) {
        //se o token for inválido ou expirado, retornando erro 401
        return res.status(401).json({error: 'Token de autenticação inválido'});
    }
}

module.exports = {generateToken, authRequired};
