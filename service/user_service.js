const bcrypt = require('bcrypt');
const userRepository = require('../repository/user_repository');
const { generateToken } = require('../middleware/auth');

async function registrar(user) {
    // Validação: campos obrigatórios
    if (!user.name || !user.email || !user.password) {
        const error = new Error('Nome, email e senha são obrigatórios');
        error.status = 400;
        throw error;
    }

    // Regra de negócio: verificar se o email já está em uso
    const usuarioExistente = await userRepository.buscarPorEmail(user.email);
    if (usuarioExistente) {
        const error = new Error('Email já está em uso');
        error.status = 409;
        throw error;
    }

    // Regra de negócio: hashear a senha
    const passwordHash = await bcrypt.hash(user.password, 10);

    const novoUsuario = await userRepository.inserir({
        name: user.name,
        email: user.email,
        passwordHash
    });

    // Gerar token de autenticação
    const token = generateToken(novoUsuario);

    return {
        id: novoUsuario.id,
        name: novoUsuario.name,
        email: novoUsuario.email,
        token
    };
}

async function login(credentials) {
    // Validação: campos obrigatórios
    if (!credentials.email || !credentials.password) {
        const error = new Error('Email e senha são obrigatórios');
        error.status = 400;
        throw error;
    }

    // Buscar usuário pelo email
    const user = await userRepository.buscarPorEmail(credentials.email);
    if (!user) {
        const error = new Error('Email inválido');
        error.status = 401;
        throw error;
    }

    // Regra de negócio: validar senha
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
    if (!isPasswordValid) {
        const error = new Error('Senha inválida');
        error.status = 401;
        throw error;
    }

    // Gerar token de autenticação
    const token = generateToken(user);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        token
    };
}

async function obterDadosUsuario(userId) {
    const user = await userRepository.buscarPorId(userId);
    if (!user) {
        const error = new Error('Usuário não encontrado');
        error.status = 404;
        throw error;
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email
    };
}

module.exports = {
    registrar,
    login,
    obterDadosUsuario
};
