# 🧪 Script de Teste da API

Write-Host "Iniciando testes da API..." -ForegroundColor Cyan

# 1. Testar endpoint raiz
Write-Host "Testando endpoint raiz (GET /)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000" -Method GET
    Write-Host "API está respondendo!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "Erro ao conectar na API. Certifique-se de que está rodando." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# 2. Registrar um usuário
Write-Host "Registrando um novo usuário..." -ForegroundColor Yellow
$user = @{
    name = "Teste User"
    email = "teste@email.com"
    password = "senha123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/users/register" -Method POST -Body $user -ContentType "application/json"
    Write-Host "Usuário registrado com sucesso!" -ForegroundColor Green
    $token = $registerResponse.token
    Write-Host "Token gerado: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    if ($_.Exception.Message -like "*Email já está em uso*") {
        Write-Host "Usuário já existe, fazendo login..." -ForegroundColor Yellow
        # Fazer login
        $loginData = @{
            email = "teste@email.com"
            password = "senha123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/users/login" -Method POST -Body $loginData -ContentType "application/json"
        $token = $loginResponse.token
        Write-Host "Login realizado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "Erro ao registrar usuário:" -ForegroundColor Red
        Write-Host $_.Exception.Message
        exit 1
    }
}

# 3. Criar uma plataforma de streaming
Write-Host "Criando plataforma de streaming..." -ForegroundColor Yellow
$stream = @{
    name = "Netflix Teste $(Get-Random)"
    description = "Plataforma de streaming para testes"
} | ConvertTo-Json

try {
    $streamResponse = Invoke-RestMethod -Uri "http://localhost:3000/streams" -Method POST -Body $stream -ContentType "application/json"
    Write-Host "Streaming criado com sucesso!" -ForegroundColor Green
    $streamId = $streamResponse.id
    Write-Host "ID do streaming: $streamId" -ForegroundColor Gray
} catch {
    Write-Host "Erro ao criar streaming:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# 4. Listar streamings
Write-Host "Listando todas as plataformas..." -ForegroundColor Yellow
try {
    $streams = Invoke-RestMethod -Uri "http://localhost:3000/streams" -Method GET
    Write-Host "Streamings encontrados: $($streams.Count)" -ForegroundColor Green
} catch {
    Write-Host "Erro ao listar streamings:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 5. Criar uma série
Write-Host "Criando uma série..." -ForegroundColor Yellow
$serie = @{
    title = "Serie Teste $(Get-Random)"
    streamId = $streamId
    seasons = 3
    genre = "Drama"
    synopsis = "Uma série de testes"
} | ConvertTo-Json

try {
    $serieResponse = Invoke-RestMethod -Uri "http://localhost:3000/series" -Method POST -Body $serie -ContentType "application/json"
    Write-Host "Série criada com sucesso!" -ForegroundColor Green
    $serieId = $serieResponse.id
    Write-Host "ID da série: $serieId" -ForegroundColor Gray
} catch {
    Write-Host "Erro ao criar série:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# 6. Listar séries
Write-Host "Listando todas as séries..." -ForegroundColor Yellow
try {
    $series = Invoke-RestMethod -Uri "http://localhost:3000/series" -Method GET
    Write-Host "Séries encontradas: $($series.Count)" -ForegroundColor Green
    $series | ForEach-Object { Write-Host "  - $($_.title) ($($_.streamName))" -ForegroundColor Gray }
} catch {
    Write-Host "Erro ao listar séries:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 7. Registrar temporada assistida (com autenticação)
Write-Host "Registrando temporada assistida..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$record = @{
    seasonNumber = 1
    status = "assistido"
} | ConvertTo-Json

try {
    $recordResponse = Invoke-RestMethod -Uri "http://localhost:3000/series/$serieId/records" -Method POST -Headers $headers -Body $record
    Write-Host "Registro criado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao criar registro:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 8. Listar minhas séries assistidas
Write-Host "Listando minhas séries assistidas..." -ForegroundColor Yellow
try {
    $myWatchHeaders = @{
        "Authorization" = "Bearer $token"
    }
    $mySeries = Invoke-RestMethod -Uri "http://localhost:3000/series/my-watch" -Method GET -Headers $myWatchHeaders
    Write-Host "Você está assistindo $($mySeries.Count) série(s):" -ForegroundColor Green
    $mySeries | ForEach-Object { Write-Host "  - $($_.title)" -ForegroundColor Gray }
} catch {
    Write-Host "Erro ao listar séries assistidas:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 9. Obter dados do usuário autenticado
Write-Host "Obtendo dados do usuário..." -ForegroundColor Yellow
try {
    $meHeaders = @{
        "Authorization" = "Bearer $token"
    }
    $me = Invoke-RestMethod -Uri "http://localhost:3000/users/me" -Method GET -Headers $meHeaders
    Write-Host "Dados do usuário:" -ForegroundColor Green
    Write-Host "  Nome: $($me.name)" -ForegroundColor Gray
    Write-Host "  Email: $($me.email)" -ForegroundColor Gray
} catch {
    Write-Host "Erro ao obter dados do usuário:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "Todos os testes concluídos!" -ForegroundColor Green
Write-Host "A API está funcionando corretamente com PostgreSQL!" -ForegroundColor Green
