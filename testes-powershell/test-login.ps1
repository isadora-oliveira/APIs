# 🔐 Script para Testar Login e Obter Token

Write-Host "TESTE DE LOGIN" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Solicitar credenciais
Write-Host "Digite as credenciais do usuário:" -ForegroundColor Yellow
$email = Read-Host "Email"
$password = Read-Host "Password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Preparar dados do login
$loginData = @{
    email = $email
    password = $passwordPlain
} | ConvertTo-Json

Write-Host "`n🔄 Tentando fazer login..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/users/login" -Method POST -Body $loginData -ContentType "application/json"
    
    Write-Host "LOGIN REALIZADO COM SUCESSO!" -ForegroundColor Green
    Write-Host "`n" + ("=" * 60) -ForegroundColor Green
    
    # Exibir dados do usuário
    Write-Host "DADOS DO USUÁRIO:" -ForegroundColor Cyan
    Write-Host "   ID: $($response.id)" -ForegroundColor White
    Write-Host "   Nome: $($response.name)" -ForegroundColor White
    Write-Host "   Email: $($response.email)" -ForegroundColor White
    
    # Exibir token completo
    Write-Host "TOKEN JWT:" -ForegroundColor Cyan
    Write-Host "   $($response.token)" -ForegroundColor Yellow
    
    # Copiar token para clipboard (se disponível)
    try {
        $response.token | Set-Clipboard
        Write-Host "`nToken copiado para a área de transferência!" -ForegroundColor Green
    } catch {
        Write-Host "`nNão foi possível copiar para área de transferência" -ForegroundColor Yellow
    }
    
    # Salvar token em arquivo
    $response.token | Out-File -FilePath ".\last-token.txt" -Encoding UTF8
    Write-Host "Token salvo em: last-token.txt" -ForegroundColor Green
    
    Write-Host "`n" + ("=" * 60) -ForegroundColor Green
    
    # Testar o token fazendo requisição autenticada
    Write-Host "`nTESTANDO TOKEN..." -ForegroundColor Cyan
    $headers = @{
        "Authorization" = "Bearer $($response.token)"
    }
    
    try {
        $me = Invoke-RestMethod -Uri "http://localhost:3000/users/me" -Method GET -Headers $headers
        Write-Host "Token válido! Você está autenticado como: $($me.name)" -ForegroundColor Green
    } catch {
        Write-Host "Erro ao validar token" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`nERRO AO FAZER LOGIN" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*401*") {
        Write-Host "`n Dica: Email ou senha incorretos" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host "`nTeste concluído!" -ForegroundColor Green
