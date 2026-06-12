# Proverka Android Studio i SDK dlya sborki Sklad APK
Write-Host ""
Write-Host "=== Proverka Android Studio (Sklad) ===" -ForegroundColor Cyan
Write-Host ""

$ok = $true

function Test-Cmd($name, $args, $label) {
    try {
        $out = & $name $args 2>&1 | Out-String
        if ($LASTEXITCODE -eq 0 -or $out -match "\d") {
            Write-Host "[OK] $label" -ForegroundColor Green
            if ($out.Trim()) { Write-Host "     $($out.Trim().Split("`n")[0])" -ForegroundColor DarkGray }
            return $true
        }
    } catch {}
    Write-Host "[--] $label - ne naydeno" -ForegroundColor Yellow
    return $false
}

# Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Node.js: $(node --version)" -ForegroundColor Green
} else {
    Write-Host "[!!] Node.js ne ustanovlen - https://nodejs.org/" -ForegroundColor Red
    $ok = $false
}

# npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "[OK] npm: $(npm --version)" -ForegroundColor Green
} else {
    Write-Host "[!!] npm ne nayden" -ForegroundColor Red
    $ok = $false
}

# Android Studio (tipichnye puti)
$studioPaths = @(
    "${env:ProgramFiles}\Android\Android Studio\bin\studio64.exe",
    "${env:LocalAppData}\Programs\Android\Android Studio\bin\studio64.exe"
)
$studioFound = $false
foreach ($p in $studioPaths) {
    if (Test-Path $p) {
        Write-Host "[OK] Android Studio: $p" -ForegroundColor Green
        $studioFound = $true
        break
    }
}
if (-not $studioFound) {
    Write-Host "[??] Android Studio exe ne nayden v standartnyh putyah" -ForegroundColor Yellow
    Write-Host "     Esli Studio otkryvaetsya - eto normalno" -ForegroundColor DarkGray
}

# ANDROID_HOME / SDK
$sdkRoots = @(
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT,
    "$env:LOCALAPPDATA\Android\Sdk"
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique

if ($sdkRoots) {
    foreach ($sdk in $sdkRoots) {
        Write-Host "[OK] Android SDK: $sdk" -ForegroundColor Green
    }
} else {
    Write-Host "[!!] Android SDK ne nayden" -ForegroundColor Red
    Write-Host "     Otkroyte Android Studio -> SDK Manager -> ustanovite Android SDK" -ForegroundColor Yellow
    $ok = $false
}

# adb
$adb = Get-Command adb -ErrorAction SilentlyContinue
if ($adb) {
    Write-Host "[OK] adb: $($adb.Source)" -ForegroundColor Green
} elseif ($sdkRoots) {
    $adbPath = Join-Path $sdkRoots[0] "platform-tools\adb.exe"
    if (Test-Path $adbPath) {
        Write-Host "[OK] adb: $adbPath" -ForegroundColor Green
        Write-Host "     Dobavte v PATH: $($sdkRoots[0])\platform-tools" -ForegroundColor DarkGray
    } else {
        Write-Host "[--] adb ne nayden - ustanovite SDK Platform-Tools" -ForegroundColor Yellow
    }
}

# Sklad project
$sklad = "C:\Users\Grimm\sklad"
if (Test-Path "$sklad\android\gradlew.bat") {
    Write-Host "[OK] Proekt Sklad android: $sklad\android" -ForegroundColor Green
} else {
    Write-Host "[!!] Net papki android v $sklad" -ForegroundColor Red
    Write-Host "     Skachayte obnovlennyj Sklad iz repozitoriya" -ForegroundColor Yellow
    $ok = $false
}

if (Test-Path "$sklad\package.json") {
    Write-Host "[OK] package.json est" -ForegroundColor Green
} else {
    Write-Host "[!!] Net package.json - obnovite papku sklad" -ForegroundColor Red
    $ok = $false
}

Write-Host ""
if ($ok) {
    Write-Host "Mozhno sobirat APK:" -ForegroundColor Green
    Write-Host "  cd C:\Users\Grimm\sklad" -ForegroundColor Cyan
    Write-Host "  podgotovka-apk.bat" -ForegroundColor Cyan
    Write-Host "  npx cap open android" -ForegroundColor Cyan
    Write-Host "  Build -> Build APK" -ForegroundColor Cyan
} else {
    Write-Host "Ispravte punkty [!!] i zapustite skript snova" -ForegroundColor Yellow
}
Write-Host ""
Read-Host "Enter"
