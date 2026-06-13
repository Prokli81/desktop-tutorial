# Ustanovka Flutter SDK + podskazka dlya VS Code (Windows)
# Zapusk: powershell -ExecutionPolicy Bypass -File ustanovit-flutter.ps1

$ErrorActionPreference = "Continue"
$FlutterRoot = "C:\Users\Grimm\flutter"
$ZipUrl = "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.29.3-stable.zip"
$ZipFile = "$env:TEMP\flutter_windows-stable.zip"

Write-Host ""
Write-Host "=== Ustanovka Flutter ===" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "$FlutterRoot\bin\flutter.bat") {
    Write-Host "[OK] Flutter uzhe est: $FlutterRoot" -ForegroundColor Green
} else {
    Write-Host "[1/4] Skachivayu Flutter SDK (~1 GB, podozhdite)..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path (Split-Path $FlutterRoot) | Out-Null
    Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipFile -UseBasicParsing

    Write-Host "[2/4] Raspakovka v $FlutterRoot ..." -ForegroundColor Cyan
    if (Test-Path $FlutterRoot) { Remove-Item $FlutterRoot -Recurse -Force }
    Expand-Archive -Path $ZipFile -DestinationPath (Split-Path $FlutterRoot) -Force
    Remove-Item $ZipFile -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Flutter raspakovan" -ForegroundColor Green
}

# PATH
$binPath = "$FlutterRoot\bin"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$binPath*") {
    Write-Host "[3/4] Dobavlyayu Flutter v PATH..." -ForegroundColor Cyan
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$binPath", "User")
    $env:Path = "$env:Path;$binPath"
    Write-Host "[OK] PATH obnovlen (novyy terminal primenet)" -ForegroundColor Green
} else {
    $env:Path = "$env:Path;$binPath"
    Write-Host "[OK] Flutter uzhe v PATH" -ForegroundColor Green
}

Write-Host "[4/4] flutter doctor..." -ForegroundColor Cyan
& "$binPath\flutter.bat" doctor

Write-Host ""
Write-Host "=== Gotovo ===" -ForegroundColor Green
Write-Host "Perezapustite VS Code, zatem F5 ili zadacha Flutter." -ForegroundColor White
Write-Host "Flutter SDK: $FlutterRoot" -ForegroundColor DarkGray
Write-Host ""
