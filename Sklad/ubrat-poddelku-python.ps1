# Sklad: otklyuchit psevdonimy Python (Microsoft Store) i nayti nastoyashchiy Python
# Zapusk: PowerShell -> cd C:\Users\Grimm\sklad -> prawyy klik po faylu -> Vypolnit s PowerShell
# ili: powershell -ExecutionPolicy Bypass -File .\ubrat-poddelku-python.ps1

$ErrorActionPreference = "SilentlyContinue"
Write-Host ""
Write-Host "=== Sklad: ubiraem poddelku Python ===" -ForegroundColor Cyan
Write-Host ""

# 1. Otklyuchit App Execution Aliases (poddelka iz Microsoft Store)
$aliasRoot = "HKCU:\Software\Microsoft\Windows\CurrentVersion\App Execution Aliases"
$aliasNames = @("python.exe", "python3.exe", "python3.12.exe", "pythonw.exe", "pythonw3.exe")

if (-not (Test-Path $aliasRoot)) {
    New-Item -Path $aliasRoot -Force | Out-Null
    Write-Host "[+] Sozdan razdel psevdonimov" -ForegroundColor Yellow
}

foreach ($alias in $aliasNames) {
    $key = Join-Path $aliasRoot $alias
    if (-not (Test-Path $key)) {
        New-Item -Path $key -Force | Out-Null
    }
    Set-ItemProperty -Path $key -Name "Enabled" -Value 0 -Type DWord -Force
    Write-Host "[OK] Psevdonim vyklyuchen: $alias" -ForegroundColor Green
}

# 2. Poisk ustanovlennogo Python na diske
Write-Host ""
Write-Host "=== Poisk Python na kompyutere ===" -ForegroundColor Cyan

$searchRoots = @(
    "$env:LOCALAPPDATA\Programs\Python",
    "$env:ProgramFiles\Python*",
    "${env:ProgramFiles(x86)}\Python*",
    "C:\Python*"
)

$found = @()
foreach ($pattern in $searchRoots) {
  Get-ChildItem -Path $pattern -Filter "python.exe" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        $found += $_.FullName
    }
}

$found = $found | Select-Object -Unique

if ($found.Count -gt 0) {
    Write-Host "Naydeno:" -ForegroundColor Green
    $found | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "Python na diske ne nayden." -ForegroundColor Yellow
    Write-Host "Ustanovite s https://www.python.org/downloads/ (fayl .exe)"
    Write-Host "Galochka: Add python.exe to PATH"
}

# 3. Proverka komand posle otklyucheniya psevdonimov
Write-Host ""
Write-Host "=== Proverka komand ===" -ForegroundColor Cyan

$refresh = $env:Path
foreach ($cmd in @("py", "python", "python3")) {
    $exe = Get-Command $cmd -ErrorAction SilentlyContinue
    if ($exe) {
        $ver = & $cmd --version 2>&1
        Write-Host "[OK] $cmd -> $ver" -ForegroundColor Green
        Write-Host "     Put: $($exe.Source)"
    } else {
        Write-Host "[--] $cmd ne nayden" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "=== Chto delat dalshe ===" -ForegroundColor Cyan
Write-Host "1. ZAKROYTE eto okno PowerShell i otkroyte NOVOE"
Write-Host "2. Vypolnite:  python --version"
Write-Host "3. Esli OK:      cd C:\Users\Grimm\sklad"
Write-Host "                 python -m http.server 4174"
Write-Host "4. Brauzer:      http://localhost:4174"
Write-Host ""
Read-Host "Nazhmite Enter"
