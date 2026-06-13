# Proverka Python posle ustanovki dlya Sklad
Write-Host "=== Sklad: proverka Python ===" -ForegroundColor Cyan

$pythonCmd = $null
foreach ($cmd in @("python", "py")) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        $ver = & $cmd --version 2>&1
        if ($ver -match "Python 3") {
            $pythonCmd = $cmd
            Write-Host "OK: $ver (komanda: $cmd)" -ForegroundColor Green
            break
        }
    }
}

if (-not $pythonCmd) {
    Write-Host "Python 3 ne nayden." -ForegroundColor Red
    Write-Host "1) Perezapustite PowerShell posle ustanovki"
    Write-Host "2) Parametry > Prilozheniya > Psevdonimy: vyklyuchite python.exe"
    Write-Host "3) Pri ustanovke dolzhna byt galochka Add python.exe to PATH"
    Read-Host "Enter"
    exit 1
}

$skladPath = "C:\Users\Grimm\sklad"
if (-not (Test-Path "$skladPath\index.html")) {
    Write-Host "Papka $skladPath ne naydena ili net index.html" -ForegroundColor Yellow
    Write-Host "Skopiruyte fayly Sklad v etu papku."
    Read-Host "Enter"
    exit 1
}

Write-Host "Sklad: $skladPath" -ForegroundColor Green
Write-Host ""
Write-Host "Zapusk servera..." -ForegroundColor Cyan
Write-Host "Otkroyte v brauzere: http://localhost:4174" -ForegroundColor Yellow
Write-Host "Ne zakryvayte eto okno." -ForegroundColor Yellow
Write-Host ""

Set-Location $skladPath
& $pythonCmd -m http.server 4174
