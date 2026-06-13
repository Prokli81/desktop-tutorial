@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Sklad - sozdat papku android
echo.
echo ========================================
echo   Sozdaem papku android dlya Sklad
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [!!] Node.js ne ustanovlen
    echo Skachayte: https://nodejs.org/  ^(LTS^)
    echo Perezapustite etot fayl posle ustanovki.
    pause
    exit /b 1
)

echo Node: 
node --version
echo.

if not exist "package.json" (
    echo [!!] Net package.json v etoj papke.
    echo Skachayte polnyj Sklad iz GitHub ^(sm. nizhe^).
    pause
    exit /b 1
)

echo [1/3] npm install...
call npm install
if errorlevel 1 goto :err

if exist "android" (
    echo Papka android uzhe est - obnovlyaem...
) else (
    echo [2/3] Sozdaem papku android...
    call npx cap add android
    if errorlevel 1 goto :err
)

echo [3/3] Sinhronizaciya...
call npm run cap:sync
if errorlevel 1 goto :err

echo.
echo ========================================
echo   GOTOVO!
echo   Papka: %CD%\android
echo ========================================
echo.
echo Teper v Android Studio:
echo   Open -^> %CD%\android
echo.
pause
exit /b 0

:err
echo.
echo Oshibka. Nuzhen Node.js i internet.
pause
exit /b 1
