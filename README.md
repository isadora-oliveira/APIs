# API-SERIES2

API-SERIES2 é uma API RESTful para gerenciamento de séries, usuários e streams. Este projeto foi desenvolvido em Node.js e utiliza Express para o roteamento. Abaixo estão instruções de uso, exemplos de testes via Insomnia e detalhes das regras de negócio, incluindo casos de sucesso e falha.

## Instalação

```bash
npm install
```

## Inicialização

```bash
node index.js
```

## Endpoints Principais

- `/series` - Gerenciamento de séries
- `/users` - Gerenciamento de usuários
- `/streams` - Gerenciamento de streams

## Testes Insomnia por Funcionalidade

### STREAMS

#### Criar stream
**POST** `/streams`
```json
{
  "name": "Netflix",
  "description": "Plataforma de streaming de filmes e séries."
}
```
**Sucesso:** 201 `{ "id": 1, "name": "Netflix", ... }`
**Erro (nome já cadastrado):** 409 `{ "error": "Nome do Streaming já está em uso" }`
**Erro (nome ausente):** 400 `{ "error": "Nome do Streaming é obrigatório" }`

#### Listar streams
**GET** `/streams`
**Sucesso:** 200 `[ { "id": 1, "name": "Netflix", ... }, ... ]`

#### Buscar stream por ID
**GET** `/streams/1`
**Sucesso:** 200 `{ "id": 1, "name": "Netflix", ... }`
**Erro:** 404 `{ "error": "Streaming não encontrado" }`

#### Atualizar stream
**PUT** `/streams/1`
```json
{
  "name": "Netflix Premium",
  "description": "Streaming atualizado."
}
```
**Sucesso:** 200 `{ "id": 1, "name": "Netflix Premium", "description": "Streaming atualizado." }`
**Erro:** 404 `{ "error": "Streaming não encontrado" }`
**Erro:** 409 `{ "error": "Nome do Streaming já está em uso" }`


#### Deletar stream
**DELETE** `/streams/1`
**Sucesso:** 200 `{ "message": "Streaming deletado com sucesso" }`
**Erro:** 404 `{ "error": "Streaming não encontrado" }`

---

### SERIES

#### Criar série
**POST** `/series`
```json
{
  "title": "Breaking Bad",
  "genre": "Drama",
  "seasons": 5,
  "streamId": 1,
  "synopsis": "Um professor de química se torna fabricante de metanfetamina."
}
{
  "title": "Dexter",
  "genre": "Terror",
  "seasons": 7,
  "streamId": 1,
  "synopsis": "Um assassino em brusca de sangue."
}
```
**Sucesso:** 201 `{ "id": 1, "title": "Breaking Bad", ... }`
**Erro (campo obrigatório faltando):** 400 `{ "error": "Título, ID do streaming e número de temporadas são obrigatórios" }`
**Erro (stream inexistente):** 404 `{ "error": "Streaming associado não encontrado" }`

#### Listar séries
**GET** `/series`
**Sucesso:** 200 `[ { "id": 1, "title": "Breaking Bad", ... }, ... ]`

#### Buscar série por ID
**GET** `/series/1`
**Sucesso:** 200 `{ "id": 1, "title": "Breaking Bad", ... }`
**Erro:** 404 `{ "error": "Serie não encontrada" }`

#### Atualizar série
**PUT** `/series/1`
```json
{
  "title": "Breaking Bad - Atualizado",
  "genre": "Drama",
  "seasons": 6,
  "synopsis": "Sinopse atualizada."
}
```
**Sucesso:** 200 `{ "id": 1, "title": "Breaking Bad - Atualizado", ... }`
**Erro:** 404 `{ "error": "Serie não encontrada" }`

#### Deletar série
**DELETE** `/series/1`
**Sucesso:** 200 `{ "message": "Série deletada com sucesso" }`
**Erro:** 404 `{ "error": "Serie não encontrada" }`

---

### USERS

#### Registrar usuário
**POST** `/users/register`
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```
**Sucesso:** 201 `{ "id": 1, "name": "João Silva", "email": "joao@email.com", "token": "..." }`
**Erro (email já cadastrado):** 409 `{ "error": "Email já está em uso" }`
**Erro (campo obrigatório faltando):** 400 `{ "error": "Nome, email e senha são obrigatórios" }`

#### Login do usuário
**POST** `/users/login`
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```
**Sucesso:** 200 `{ "id": 1, "name": "João Silva", "email": "joao@email.com", "token": "..." }`
**Erro (email inválido):** 401 `{ "error": "Email inválido" }`
**Erro (senha inválida):** 401 `{ "error": "Senha inválida" }`
**Erro (campo obrigatório faltando):** 400 `{ "error": "Email e senha são obrigatórios" }`

#### Consultar usuário autenticado
**GET** `/users/me`
**Headers:** Authorization: Bearer `<token>`
**Sucesso:** 200 `{ "id": 1, "name": "João Silva", "email": "joao@email.com" }`
#### Autenticação (login)
**POST** `/users/login`
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```
**Sucesso:** 200 `{ "token": "..." }`
**Erro (senha incorreta):** 401 `{ "error": "Credenciais inválidas" }`

---

### FUNCIONALIDADES DE NEGÓCIO
#### Associar série e status ao usuário (registro de temporada assistida)
**POST** `/series/1/records`
**Headers:** Authorization: Bearer `<token>`
```json
{
  "seasonNumber": 1,
  "status": "assistido"
}
```
**Sucesso:** 201 `{ "id": 1, "userId": 1, "seriesId": "1", "seasonNumber": 1, "status": "assistido" }`
**Erro (registro duplicado):** 409 `{ "error": "Registro para essa série e temporada já existe" }`
**Erro (série inexistente):** 404 `{ "error": "Serie não encontrada" }`
**Erro (temporada inválida):** 400 `{ "error": "Número da temporada inválido. Deve estar entre 1 e N" }`
**Sucesso:**
- Status: 200
- Resposta: `{ "token": "..." }`

**Falha:**
- Senha incorreta
- Status: 401
- Resposta: `{ "error": "Credenciais inválidas" }`



## Regras de Negócio

- Usuário não pode se cadastrar com email já existente.
- Autenticação exige email e senha válidos.
- Campos obrigatórios devem ser validados em todas as rotas de criação.

## Testes de Falha


### Exemplos de Testes de Falha no Insomnia

#### 1. Criar série sem campo obrigatório
**POST** `http://localhost:3000/series`
**Body (JSON):**
```json
{
  "title": "Série sem gênero",
  "seasons": 2,
  "streamId": 1
}
```
**Resposta:**
```json
{
  "error": "Campo 'genre' é obrigatório" 
}
```

#### 2. Criar usuário com email já cadastrado
**POST** `http://localhost:3000/users`
**Body (JSON):**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```
**Resposta:**
```json
{
  "error": "Email já cadastrado"
}
```

#### 3. Login com senha errada
**POST** `http://localhost:3000/users/login`
**Body (JSON):**
```json
{
  "email": "joao@email.com",
  "password": "senhaErrada"
}
```
**Resposta:**
```json
{
  "error": "Credenciais inválidas"
}
```

#### 4. Criar stream sem autenticação
**POST** `http://localhost:3000/streams`
**Body (JSON):**
```json
{
  "name": "Prime Video",
  "description": "Streaming de filmes e séries."
}
```
**Sem header Authorization**
**Resposta:**
```json
{
  "error": "Token inválido ou ausente"
}
```

## Ferramentas

- [Insomnia](https://insomnia.rest/) para testes de API

## Autor

- Projeto desenvolvido por Isadora Oliveira

