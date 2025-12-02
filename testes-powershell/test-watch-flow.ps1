# Script para testar o fluxo completo de séries assistidas

Write-Host "`nTESTE DO FLUXO DE SERIES ASSISTIDAS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

# 1. Obter token
Write-Host "`n1. Obtendo token..." -ForegroundColor Yellow
$token = Get-Content .\last-token.txt
$headers = @{ "Authorization" = "Bearer $token" }
Write-Host "Token carregado!" -ForegroundColor Green

# 2. Listar todas as séries disponíveis
Write-Host "`n2. Series disponiveis:" -ForegroundColor Yellow
$series = Invoke-RestMethod -Uri "http://localhost:3000/series" -Method GET
$series | ForEach-Object {
    Write-Host "   [$($_.id)] $($_.title) - $($_.seasons) temporadas ($($_.streamName))" -ForegroundColor White
}

# 3. Verificar séries já assistidas
Write-Host "`n3. Suas series assistidas ANTES:" -ForegroundColor Yellow
try {
    $mySeries = Invoke-RestMethod -Uri "http://localhost:3000/series/my-watch" -Method GET -Headers $headers
    if ($mySeries.Count -eq 0) {
        Write-Host "   Nenhuma serie marcada ainda" -ForegroundColor Gray
    } else {
        $mySeries | ForEach-Object {
            Write-Host "   - $($_.title)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "   Erro ao buscar: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Marcar uma série como assistindo (se houver séries disponíveis)
if ($series.Count -gt 0) {
    $serieId = $series[0].id
    $serieTitulo = $series[0].title
    
    Write-Host "`n4. Marcando temporada 1 de '$serieTitulo' como assistindo..." -ForegroundColor Yellow
    
    $body = @{
        seasonNumber = 1
        status = "assistindo"
    } | ConvertTo-Json
    
    try {
        $record = Invoke-RestMethod -Uri "http://localhost:3000/series/$serieId/records" -Method POST -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "   Registro criado com sucesso!" -ForegroundColor Green
        Write-Host "   ID do registro: $($record.id)" -ForegroundColor Gray
    } catch {
        if ($_.Exception.Message -like "*409*" -or $_.Exception.Message -like "*já existe*") {
            Write-Host "   Temporada ja estava marcada!" -ForegroundColor Yellow
        } else {
            Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 5. Verificar séries assistidas DEPOIS
Write-Host "`n5. Suas series assistidas DEPOIS:" -ForegroundColor Yellow
try {
    $mySeriesAfter = Invoke-RestMethod -Uri "http://localhost:3000/series/my-watch" -Method GET -Headers $headers
    if ($mySeriesAfter.Count -eq 0) {
        Write-Host "   Nenhuma serie encontrada" -ForegroundColor Gray
    } else {
        $mySeriesAfter | ForEach-Object {
            Write-Host "   - $($_.title) (ID: $($_.id))" -ForegroundColor White
        }
    }
} catch {
    Write-Host "   Erro ao buscar: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Ver detalhes dos registros de uma série
if ($mySeriesAfter.Count -gt 0) {
    $serieId = $mySeriesAfter[0].id
    Write-Host "`n6. Detalhes das temporadas assistidas de '$($mySeriesAfter[0].title)':" -ForegroundColor Yellow
    
    try {
        $records = Invoke-RestMethod -Uri "http://localhost:3000/series/$serieId/records" -Method GET -Headers $headers
        $records | ForEach-Object {
            Write-Host "   Temporada $($_.season_number): $($_.status)" -ForegroundColor White
        }
    } catch {
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "TESTE CONCLUIDO!" -ForegroundColor Green
