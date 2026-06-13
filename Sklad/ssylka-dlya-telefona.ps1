# Pokazat ssylku Sklad dlya telefona v lokalnoj seti
$ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
        $_.IPAddress -notlike "127.*" -and
        $_.IPAddress -notlike "169.254.*"
    } |
    Select-Object -ExpandProperty IPAddress

Write-Host ""
Write-Host "=== Sklad na telefone ===" -ForegroundColor Cyan
Write-Host ""

if ($ips) {
    foreach ($ip in $ips) {
        Write-Host "  http://${ip}:4174" -ForegroundColor Green
    }
} else {
    Write-Host "IPv4 ne nayden. Zapustite: ipconfig" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Na PK: http://localhost:4174" -ForegroundColor Cyan
Write-Host "Rezhim telefona: Telefon (sklad)" -ForegroundColor Gray
Write-Host ""
