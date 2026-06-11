Set-Location $PSScriptRoot
Write-Host "Sklad: http://localhost:4174" -ForegroundColor Cyan
Write-Host "Ne zakryvayte eto okno, poka rabotaete." -ForegroundColor Yellow

if (Get-Command py -ErrorAction SilentlyContinue) {
    py -m http.server 4174
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    python -m http.server 4174
} else {
    Write-Host "Python ne nayden. Ustanovite s https://www.python.org/downloads/" -ForegroundColor Red
    Read-Host "Enter"
}
