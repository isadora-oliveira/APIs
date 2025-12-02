# 📋 Resumo da Arquitetura Implementada

## 🎯 Estrutura em Camadas

A API foi refatorada seguindo o padrão **M Repository e Service**:

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (HTTP)                      │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              ROUTES (Definição de URLs)              │
│  - routes/users.js                                   │
│  - routes/streams.js                                 │
│  - routes/series.js                                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│         CONTROLLERS (Camada de Apresentação)         │
│  - Recebe req/res HTTP                               │
│  - Valida entrada básica                             │
│  - Chama Services                                    │
│  - Formata resposta HTTP                             │
│                                                       │
│  • user_controller.js                                │
│  • stream_controller.js                              │
│  • series_controller.js                              │
│  • user_season_record_controller.js                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│          SERVICES (Lógica de Negócio)                │
│  - Regras de negócio                                 │
│  - Validações complexas                              │
│  - Coordenação entre repositories                    │
│  - NÃO conhece HTTP (req/res)                        │
│                                                       │
│  • user_service.js                                   │
│    - Hash de senha (bcrypt)                          │
│    - Validação de credenciais                        │
│    - Geração de token JWT                            │
│                                                       │
│  • stream_service.js                                 │
│    - Validação de nome único                         │
│                                                       │
│  • series_service.js                                 │
│    - Validação de série duplicada                    │
│    - Verificação de stream existente                 │
│                                                       │
│  • user_season_record_service.js                     │
│    - Validação de temporada válida                   │
│    - Prevenção de registros duplicados               │
│    - Verificação de propriedade do registro          │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│         REPOSITORIES (Acesso a Dados)                │
│  - Queries SQL                                       │
│  - CRUD no banco de dados                            │
│  - Abstração de persistência                         │
│  - NÃO contém regras de negócio                      │
│                                                       │
│  • user_repository.js                                │
│  • stream_repository.js                              │
│  • series_repository.js                              │
│  • user_season_record_repository.js                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│          DATABASE CONFIG (Conexão)                   │
│  - config/database.js                                │
│  - Pool de conexões PostgreSQL                       │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                     │
│  - users                                             │
│  - streams                                           │
│  - series                                            │
│  - user_season_records                               │
└─────────────────────────────────────────────────────┘
```

## 📂 Estrutura de Diretórios

```
api-series2/
├── config/
│   └── database.js              # Configuração do pool de conexões
│
├── controller/
│   ├── user_controller.js       # HTTP handlers para usuários
│   ├── stream_controller.js     # HTTP handlers para streams
│   ├── series_controller.js     # HTTP handlers para séries
│   └── user_season_record_controller.js
│
├── service/
│   ├── user_service.js          # Lógica de negócio de usuários
│   ├── stream_service.js        # Lógica de negócio de streams
│   ├── series_service.js        # Lógica de negócio de séries
│   └── user_season_record_service.js
│
├── repository/
│   ├── user_repository.js       # CRUD usuários no BD
│   ├── stream_repository.js     # CRUD streams no BD
│   ├── series_repository.js     # CRUD séries no BD
│   └── user_season_record_repository.js
│
├── routes/
│   ├── users.js                 # Rotas de autenticação
│   ├── streams.js               # Rotas de streams
│   └── series.js                # Rotas de séries + records
│
├── middleware/
│   └── auth.js                  # Middleware de autenticação JWT
│
├── database/
│   ├── init.sql                 # Script SQL para criar tabelas
│   └── init-db.js               # Script Node para executar init.sql
│
├── data/
│   └── store.js                 # ANTIGO (não usado mais)
│
├── .env                         # Variáveis de ambiente (não commitar)
├── .env.example                 # Exemplo de variáveis de ambiente
├── .gitignore                   # Arquivos a ignorar no git
├── docker-compose.yml           # Configuração Docker (PostgreSQL + pgAdmin)
├── index.js                     # Ponto de entrada da aplicação
├── package.json                 # Dependências e scripts
├── COMO_INICIAR.md              # Guia de inicialização
└── README.md                    # Documentação principal
```

## 🔄 Fluxo de uma Requisição

### Exemplo: POST /series/1/records (Registrar temporada assistida)

```
1. CLIENT faz requisição HTTP
   POST /series/1/records
   Headers: Authorization: Bearer TOKEN
   Body: { seasonNumber: 1, status: "assistido" }
   
2. EXPRESS → routes/series.js
   router.post('/:id/records', authRequired, controller.criarRegistro)
   
3. MIDDLEWARE auth.js
   - Valida token JWT
   - Busca usuário no banco
   - Adiciona req.user com dados do usuário
   
4. CONTROLLER user_season_record_controller.js
   - Extrai userId de req.user
   - Extrai seriesId de req.params
   - Extrai dados de req.body
   - Chama service.criarRegistro()
   - Formata resposta HTTP
   
5. SERVICE user_season_record_service.js
   - Valida campos obrigatórios
   - Busca série no banco (via series_repository)
   - Valida número da temporada
   - Verifica registro duplicado
   - Chama repository.inserir()
   
6. REPOSITORY user_season_record_repository.js
   - Monta query SQL INSERT
   - Executa no banco de dados
   - Retorna registro criado
   
7. Retorno do fluxo (6→5→4→3→2→1)
   - Service retorna registro
   - Controller retorna JSON
   - Express envia resposta HTTP 201
   - Cliente recebe dados
```

## 🎯 Responsabilidades de Cada Camada

### ROUTES
- ✅ Definir URLs e métodos HTTP
- ✅ Associar URLs a controllers
- ✅ Aplicar middlewares (authRequired)
- ❌ Não contém lógica de negócio
- ❌ Não acessa banco de dados

### CONTROLLERS
- ✅ Receber req/res HTTP
- ✅ Extrair parâmetros (params, body, headers)
- ✅ Chamar services
- ✅ Formatar resposta HTTP (status codes, JSON)
- ✅ Tratar erros e converter em HTTP status
- ❌ Não contém regras de negócio
- ❌ Não acessa banco de dados diretamente

### SERVICES
- ✅ Implementar regras de negócio
- ✅ Validações complexas
- ✅ Coordenar múltiplos repositories
- ✅ Lançar exceções com mensagens de erro
- ❌ Não conhece HTTP (req/res)
- ❌ Não faz queries SQL diretas

### REPOSITORIES
- ✅ Executar queries SQL
- ✅ CRUD no banco de dados
- ✅ Abstração de persistência
- ✅ Retornar dados formatados
- ❌ Não contém regras de negócio
- ❌ Não valida dados (apenas executa)

## 🔐 Autenticação e Segurança

### Fluxo de Autenticação

```
1. Registro (POST /users/register)
   - Recebe: name, email, password
   - Service hasheia senha com bcrypt
   - Repository salva no banco
   - Retorna: user + JWT token

2. Login (POST /users/login)
   - Recebe: email, password
   - Service busca usuário por email
   - Compara senha com hash (bcrypt.compare)
   - Se válido, gera JWT token
   - Retorna: user + JWT token

3. Rotas Protegidas (GET /users/me, POST /series/:id/records, etc)
   - Middleware authRequired valida token
   - Extrai userId do token
   - Busca usuário no banco
   - Adiciona req.user para os controllers
```

### Senha
- ✅ Nunca armazenada em texto plano
- ✅ Hash com bcrypt (salt rounds = 10)
- ✅ Nunca retornada nas respostas

### Token JWT
- ✅ Contém: { id, email }
- ✅ Expiração: 8 horas
- ✅ Secret key em variável de ambiente
- ✅ Validado a cada requisição protegida

## 🗄️ Banco de Dados

### Relacionamentos

```
users (1) ──────→ (N) user_season_records
streams (1) ─────→ (N) series
series (1) ──────→ (N) user_season_records
```

### Constraints

- **UNIQUE**: Previne duplicados
  - users.email
  - streams.name
  - series(title, stream_id)
  - user_season_records(user_id, series_id, season_number)

- **FOREIGN KEYS**: Mantém integridade referencial
  - series.stream_id → streams.id
  - user_season_records.user_id → users.id
  - user_season_records.series_id → series.id

- **ON DELETE CASCADE**: Remove registros dependentes
  - Deletar stream → deleta todas as séries desse stream
  - Deletar série → deleta todos os registros dessa série
  - Deletar usuário → deleta todos os registros do usuário

## 📊 Vantagens desta Arquitetura

### ✅ Separação de Responsabilidades
Cada camada tem uma função clara e única

### ✅ Testabilidade
- Services podem ser testados sem HTTP
- Repositories podem ser mockados
- Controllers são simples e fáceis de testar

### ✅ Manutenibilidade
- Mudanças isoladas em cada camada
- Fácil localizar bugs
- Código organizado e legível

### ✅ Reutilização
- Services podem ser usados por diferentes controllers
- Repositories podem ter múltiplas implementações (BD, memória, arquivo)

### ✅ Escalabilidade
- Fácil adicionar novos endpoints
- Fácil trocar banco de dados
- Fácil adicionar cache, filas, etc


## 🎓 Conceitos Aplicados

- ✅ **Arquitetura em Camadas** (Layered Architecture)
- ✅ **Repository Pattern** (Abstração de dados)
- ✅ **Service Layer** (Lógica de negócio)
- ✅ **Dependency Injection** (Controllers → Services → Repositories)
- ✅ **Separation of Concerns** (Cada arquivo/função tem um propósito)
- ✅ **RESTful API** (Recursos, verbos HTTP, status codes)
- ✅ **JWT Authentication** (Stateless authentication)
- ✅ **Environment Variables** (.env)
- ✅ **Connection Pooling** (PostgreSQL pool)
- ✅ **Error Handling** (Try/catch com status codes apropriados)

