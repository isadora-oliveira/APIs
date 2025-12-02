# Script para Obter Token JWT via Login

param(
    [string]$email = "teste@email.com",
    [string]$password = "senha123"
)

Write-Host "`nOBTENDO TOKEN PARA: $email" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

$loginData = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/users/login" -Method POST -Body $loginData -ContentType "application/json"
    
    Write-Host "`nLOGIN REALIZADO COM SUCESSO!" -ForegroundColor Green
    Write-Host "`nUsuario: $($response.name)" -ForegroundColor White
    Write-Host "`nTOKEN JWT:" -ForegroundColor Cyan
    Write-Host "$($response.token)" -ForegroundColor Yellow
    
    # Salvar token
    $response.token | Out-File -FilePath ".\last-token.txt" -Encoding UTF8
    Write-Host "`nToken salvo em: last-token.txt" -ForegroundColor Green
    
    # Tentar copiar para clipboard
    try {
        $response.token | Set-Clipboard
        Write-Host "Token copiado para area de transferencia!" -ForegroundColor Green
    } catch {}
    
    Write-Host "`n" + ("=" * 60) -ForegroundColor Green
    
} catch {
    Write-Host "`nERRO: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
