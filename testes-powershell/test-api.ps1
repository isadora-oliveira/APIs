# 🧪 Script de Teste da API

Write-Host "Iniciando testes da API..." -ForegroundColor Cyan

# 1. Testar endpoint raiz
Write-Host "`n1. Testando endpoint raiz (GET /)..." -ForegroundColor Yellow
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
Write-Host "`n2. Registrando um novo usuario..." -ForegroundColor Yellow
$uniqueEmail = "teste$(Get-Random)@email.com"
$user = @{
    name = "Usuario Teste"
    email = $uniqueEmail
    password = "senha123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/users/register" -Method POST -Body $user -ContentType "application/json"
    Write-Host "Usuario registrado com sucesso!" -ForegroundColor Green
    $token = $registerResponse.token
    Write-Host "Email: $uniqueEmail" -ForegroundColor Gray
    Write-Host "Token gerado: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "Erro ao registrar usuario:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# 3. Criar uma plataforma de streaming
Write-Host "`n3. Criando plataforma de streaming..." -ForegroundColor Yellow
$stream = @{
    name = "Amazon Prime $(Get-Random)"
    description = "Plataforma de streaming da amazon"
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
Write-Host "`n4. Listando todas as plataformas..." -ForegroundColor Yellow
try {
    $streams = Invoke-RestMethod -Uri "http://localhost:3000/streams" -Method GET
    Write-Host "Streamings encontrados: $($streams)" -ForegroundColor Green
} catch {
    Write-Host "Erro ao listar streamings:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 5. Criar uma série
Write-Host "`n5. Criando uma serie..." -ForegroundColor Yellow
$serie = @{
    title = "Glee $(Get-Random)"
    streamId = $streamId
    seasons = 9
    genre = "Musical"
    synopsis = "Uma série de musical"
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
Write-Host "`n6. Listando todas as series..." -ForegroundColor Yellow
try {
    $series = Invoke-RestMethod -Uri "http://localhost:3000/series" -Method GET
    Write-Host "Séries encontradas: $($series.Count)" -ForegroundColor Green
    $series | ForEach-Object { Write-Host "  - $($_.title) ($($_.streamName))" -ForegroundColor Gray }
} catch {
    Write-Host "Erro ao listar séries:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 7. Registrar temporada assistida (com autenticação)
Write-Host "`n7. Registrando temporada assistida..." -ForegroundColor Yellow
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
Write-Host "`n8. Listando minhas series assistidas..." -ForegroundColor Yellow
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
Write-Host "`n9. Obtendo dados do usuario..." -ForegroundColor Yellow
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

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTES DE CASOS DE ERRO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# TESTE 10: Criar streaming sem nome (campo obrigatorio)
Write-Host "`n10. Tentando criar streaming sem nome (deve falhar)..." -ForegroundColor Yellow
$invalidStream = @{
    description = "Streaming sem nome"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/streams" -Method POST -Body $invalidStream -ContentType "application/json"
    Write-Host "FALHOU: Deveria ter retornado erro 400" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*400*" -or $_.Exception.Message -like "*obrigatorio*") {
        Write-Host "OK: Erro 400 - Nome obrigatorio" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# TESTE 11: Criar streaming com nome duplicado
Write-Host "`n11. Tentando criar streaming com nome duplicado (deve falhar)..." -ForegroundColor Yellow
$duplicateStream = @{
    name = $streamResponse.name
    description = "Tentativa de duplicar"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/streams" -Method POST -Body $duplicateStream -ContentType "application/json"
    Write-Host "FALHOU: Deveria ter retornado erro 409" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*409*" -or $_.Exception.Message -like "*ja esta em uso*") {
        Write-Host "OK: Erro 409 - Nome ja existe" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# TESTE 12: Buscar streaming inexistente
Write-Host "`n12. Tentando buscar streaming inexistente (deve falhar)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/streams/99999" -Method GET
    Write-Host "FALHOU: Deveria ter retornado erro 404" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*404*" -or $_.Exception.Message -like "*nao encontrado*") {
        Write-Host "OK: Erro 404 - Streaming nao encontrado" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# TESTE 13: Criar serie sem campos obrigatorios
Write-Host "`n13. Tentando criar serie sem campos obrigatorios (deve falhar)..." -ForegroundColor Yellow
$invalidSerie = @{
    title = "Serie Incompleta"
    seasons = 3
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/series" -Method POST -Body $invalidSerie -ContentType "application/json"
    Write-Host "FALHOU: Deveria ter retornado erro 400" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*400*" -or $_.Exception.Message -like "*obrigatorio*") {
        Write-Host "OK: Erro 400 - Campos obrigatorios faltando" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# TESTE 14: Criar serie com streaming inexistente
Write-Host "`n14. Tentando criar serie com streaming inexistente (deve falhar)..." -ForegroundColor Yellow
$invalidStreamSerie = @{
    title = "Serie Sem Stream"
    streamId = 99999
    seasons = 3
    genre = "Drama"
    synopsis = "Teste"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/series" -Method POST -Body $invalidStreamSerie -ContentType "application/json"
    Write-Host "FALHOU: Deveria ter retornado erro 404" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*404*" -or $_.Exception.Message -like "*nao encontrado*") {
        Write-Host "OK: Erro 404 - Streaming nao encontrado" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# TESTE 15: Criar serie duplicada
Write-Host "`n15. Tentando criar serie duplicada (deve falhar)..." -ForegroundColor Yellow
$duplicateSerie = @{
    title = $serieResponse.title
    streamId = $streamId
    seasons = 3
    genre = "Drama"
    synopsis = "Duplicada"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/series" -Method POST -Body $duplicateSerie -ContentType "application/json"
    Write-Host "FALHOU: Deveria ter retornado erro 409" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*409*" -or $_.Exception.Message -like "*ja existe*") {
        Write-Host "OK: Erro 409 - Serie ja existe" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# TESTE 16: Registrar usuario com email duplicado
Write-Host "`n16. Tentando registrar usuario com email duplicado (deve falhar)..." -ForegroundColor Yellow
$duplicateUser = @{
    name = "Usuario Duplicado"
    email = $uniqueEmail
    password = "senha123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/users/register" -Method POST -Body $duplicateUser -ContentType "application/json"
    Write-Host "FALHOU: Deveria ter retornado erro 409" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*409*" -or $_.Exception.Message -like "*ja esta em uso*") {
        Write-Host "OK: Erro 409 - Email ja cadastrado" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# TESTE 17: Login com senha incorreta
Write-Host "`n17. Tentando fazer login com senha incorreta (deve falhar)..." -ForegroundColor Yellow
$wrongPassword = @{
    email = $uniqueEmail
    password = "senhaerrada"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/users/login" -Method POST -Body $wrongPassword -ContentType "application/json"
    Write-Host "FALHOU: Deveria ter retornado erro 401" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*invalida*") {
        Write-Host "OK: Erro 401 - Senha invalida" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# TESTE 18: Login com email inexistente
Write-Host "`n18. Tentando fazer login com email inexistente (deve falhar)..." -ForegroundColor Yellow
$wrongEmail = @{
    email = "naoexiste@email.com"
    password = "senha123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/users/login" -Method POST -Body $wrongEmail -ContentType "application/json"
    Write-Host "FALHOU: Deveria ter retornado erro 401" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*invalida*") {
        Write-Host "OK: Erro 401 - Email invalido" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# TESTE 19: Acessar rota protegida sem token
Write-Host "`n19. Tentando acessar rota protegida sem token (deve falhar)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/users/me" -Method GET
    Write-Host "FALHOU: Deveria ter retornado erro 401" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*nao fornecido*") {
        Write-Host "OK: Erro 401 - Token nao fornecido" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# TESTE 20: Acessar rota protegida com token invalido
Write-Host "`n20. Tentando acessar rota protegida com token invalido (deve falhar)..." -ForegroundColor Yellow
$invalidHeaders = @{
    "Authorization" = "Bearer tokeninvalido123"
}

try {
    Invoke-RestMethod -Uri "http://localhost:3000/users/me" -Method GET -Headers $invalidHeaders
    Write-Host "FALHOU: Deveria ter retornado erro 401" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*invalido*") {
        Write-Host "OK: Erro 401 - Token invalido" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# TESTE 21: Marcar temporada com numero invalido (maior que o total)
Write-Host "`n21. Tentando marcar temporada invalida (deve falhar)..." -ForegroundColor Yellow
$invalidSeason = @{
    seasonNumber = 999
    status = "assistindo"
} | ConvertTo-Json

$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    Invoke-RestMethod -Uri "http://localhost:3000/series/$serieId/records" -Method POST -Headers $authHeaders -Body $invalidSeason
    Write-Host "FALHOU: Deveria ter retornado erro 400" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*400*" -or $_.Exception.Message -like "*invalido*") {
        Write-Host "OK: Erro 400 - Numero de temporada invalido" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# TESTE 22: Marcar mesma temporada duas vezes (duplicado)
Write-Host "`n22. Tentando marcar mesma temporada novamente (deve falhar)..." -ForegroundColor Yellow
$duplicateRecord = @{
    seasonNumber = 1
    status = "concluido"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/series/$serieId/records" -Method POST -Headers $authHeaders -Body $duplicateRecord
    Write-Host "FALHOU: Deveria ter retornado erro 409" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*409*" -or $_.Exception.Message -like "*ja existe*") {
        Write-Host "OK: Erro 409 - Registro duplicado" -ForegroundColor Green
    } else {
        Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TODOS OS TESTES CONCLUIDOS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Testes de sucesso: 9" -ForegroundColor White
Write-Host "Testes de erro: 13" -ForegroundColor White
Write-Host "Total: 22 testes" -ForegroundColor White
