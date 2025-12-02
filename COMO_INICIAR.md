# 🚀 Guia de Inicialização da API

## Passo 1: Verificar Docker

Certifique-se de que o Docker está rodando:

```powershell
docker --version
```

## Passo 2: Subir o Banco de Dados

```powershell
docker-compose up -d
```

Isso vai criar:
- Container PostgreSQL na porta 5432
- Container pgAdmin na porta 8080

Para verificar se os containers estão rodando:

```powershell
docker-compose ps
```

## Passo 3: Criar as Tabelas do Banco

```powershell
npm run db:init
```

Você deve ver mensagens de sucesso indicando que as tabelas foram criadas.

## Passo 4: Iniciar a API

### Modo Desenvolvimento (com auto-reload)
```powershell
npm run dev
```

### Modo Produção
```powershell
npm start
```

A API estará disponível em: `http://localhost:3000`

## 🧪 Testando a API

### 1. Teste Básico - Verificar se a API está rodando

```powershell
Invoke-RestMethod -Uri "http://localhost:3000" -Method GET
```

Resposta esperada:
```json
{
  "ok": true,
  "message": "API de Séries e Streams funcionando!"
}
```

### 2. Criar um Usuário

```powershell
$body = @{
    name = "João Silva"
    email = "joao@email.com"
    password = "senha123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/users/register" -Method POST -Body $body -ContentType "application/json"
```

Salve o `token` retornado para usar nas próximas requisições!

### 3. Criar uma Plataforma de Streaming

```powershell
$body = @{
    name = "Netflix"
    description = "Serviço de streaming"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/streams" -Method POST -Body $body -ContentType "application/json"
```

### 4. Criar uma Série

```powershell
$body = @{
    title = "Breaking Bad"
    streamId = 1
    seasons = 5
    genre = "Drama"
    synopsis = "Um professor de química vira fabricante de metanfetamina"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/series" -Method POST -Body $body -ContentType "application/json"
```

### 5. Listar Séries

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/series" -Method GET
```

### 6. Registrar Temporada Assistida (requer autenticação)

```powershell
$token = "SEU_TOKEN_AQUI"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    seasonNumber = 1
    status = "assistido"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/series/1/records" -Method POST -Headers $headers -Body $body
```

### 7. Listar Minhas Séries Assistidas

```powershell
$token = "SEU_TOKEN_AQUI"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/series/my-watch" -Method GET -Headers $headers
```

## 🐛 Troubleshooting

### Erro: "ECONNREFUSED" ao conectar no banco

- Verifique se o Docker está rodando: `docker ps`
- Suba os containers: `docker-compose up -d`
- Aguarde alguns segundos para o PostgreSQL inicializar

### Erro: "relation does not exist"

- Execute o script de inicialização: `npm run db:init`

### Erro: "Port 5432 already in use"

- Você já tem um PostgreSQL rodando localmente
- Pare o serviço local ou mude a porta no `.env` e `docker-compose.yml`

### Erro de autenticação "Token inválido"

- Faça login novamente para obter um novo token
- Verifique se está enviando o token no formato: `Bearer SEU_TOKEN`

## 📊 Acessar o pgAdmin

1. Abra o navegador em: `http://localhost:8080`
2. Login:
   - Email: `user@localhost.com`
   - Senha: `password`
3. Adicionar servidor:
   - Host: `dcs-postgres` (nome do container)
   - Port: `5432`
   - Database: `series_db`
   - Username: `postgres`
   - Password: `password`

## 🛑 Parar os Serviços

### Parar a API
Pressione `Ctrl+C` no terminal onde a API está rodando

### Parar os containers Docker
```powershell
docker-compose down
```

### Parar e remover dados (CUIDADO!)
```powershell
docker-compose down -v
```

## 📝 Logs

### Ver logs da API
Os logs aparecem no terminal onde você executou `npm start` ou `npm run dev`

### Ver logs do Docker
```powershell
# Todos os containers
docker-compose logs

# Apenas PostgreSQL
docker-compose logs dcs-postgres

# Seguir logs em tempo real
docker-compose logs -f
```
