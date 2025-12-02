const userService = require('../service/user_service');

async function registrar(req, res) {
    try {
        const result = await userService.registrar(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function login(req, res) {
    try {
        const result = await userService.login(req.body);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function obterDadosUsuario(req, res) {
    try {
        const user = await userService.obterDadosUsuario(req.user.id);
        res.json(user);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

module.exports = {
    registrar,
    login,
    obterDadosUsuario
};
