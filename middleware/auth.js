const jwt = require('jsonwebtoken');
const userRepository = require('../repository/user_repository');

// Chave secreta para assinar os tokens JWT (carregada de variável de ambiente)
const SECRET = process.env.JWT_SECRET || 'DEV-SECRET-123';

// Função para gerar um token JWT para um usuário
function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '8h' });
}

// Middleware para verificar autenticação
async function authRequired(req, res, next) {
    const auth = req.headers.authorization;

    // Verificando se o cabeçalho Authorization foi fornecido
    if (!auth || !auth.startsWith('Bearer')) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const token = auth.split(' ')[1];

    // Verificando e decodificando o token
    try {
        const payload = jwt.verify(token, SECRET);
        
        // Buscando o usuário no banco de dados
        const user = await userRepository.buscarPorId(payload.id);
        
        // Verificando se o usuário existe
        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        req.user = user; // Adicionando o usuário autenticado à requisição
        next(); // Chamando a próxima rota
    } catch (err) {
        // Se o token for inválido ou expirado, retornando erro 401
        return res.status(401).json({ error: 'Token de autenticação inválido' });
    }
}

module.exports = { generateToken, authRequired };
