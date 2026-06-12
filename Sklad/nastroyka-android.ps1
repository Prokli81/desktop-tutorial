# Sklad — avtonastroyka posle ustanovki Android Studio (Windows)
# Zapusk: pravyy klik -> Vypolnit s PowerShell
# ili: powershell -ExecutionPolicy Bypass -File nastroyka-android.ps1

$ErrorActionPreference = "Continue"
$SkladRoot = if ($PSScriptRoot) { $PSScriptRoot } else { "C:\Users\Grimm\sklad" }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SKLAD — nastroyka Android (shag za shagom)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Pause-Step($msg) {
    Write-Host ""
    Write-Host $msg -ForegroundColor Yellow
    Read-Host "Nazhmite Enter, kogda sdelali"
}

# --- 1. Node.js ---
Write-Host "[1/6] Node.js..." -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  Node.js NE ustanovlen." -ForegroundColor Red
    Write-Host "  Skachayte i ustanovite: https://nodejs.org/ (LTS)" -ForegroundColor Yellow
    Write-Host "  Perezapustite PowerShell i zapustite etot skript snova."
    Pause-Step "Ustanovite Node.js, zatem Enter"
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) { exit 1 }
}
Write-Host "  OK: $(node --version)" -ForegroundColor Green

Set-Location $SkladRoot
if (-not (Test-Path "$SkladRoot\index.html")) {
    Write-Host "  Papka Sklad ne naydena: $SkladRoot" -ForegroundColor Red
    exit 1
}

# --- 2. Android SDK path ---
Write-Host "[2/6] Android SDK..." -ForegroundColor Cyan
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
if (-not (Test-Path $sdk)) {
    Write-Host "  SDK poka ne nayden: $sdk" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  SDELAYTE V ANDROID STUDIO (odin raz):" -ForegroundColor White
    Write-Host "  1) Otkroyte Android Studio" -ForegroundColor White
    Write-Host "  2) Esli master: Next -> Standard -> Next -> Finish" -ForegroundColor White
    Write-Host "  3) Dozhdites 'Downloading...' do konca" -ForegroundColor White
    Write-Host "  4) File -> Settings -> Languages -> Russian (po zhelaniyu)" -ForegroundColor DarkGray
    Write-Host "  5) File -> Settings -> Android SDK -> ubedites chto stoit galochka Android SDK" -ForegroundColor White
    Write-Host ""
    Pause-Step "Posle pervogo zapuska Android Studio nazhmite Enter"
    if (-not (Test-Path $sdk)) {
        Write-Host "  SDK vse eshche net. Perezapustite Android Studio i dozhdites zagruzki." -ForegroundColor Red
        exit 1
    }
}
Write-Host "  OK: $sdk" -ForegroundColor Green

# Peremennye sredy dlya etoy sessii
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$platformTools = Join-Path $sdk "platform-tools"
if (Test-Path $platformTools) {
    $env:Path = "$platformTools;$env:Path"
}

# local.properties dlya Gradle
$localProps = Join-Path $SkladRoot "android\local.properties"
if (Test-Path (Join-Path $SkladRoot "android")) {
    $sdkEscaped = $sdk -replace '\\', '\\'
    Set-Content -Path $localProps -Value "sdk.dir=$sdk`n" -Encoding UTF8
    Write-Host "  Sozdan android\local.properties" -ForegroundColor Green
}

# --- 3. npm ---
Write-Host "[3/6] npm install..." -ForegroundColor Cyan
if (-not (Test-Path "$SkladRoot\package.json")) {
    Write-Host "  Net package.json — obnovite papku Sklad iz repozitoriya" -ForegroundColor Red
    exit 1
}
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host "  OK" -ForegroundColor Green

# --- 4. Capacitor sync ---
Write-Host "[4/6] Podgotovka Android proekta..." -ForegroundColor Cyan
if (-not (Test-Path "$SkladRoot\android")) {
    npx cap add android
}
npm run cap:sync
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host "  OK" -ForegroundColor Green

# --- 5. Gradle (esli poluchitsya) ---
Write-Host "[5/6] Probnaya sborka APK (mozhet zanyat 5-15 min pervyy raz)..." -ForegroundColor Cyan
$gradlew = Join-Path $SkladRoot "android\gradlew.bat"
if (Test-Path $gradlew) {
    Push-Location (Join-Path $SkladRoot "android")
    & .\gradlew.bat assembleDebug
    $buildOk = $LASTEXITCODE -eq 0
    Pop-Location
    if ($buildOk) {
        $apk = Join-Path $SkladRoot "android\app\build\outputs\apk\debug\app-debug.apk"
        Write-Host ""
        Write-Host "  APK GOTOVO!" -ForegroundColor Green
        Write-Host "  Fayl: $apk" -ForegroundColor Green
        Write-Host "  Skopiruyte na telefon i ustanovite." -ForegroundColor Green
        if (Test-Path $apk) { explorer.exe "/select,$apk" }
    } else {
        Write-Host "  Avtosborka ne udalas — otkroem Android Studio vruchnuyu." -ForegroundColor Yellow
    }
} else {
    Write-Host "  gradlew.bat ne nayden" -ForegroundColor Yellow
}

# --- 6. Android Studio ---
Write-Host "[6/6] Android Studio..." -ForegroundColor Cyan
$studio = @(
    "${env:ProgramFiles}\Android\Android Studio\bin\studio64.exe",
    "${env:LocalAppData}\Programs\Android\Android Studio\bin\studio64.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($studio) {
    Write-Host "  Otkryvaem proekt Sklad v Android Studio..." -ForegroundColor Green
    Write-Host "  Esli APK uzhe sobran — Studio ne obyazatelna." -ForegroundColor DarkGray
    Start-Process $studio -ArgumentList (Join-Path $SkladRoot "android")
    Write-Host ""
    Write-Host "  V Studio (esli sborka ne proshla):" -ForegroundColor White
    Write-Host "  - Dozhdites 'Gradle Sync Finished'" -ForegroundColor White
    Write-Host "  - Build -> Build Bundle(s) / APK(s) -> Build APK(s)" -ForegroundColor White
} else {
    Write-Host "  Android Studio ne naydena — otkroyte vruchnuyu papku:" -ForegroundColor Yellow
    Write-Host "  $SkladRoot\android" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Na telefone: ustanovite app-debug.apk" -ForegroundColor Cyan
Write-Host "  Na PK: python -m http.server 4174 -> PK (ofis)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Enter dlya vyhoda"
